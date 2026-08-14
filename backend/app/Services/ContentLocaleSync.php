<?php

namespace App\Services;

use App\Models\ContentBlock;

class ContentLocaleSync
{
    private const LOCALES = ['fr', 'en', 'ar'];

    private const SHARED_KEYS = [
        'slug', 'img', 'image', 'src', 'url', 'href', 'icon', 'date', 'id',
        'photo', 'banner', 'logo', 'file',
    ];

    public function __construct(private AutoTranslator $translator) {}

    private bool $deep = true;

    /**
     * Align other locales onto one source locale (no union — deletes stay deleted).
     *
     * @return array{pages:int, blocks:int, translated:int}
     */
    public function sync(?string $page = null, bool $translate = true, bool $deep = true, string $sourceLocale = 'fr'): array
    {
        $this->deep = $deep;
        $sourceLocale = $this->normalizeLocale($sourceLocale);

        $query = ContentBlock::query()->orderBy('page')->orderBy('section')->orderBy('key');
        if ($page) {
            $query->where('page', $page);
        }

        $groups = [];
        foreach ($query->get() as $block) {
            $id = "{$block->page}\0{$block->section}\0{$block->key}";
            $groups[$id][] = $block;
        }

        $pages = [];
        $touched = 0;
        $translated = 0;

        foreach ($groups as $rows) {
            /** @var list<ContentBlock> $rows */
            $first = $rows[0];
            $pages[$first->page] = true;
            $type = $first->type ?: 'text';

            if ($type === 'image') {
                $touched += $this->syncImage($rows);
                continue;
            }

            $byLocale = [];
            foreach ($rows as $row) {
                $byLocale[$row->locale] = $row;
            }

            $sourceValue = $byLocale[$sourceLocale]->value
                ?? $byLocale['fr']->value
                ?? $byLocale['_all']->value
                ?? null;

            $pack = $this->writeFromSource(
                $first->page,
                $first->section,
                $first->key,
                $type,
                $sourceLocale,
                $sourceValue,
                $sourceValue,
                $first->label,
                (int) $first->sort_order,
                $translate,
                false,
            );
            $touched += $pack['touched'];
            $translated += $pack['translated'];
        }

        return [
            'pages' => count($pages),
            'blocks' => $touched,
            'translated' => $translated,
        ];
    }

    /**
     * After a save: source locale is canonical. Adds/deletes/reorder apply to
     * every language. Changed text is translated onto the others.
     *
     * @return array{touched:int, translated:int}
     */
    public function propagateSaved(
        string $page,
        string $section,
        string $key,
        string $type,
        string $sourceLocale,
        ?string $previousValue,
        ?string $newValue,
        ?string $label,
        int $sortOrder,
        bool $translate = true,
    ): array {
        $sourceLocale = $this->normalizeLocale($sourceLocale);
        if ($type === 'image') {
            $this->upsert($page, $section, $key, '_all', 'image', $newValue, $label, $sortOrder);
            ContentBlock::query()
                ->where('page', $page)
                ->where('section', $section)
                ->where('key', $key)
                ->whereIn('locale', self::LOCALES)
                ->delete();

            return ['touched' => 1, 'translated' => 0];
        }

        return $this->writeFromSource(
            $page,
            $section,
            $key,
            $type,
            $sourceLocale,
            $previousValue,
            $newValue,
            $label,
            $sortOrder,
            $translate,
            true,
        );
    }

    /**
     * @return array{touched:int, translated:int}
     */
    private function writeFromSource(
        string $page,
        string $section,
        string $key,
        string $type,
        string $sourceLocale,
        ?string $previousValue,
        ?string $newValue,
        ?string $label,
        int $sortOrder,
        bool $translate,
        bool $overwriteChanged,
    ): array {
        $this->upsert($page, $section, $key, $sourceLocale, $type, $newValue, $label, $sortOrder);

        $translated = 0;
        $touched = 1;

        foreach (self::LOCALES as $locale) {
            if ($locale === $sourceLocale) {
                continue;
            }
            $existing = ContentBlock::query()
                ->where('page', $page)
                ->where('section', $section)
                ->where('key', $key)
                ->where('locale', $locale)
                ->value('value');

            if ($type === 'json') {
                $pack = $this->mapJson(
                    $previousValue,
                    $newValue,
                    is_string($existing) ? $existing : null,
                    $sourceLocale,
                    $locale,
                    $translate,
                    $overwriteChanged,
                );
                $value = json_encode($pack['value'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $translated += $pack['translated'];
            } else {
                $pack = $this->mapText(
                    $previousValue,
                    $newValue,
                    is_string($existing) ? $existing : null,
                    $sourceLocale,
                    $locale,
                    $translate,
                    $overwriteChanged,
                );
                $value = $pack['value'];
                $translated += $pack['translated'];
            }

            $this->upsert($page, $section, $key, $locale, $type, $value, $label, $sortOrder);
            $touched++;
        }

        return ['touched' => $touched, 'translated' => $translated];
    }

    /** @return array{value:string, translated:int} */
    private function mapText(
        ?string $previous,
        ?string $next,
        ?string $existing,
        string $from,
        string $to,
        bool $translate,
        bool $overwriteChanged,
    ): array {
        $next = (string) ($next ?? '');
        $existing = (string) ($existing ?? '');
        $changed = (string) ($previous ?? '') !== $next;

        if ($this->looksLikePath($next)) {
            return ['value' => $next, 'translated' => 0];
        }

        if ($overwriteChanged && $changed && $translate && $next !== '') {
            return ['value' => $this->translateSafe($next, $from, $to), 'translated' => 1];
        }

        if (trim($existing) !== '' && $existing !== $next) {
            return ['value' => $existing, 'translated' => 0];
        }

        if ($translate && $next !== '') {
            return ['value' => $this->translateSafe($next, $from, $to), 'translated' => 1];
        }

        return ['value' => $next, 'translated' => 0];
    }

    /** @return array{value:mixed, translated:int} */
    private function mapJson(
        ?string $previousRaw,
        ?string $nextRaw,
        ?string $existingRaw,
        string $from,
        string $to,
        bool $translate,
        bool $overwriteChanged,
    ): array {
        $next = json_decode((string) $nextRaw, true);
        $previous = json_decode((string) $previousRaw, true);
        $existing = json_decode((string) $existingRaw, true);
        if (! is_array($next)) {
            return ['value' => $next ?? [], 'translated' => 0];
        }

        return $this->alignNode($next, is_array($previous) ? $previous : null, is_array($existing) ? $existing : null, $from, $to, $translate, $overwriteChanged);
    }

    /** @return array{value:mixed, translated:int} */
    private function alignNode(
        mixed $source,
        mixed $previous,
        mixed $existing,
        string $from,
        string $to,
        bool $translate,
        bool $overwriteChanged,
        string $key = '',
    ): array {
        $translated = 0;

        if (is_array($source) && $this->isSlugList($source)) {
            $prevBy = $this->indexBySlug(is_array($previous) ? $previous : []);
            $existBy = $this->indexBySlug(is_array($existing) ? $existing : []);
            $out = [];
            foreach ($source as $item) {
                $slug = (string) ($item['slug'] ?? '');
                $pack = $this->alignNode(
                    $item,
                    $prevBy[$slug] ?? null,
                    $existBy[$slug] ?? null,
                    $from,
                    $to,
                    $translate,
                    $overwriteChanged,
                );
                $out[] = $pack['value'];
                $translated += $pack['translated'];
            }

            return ['value' => $out, 'translated' => $translated];
        }

        if (is_array($source) && array_is_list($source)) {
            $out = [];
            foreach ($source as $i => $row) {
                $pack = $this->alignNode(
                    $row,
                    is_array($previous) ? ($previous[$i] ?? null) : null,
                    is_array($existing) ? ($existing[$i] ?? null) : null,
                    $from,
                    $to,
                    $translate,
                    $overwriteChanged,
                );
                $out[] = $pack['value'];
                $translated += $pack['translated'];
            }

            return ['value' => $out, 'translated' => $translated];
        }

        if (is_array($source)) {
            $out = [];
            foreach ($source as $k => $v) {
                $pack = $this->alignNode(
                    $v,
                    is_array($previous) ? ($previous[$k] ?? null) : null,
                    is_array($existing) ? ($existing[$k] ?? null) : null,
                    $from,
                    $to,
                    $translate,
                    $overwriteChanged,
                    (string) $k,
                );
                $out[$k] = $pack['value'];
                $translated += $pack['translated'];
            }

            return ['value' => $out, 'translated' => $translated];
        }

        if (is_string($source)) {
            if ($this->isSharedKey($key) || $this->looksLikePath($source)) {
                return ['value' => $source, 'translated' => 0];
            }
            $prev = is_string($previous) ? $previous : '';
            $have = is_string($existing) ? $existing : '';
            $changed = $prev !== $source;

            if ($overwriteChanged && $changed && $translate && $source !== '') {
                return ['value' => $this->translateSafe($source, $from, $to), 'translated' => 1];
            }
            if (trim($have) !== '' && $have !== $source) {
                return ['value' => $have, 'translated' => 0];
            }
            if ($translate && $source !== '' && ($this->deep || mb_strlen($source) <= 400)) {
                return ['value' => $this->translateSafe($source, $from, $to), 'translated' => 1];
            }

            return ['value' => $have !== '' ? $have : $source, 'translated' => 0];
        }

        return ['value' => $existing ?? $source, 'translated' => 0];
    }

    /** @param list<ContentBlock> $rows */
    private function syncImage(array $rows): int
    {
        $all = null;
        $first = $rows[0];
        foreach ($rows as $row) {
            if ($row->locale === '_all' && is_string($row->value) && $row->value !== '') {
                $all = $row;
                break;
            }
        }
        if (! $all) {
            foreach (self::LOCALES as $locale) {
                foreach ($rows as $row) {
                    if ($row->locale === $locale && is_string($row->value) && $row->value !== '') {
                        $all = $row;
                        break 2;
                    }
                }
            }
        }
        if (! $all) {
            return 0;
        }

        ContentBlock::updateOrCreate(
            [
                'page' => $first->page,
                'section' => $first->section,
                'key' => $first->key,
                'locale' => '_all',
            ],
            [
                'type' => 'image',
                'value' => $all->value,
                'label' => $first->label,
                'sort_order' => $first->sort_order,
            ]
        );
        ContentBlock::query()
            ->where('page', $first->page)
            ->where('section', $first->section)
            ->where('key', $first->key)
            ->whereIn('locale', self::LOCALES)
            ->delete();

        return 1;
    }

    /** @param  array<int|string, mixed>  $list */
    private function indexBySlug(array $list): array
    {
        $out = [];
        foreach ($list as $item) {
            if (is_array($item) && ! empty($item['slug'])) {
                $out[(string) $item['slug']] = $item;
            }
        }

        return $out;
    }

    private function isSlugList(array $source): bool
    {
        if (! array_is_list($source) || $source === []) {
            return false;
        }
        $first = $source[0];

        return is_array($first) && array_key_exists('slug', $first);
    }

    private function isSharedKey(string $key): bool
    {
        return in_array($key, self::SHARED_KEYS, true)
            || str_ends_with($key, '_pos')
            || str_ends_with($key, '_alt');
    }

    private function looksLikePath(string $value): bool
    {
        return (bool) preg_match('#^(https?:|/storage/|/images/|/fi2t/)#i', $value);
    }

    private function translateSafe(string $text, string $from, string $to): string
    {
        if ($from === $to || trim($text) === '') {
            return $text;
        }
        if (! $this->deep && mb_strlen($text) > 400) {
            return $text;
        }

        return $this->translator->translate($text, $from, $to);
    }

    private function normalizeLocale(string $locale): string
    {
        $locale = strtolower(trim($locale));

        return in_array($locale, self::LOCALES, true) ? $locale : 'fr';
    }

    private function upsert(
        string $page,
        string $section,
        string $key,
        string $locale,
        string $type,
        ?string $value,
        ?string $label,
        int $sortOrder,
    ): void {
        ContentBlock::updateOrCreate(
            compact('page', 'section', 'key', 'locale'),
            [
                'type' => $type,
                'value' => $value,
                'label' => $label,
                'sort_order' => $sortOrder,
            ]
        );
    }
}
