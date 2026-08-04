<?php
/**
 * Point the page heroes at the clean desert banner.
 *
 * The previous assets either had the French title baked into the photo (so it
 * could never be translated) or carried the white rectangle left behind when
 * that text was painted out. The title is rendered live over the photo now.
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$banner = '/images/desert-banner.jpg?v=1';
$pages  = ['actualites', 'fiche-adhesion', 'contact', 'qui-sommes-nous', 'organisation'];

foreach ($pages as $page) {
    $rows = DB::table('content_blocks')
        ->where('page', $page)
        ->where('section', 'hero')
        ->where('key', 'image')
        ->get();

    foreach ($rows as $row) {
        echo "before  {$page} [{$row->locale}]  {$row->value}\n";
    }

    $n = DB::table('content_blocks')
        ->where('page', $page)
        ->where('section', 'hero')
        ->where('key', 'image')
        ->update(['value' => $banner, 'updated_at' => now()]);

    echo "updated {$page}: {$n} row(s)\n";
}
