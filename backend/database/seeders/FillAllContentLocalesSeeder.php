<?php

namespace Database\Seeders;

use App\Models\ContentBlock;
use Illuminate\Database\Seeder;

/**
 * Convert shared `_all` JSON → `fr`, then fill every empty EN/AR text|json
 * so all FI2T pages are fully multilingual.
 */
class FillAllContentLocalesSeeder extends Seeder
{
    /** @var array<string, true> */
    private array $mapKeys = [];

    public function run(): void
    {
        $this->migrateAllJsonToFr();
        $this->seedKnownMaps();
        $this->fillRemainingFromFrench();
    }

    private function migrateAllJsonToFr(): void
    {
        ContentBlock::query()
            ->where('locale', '_all')
            ->where('type', 'json')
            ->each(function (ContentBlock $block) {
                ContentBlock::updateOrCreate(
                    [
                        'page' => $block->page,
                        'section' => $block->section,
                        'key' => $block->key,
                        'locale' => 'fr',
                    ],
                    [
                        'type' => 'json',
                        'label' => $block->label,
                        'value' => $block->value,
                        'sort_order' => $block->sort_order,
                    ]
                );
                $block->delete();
            });
    }

    private function seedKnownMaps(): void
    {
        $maps = require __DIR__ . '/data/content-locale-maps.php';
        $this->mapKeys = [];

        foreach (['en', 'ar'] as $locale) {
            foreach ($maps[$locale] ?? [] as $page => $blocks) {
                foreach ($blocks as $compound => $value) {
                    [$section, $key] = explode('.', $compound, 2);
                    $this->mapKeys["{$locale}|{$page}|{$section}|{$key}"] = true;
                    $fr = ContentBlock::query()
                        ->where(['page' => $page, 'section' => $section, 'key' => $key, 'locale' => 'fr'])
                        ->first();

                    ContentBlock::updateOrCreate(
                        [
                            'page' => $page,
                            'section' => $section,
                            'key' => $key,
                            'locale' => $locale,
                        ],
                        [
                            'type' => $fr?->type ?? (str_ends_with($key, 'items') || in_array($key, ['pillars', 'reasons', 'members', 'staff'], true) ? 'json' : 'text'),
                            'label' => $fr?->label ?? ucfirst($section) . ' — ' . $key,
                            'value' => is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value,
                            'sort_order' => $fr?->sort_order ?? 0,
                        ]
                    );
                }
            }
        }
    }

    private function fillRemainingFromFrench(): void
    {
        $titles = require __DIR__ . '/data/groupement-title-i18n.php';
        $phrases = require __DIR__ . '/data/phrase-i18n.php';

        ContentBlock::query()
            ->where('locale', 'fr')
            ->whereIn('type', ['text', 'json'])
            ->orderBy('id')
            ->each(function (ContentBlock $fr) use ($titles, $phrases) {
                foreach (['en', 'ar'] as $locale) {
                    if (isset($this->mapKeys["{$locale}|{$fr->page}|{$fr->section}|{$fr->key}"])) {
                        continue;
                    }

                    $existing = ContentBlock::query()
                        ->where([
                            'page' => $fr->page,
                            'section' => $fr->section,
                            'key' => $fr->key,
                            'locale' => $locale,
                        ])
                        ->first();

                    if ($existing && trim((string) $existing->value) !== '' && ! $this->stillLooksFrench((string) $existing->value, $locale)) {
                        continue;
                    }

                    $value = $this->translateValue(
                        (string) $fr->value,
                        $fr->type,
                        $locale,
                        $fr->page,
                        $fr->section . '.' . $fr->key,
                        $titles,
                        $phrases
                    );

                    ContentBlock::updateOrCreate(
                        [
                            'page' => $fr->page,
                            'section' => $fr->section,
                            'key' => $fr->key,
                            'locale' => $locale,
                        ],
                        [
                            'type' => $fr->type,
                            'label' => $fr->label,
                            'value' => $value,
                            'sort_order' => $fr->sort_order,
                        ]
                    );
                }
            });
    }

    private function stillLooksFrench(string $value, string $locale): bool
    {
        if ($locale === 'fr') {
            return false;
        }

        // French leftovers after partial translation (titles OK, descriptions still FR)
        return (bool) preg_match(
            '/\b(des|les|pour|avec|dans|sur|une|est|sont|par|aux|du|de la|et|ou|comme|auprès|au sein|formation|intérêts|opérateurs|tourisme|cadre|renforcer|favoriser|passer|positionner|compétences)\b/iu',
            $value
        );
    }

    private function translateValue(
        string $value,
        string $type,
        string $locale,
        string $page,
        string $compound,
        array $titles,
        array $phrases
    ): string {
        // Proper names / contacts / phones / emails / images stay as-is
        if ($this->shouldKeepAsIs($value, $compound)) {
            return $value;
        }

        if ($type === 'json') {
            $decoded = json_decode($value, true);
            if (! is_array($decoded)) {
                return $this->translateText($value, $locale, $phrases);
            }
            $translated = $this->translateJson($decoded, $locale, $page, $titles, $phrases);

            return json_encode($translated, JSON_UNESCAPED_UNICODE);
        }

        // Groupement hero titles
        if ($compound === 'hero.title' && isset($titles[$value][$locale])) {
            return $titles[$value][$locale];
        }

        return $this->translateText($value, $locale, $phrases);
    }

    private function shouldKeepAsIs(string $value, string $compound): bool
    {
        $key = explode('.', $compound)[1] ?? '';
        if (in_array($key, ['email', 'phone', 'phone_1', 'phone_2', 'address', 'hotel_name'], true)) {
            return true;
        }
        if (preg_match('/^(\+?\d[\d\s.\-]{6,}|[\w.+-]+@[\w.-]+\.\w+)$/u', trim($value))) {
            return true;
        }

        return false;
    }

    private function translateJson(array $data, string $locale, string $page, array $titles, array $phrases): array
    {
        $out = [];
        foreach ($data as $k => $v) {
            if (is_array($v)) {
                $out[$k] = $this->translateJson($v, $locale, $page, $titles, $phrases);
            } elseif (is_string($v)) {
                if ($k === 'slug' || $k === 'icon' || $k === 'img' || $k === 'image' || $k === 'initials' || $k === 'num' || $k === 'number' || $k === 'value') {
                    $out[$k] = $v;
                } elseif ($k === 'label' && isset($titles[$v][$locale])) {
                    $out[$k] = $titles[$v][$locale];
                } elseif ($k === 'name' && ! preg_match('/[àâäéèêëïîôùûüç]/iu', $v)) {
                    // Likely a person name
                    $out[$k] = $v;
                } else {
                    $out[$k] = $this->translateText($v, $locale, $phrases);
                }
            } else {
                $out[$k] = $v;
            }
        }

        return $out;
    }

    private function translateText(string $text, string $locale, array $phrases): string
    {
        $map = $phrases[$locale] ?? [];
        if (isset($map[$text])) {
            return $map[$text];
        }

        // Longest-first phrase replace
        uksort($map, fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a));
        $result = str_replace(array_keys($map), array_values($map), $text);

        return $result;
    }
}
