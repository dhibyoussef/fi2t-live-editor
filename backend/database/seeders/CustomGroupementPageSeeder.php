<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\ContentBlock;
use Illuminate\Database\Seeder;

/**
 * Pushes the Figma-custom groupement layouts into the CMS.
 *
 * Each page becomes one CMS section per band of the artboard (Bannière,
 * Atouts, Diagnostic, Plan de relance…) rather than a single opaque JSON
 * document, so the back-office shows the page's real structure. Pages built on
 * the same layout get exactly the same section list — only the content differs.
 *
 * The website renders these blocks when present and falls back to its bundled
 * TS defaults otherwise, so seeding never changes what visitors see.
 *
 * Source of truth: website/src/cms/defaults/groupement-custom-pages.ts
 * Refresh the JSON with:
 *   cd website && node scripts/export-custom-groupement-pages.mjs
 */
class CustomGroupementPageSeeder extends Seeder
{
    private const DATA = __DIR__ . '/data/custom-groupement-pages.json';

    /** The banner exists for every layout; introduction is added only when rendered. */
    private const BASE_SECTIONS = [
        'hero' => 'Bannière',
    ];

    public function run(): void
    {
        if (! is_file(self::DATA)) {
            $this->command?->warn('custom-groupement-pages.json missing — run the website export script first.');

            return;
        }

        $pages = json_decode((string) file_get_contents(self::DATA), true);

        if (! is_array($pages)) {
            $this->command?->error('custom-groupement-pages.json is not valid JSON.');

            return;
        }

        $sortOrder = CmsPage::max('sort_order') ?: 0;
        $blockCount = 0;

        foreach ($pages as $slug => $page) {
            $locales = $page['locales'] ?? [];
            $fr = $locales['fr'] ?? [];

            // The page row may be missing on databases seeded before a slug existed.
            if (! CmsPage::where('slug', $slug)->exists()) {
                CmsPage::create([
                    'slug' => $slug,
                    'title' => $fr['hero.title'] ?? $slug,
                    'status' => 'published',
                    'template' => 'default',
                    'is_system' => true,
                    'sort_order' => ++$sortOrder,
                ]);
            }

            $labels = self::BASE_SECTIONS;
            $hasIntro = collect($locales)->contains(
                fn ($blocks) => trim((string) ($blocks['intro.body'] ?? '')) !== ''
            ) || collect($page['sections'] ?? [])->contains(
                fn ($section) => ($section['id'] ?? null) === 'intro'
            );
            if ($hasIntro) {
                $labels['intro'] = 'Introduction';
            }
            foreach ($page['sections'] ?? [] as $section) {
                $labels[$section['id']] = $section['label'];
            }

            $order = [];
            foreach (array_keys($labels) as $i => $sectionSlug) {
                $order[$sectionSlug] = $i + 1;
            }

            foreach ($labels as $sectionSlug => $title) {
                CmsSection::updateOrCreate(
                    ['page' => $slug, 'slug' => $sectionSlug],
                    [
                        'page' => $slug,
                        'slug' => $sectionSlug,
                        'title' => $title,
                        // Banner and intro render like every other page's; only
                        // the artboard bands are bespoke.
                        'pattern' => match ($sectionSlug) {
                            'hero' => 'hero',
                            'intro' => 'text',
                            default => 'custom_band',
                        },
                        'sort_order' => $order[$sectionSlug],
                    ]
                );
            }

            foreach ($locales as $locale => $blocks) {
                foreach ($blocks as $blockKey => $value) {
                    if (trim((string) $value) === '') {
                        continue;
                    }
                    [$section, $key] = array_pad(explode('.', $blockKey, 2), 2, 'value');
                    $stored = $value;
                    $trimmed = ltrim((string) $value);
                    $isJson = in_array($key, ['data', 'items', 'stats', 'children'], true)
                        || str_starts_with($trimmed, '[')
                        || str_starts_with($trimmed, '{');
                    $isImage = ! $isJson && (
                        in_array($key, ['image', 'img', 'photo', 'face'], true)
                        || str_starts_with($trimmed, '/images/')
                        || str_starts_with($trimmed, '/storage/')
                        || (bool) preg_match('/\.(jpe?g|png|webp|gif|svg)(\?|$)/i', $trimmed)
                    );

                    if ($isJson) {
                        $decoded = json_decode((string) $value, true);
                        if (is_array($decoded)) {
                            $stored = json_encode(
                                self::stripSequenceFields($decoded),
                                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
                            );
                        }
                    }

                    $label = self::blockLabel($section, $key, $labels[$section] ?? $section);

                    if ($isImage) {
                        // Shared across locales — drop any leftover per-locale text rows.
                        ContentBlock::where('page', $slug)
                            ->where('section', $section)
                            ->where('key', $key)
                            ->where('locale', '!=', '_all')
                            ->delete();

                        ContentBlock::updateOrCreate(
                            [
                                'page' => $slug,
                                'section' => $section,
                                'key' => $key,
                                'locale' => '_all',
                            ],
                            [
                                'type' => 'image',
                                'label' => $label,
                                'value' => $stored,
                                'sort_order' => $order[$section] ?? 0,
                            ]
                        );
                        $blockCount++;
                        continue;
                    }

                    ContentBlock::updateOrCreate(
                        [
                            'page' => $slug,
                            'section' => $section,
                            'key' => $key,
                            'locale' => $locale,
                        ],
                        [
                            'type' => $isJson ? 'json' : 'text',
                            'label' => $label,
                            'value' => $stored,
                            'sort_order' => $order[$section] ?? 0,
                        ]
                    );
                    $blockCount++;
                }
            }

            /*
             * Bands the schema no longer derives: the pre-split `custom.page`
             * blob, and keys that used to be filed under a band of their own
             * before they were folded into the one the page renders them in
             * (`probs` into Problématiques, `eyebrow` into Introduction…).
             */
            $stale = CmsSection::where('page', $slug)
                ->whereNotIn('slug', array_keys($labels))
                ->pluck('slug');

            if ($stale->isNotEmpty()) {
                ContentBlock::where('page', $slug)->whereIn('section', $stale)->delete();
                CmsSection::where('page', $slug)->whereIn('slug', $stale)->delete();
                $this->command?->warn("  {$slug}: dropped stale band(s) " . $stale->implode(', '));
            }

            // Flat Agences-style keys: drop legacy `*.data` envelopes.
            if (in_array($page['layout'] ?? '', ['hebergements', 'culturel', 'hub', 'thalasso'], true)) {
                $dropped = ContentBlock::where('page', $slug)->where('key', 'data')->delete();
                if ($dropped) {
                    $this->command?->warn("  {$slug}: dropped legacy *.data blocks ({$dropped})");
                }
            }
        }

        $this->command?->info(sprintf(
            'Seeded %d custom groupement pages (%d blocks).',
            count($pages),
            $blockCount
        ));
    }

    /** Human labels for the Contenu website matrix / builder. */
    private static function blockLabel(string $section, string $key, string $sectionTitle): string
    {
        $map = [
            'title' => 'Titre',
            'sub' => 'Sous-titre',
            'body' => 'Texte',
            'lead' => 'Accroche',
            'copy' => 'Texte',
            'img' => 'Image',
            'image' => 'Image',
            'items' => 'Liste',
            'stats' => 'Chiffres',
            'children' => 'Filières',
            'eyebrow' => 'Surtitre',
            'cta' => 'Libellé CTA',
            'source' => 'Pôle source',
            'label' => 'Libellé',
            'to' => 'Lien',
            'value' => 'Valeur',
        ];

        $field = $map[$key] ?? $key;

        return "{$sectionTitle} — {$field}";
    }

    /** Sequence chrome is rendered from list order — never store num/number. */
    private static function stripSequenceFields(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        $isList = array_is_list($value);
        $out = [];
        foreach ($value as $key => $child) {
            if (! $isList && ($key === 'num' || $key === 'number')) {
                continue;
            }
            $out[$key] = self::stripSequenceFields($child);
        }

        return $out;
    }
}
