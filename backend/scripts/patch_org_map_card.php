<?php
/**
 * Point the regional map card at the icon-free / text-free asset. The icon and the
 * "11 Bureaux Régionaux" label are rendered live so they follow the active language.
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$rows = DB::table('content_blocks')
    ->where('page', 'organisation')
    ->where('section', 'regional')
    ->where('key', 'map_image')
    ->get();

foreach ($rows as $row) {
    echo "before [{$row->locale}] {$row->value}\n";
}

$n = DB::table('content_blocks')
    ->where('page', 'organisation')
    ->where('section', 'regional')
    ->where('key', 'map_image')
    ->update(['value' => '/images/org-regional-map-card.png?v=2', 'updated_at' => now()]);

echo "map_image rows updated: {$n}\n";

foreach (['fr', 'en', 'ar', '_all'] as $locale) {
    $label = DB::table('content_blocks')
        ->where('page', 'organisation')
        ->where('section', 'regional')
        ->where('key', 'map_label')
        ->where('locale', $locale)
        ->value('value');
    echo "map_label [{$locale}] " . ($label ?? '(none)') . "\n";
}
