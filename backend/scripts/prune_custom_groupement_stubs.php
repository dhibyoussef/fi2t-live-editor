<?php
/**
 * Remove the generic accordion-stub bands from the Figma-custom groupement
 * pages.
 *
 * Those pages render `GroupementCustomBody`, which never reads `positioning`,
 * `challenges`, `enjeux` or `proposals`. Leaving the rows behind makes the
 * back-office advertise a page structure that does not exist on the site.
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$data = json_decode((string) file_get_contents(__DIR__ . '/../database/seeders/data/custom-groupement-pages.json'), true);
$slugs = array_keys($data);

$dead = ['positioning', 'challenges', 'enjeux', 'proposals', 'custom'];

$blocks = DB::table('content_blocks')->whereIn('page', $slugs)->whereIn('section', $dead)->delete();
$sections = DB::table('cms_sections')->whereIn('page', $slugs)->whereIn('slug', $dead)->delete();

echo "pages: " . count($slugs) . "\n";
echo "removed blocks:   {$blocks}\n";
echo "removed sections: {$sections}\n";

foreach (['thalassotherapie', 'tourisme-de-sante'] as $slug) {
    $rows = DB::table('cms_sections')->where('page', $slug)->orderBy('sort_order')->pluck('title', 'slug');
    echo "\n{$slug}: " . json_encode($rows, JSON_UNESCAPED_UNICODE) . "\n";
}
