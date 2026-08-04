<?php

namespace Database\Seeders;

use App\Models\CmsSection;
use App\Models\ContentBlock;
use Illuminate\Database\Seeder;

/**
 * Aligns "Structure de la page" with what each page actually renders.
 *
 * The section list is not hand-written here: it is read off the live site by
 * `website/scripts/export-page-structure.mjs`, which walks the DOM and records
 * every `data-cms-block` marker in document order. Seeding that back means the
 * back-office lists the same bands, in the same order, as a visitor scrolling
 * the page — nothing missing, nothing invented.
 *
 * Refresh the JSON with:
 *   cd website && node scripts/export-page-structure.mjs
 */
class PageStructureSeeder extends Seeder
{
    private const DATA = __DIR__ . '/data/page-structure.json';

    public function run(): void
    {
        if (! is_file(self::DATA)) {
            $this->command?->warn('page-structure.json missing — run the website export script first.');

            return;
        }

        $pages = json_decode((string) file_get_contents(self::DATA), true);

        if (! is_array($pages)) {
            $this->command?->error('page-structure.json is not valid JSON.');

            return;
        }

        $added = 0;

        foreach ($pages as $page => $sections) {
            $keep = [];

            foreach ($sections as $section) {
                $keep[] = $section['slug'];

                CmsSection::updateOrCreate(
                    ['page' => $page, 'slug' => $section['slug']],
                    [
                        'title' => $section['title'],
                        'pattern' => $section['pattern'],
                        'sort_order' => $section['sort_order'],
                    ]
                );

                /*
                 * Backfill only. A field the site renders from its bundled
                 * default has no database row, so the back-office would show
                 * the band as empty; existing rows may hold edits and are
                 * left untouched.
                 */
                foreach ($section['values'] ?? [] as $locale => $values) {
                    foreach ($values as $key => $value) {
                        // A shared `_all` row is the source of truth for every
                        // locale (notably uploaded images and paging settings).
                        $hasSharedValue = ContentBlock::where([
                            'page' => $page,
                            'section' => $section['slug'],
                            'key' => $key,
                            'locale' => '_all',
                        ])->exists();
                        if ($hasSharedValue) {
                            continue;
                        }

                        $created = ContentBlock::firstOrCreate(
                            [
                                'page' => $page,
                                'section' => $section['slug'],
                                'key' => $key,
                                'locale' => $locale,
                            ],
                            [
                                'type' => self::blockType($key, $value),
                                'label' => $section['title'],
                                'value' => $value,
                                'sort_order' => $section['sort_order'],
                            ]
                        );
                        if ($created->wasRecentlyCreated) {
                            $added++;
                        }
                    }
                }

                // Blocks inherit their band's position so the admin lists them in page order.
                ContentBlock::where('page', $page)
                    ->where('section', $section['slug'])
                    ->update(['sort_order' => $section['sort_order']]);

                /*
                 * Fields the band no longer has — `info.address` after the
                 * contact rows became a list, for instance. The export only
                 * omits a key when the site neither renders it nor ships a
                 * default for it, so anything left here is genuinely unused.
                 */
                $dead = ContentBlock::where('page', $page)
                    ->where('section', $section['slug'])
                    ->whereNotIn('key', $section['keys'])
                    ->pluck('key')
                    ->unique();

                if ($dead->isNotEmpty()) {
                    ContentBlock::where('page', $page)
                        ->where('section', $section['slug'])
                        ->whereIn('key', $dead)
                        ->delete();
                    $this->command?->warn("  {$page}.{$section['slug']}: dropped unused field(s) " . $dead->implode(', '));
                }
            }

            /*
             * Bands the page no longer renders (an empty "Contenu" placeholder,
             * a section that was renamed) would otherwise sit in the admin
             * forever, offering fields that reach nothing.
             */
            $stale = CmsSection::where('page', $page)->whereNotIn('slug', $keep)->pluck('slug');

            if ($stale->isNotEmpty()) {
                ContentBlock::where('page', $page)->whereIn('section', $stale)->delete();
                CmsSection::where('page', $page)->whereIn('slug', $stale)->delete();
                $this->command?->warn("  {$page}: dropped stale band(s) " . $stale->implode(', '));
            }

            $this->command?->info(sprintf('%-20s %d sections', $page, count($sections)));
        }

        $this->command?->info("Backfilled {$added} missing block(s).");
    }

    /** Images and JSON need their own editor in the back-office. */
    private static function blockType(string $key, string $value): string
    {
        if (in_array($key, ['image', 'bg', 'banner', 'logo'], true) || str_ends_with($key, '_image')) {
            return 'image';
        }

        return str_starts_with(ltrim($value), '[') || str_starts_with(ltrim($value), '{')
            ? 'json'
            : 'text';
    }
}
