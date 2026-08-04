<?php

/**
 * Print the CMS structure (pages → sections → block keys) for inspection.
 *
 *   php scripts/dump_cms_structure.php            # every page
 *   php scripts/dump_cms_structure.php home,contact
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$pages = isset($argv[1])
    ? explode(',', $argv[1])
    : DB::table('cms_pages')->orderBy('sort_order')->pluck('slug')->all();

foreach ($pages as $page) {
    $sections = DB::table('cms_sections')->where('page', $page)->orderBy('sort_order')->get();
    echo "\n=== {$page}  (" . count($sections) . " sections)\n";

    foreach ($sections as $section) {
        $keys = DB::table('content_blocks')
            ->where('page', $page)->where('section', $section->slug)
            ->distinct()->orderBy('key')->pluck('key')->implode(',');
        printf("  %-3s %-16s %-30s %-14s [%s]\n",
            $section->sort_order, $section->slug, $section->title ?? '-', $section->pattern ?? '-', $keys);
    }

    $orphans = DB::table('content_blocks')->where('page', $page)
        ->whereNotIn('section', $sections->pluck('slug'))
        ->distinct()->pluck('section');

    if (count($orphans)) {
        echo '  !! blocks with no section row: ' . $orphans->implode(', ') . "\n";
    }
}
