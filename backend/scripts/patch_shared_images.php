<?php

/**
 * Remove per-locale image rows when a shared _all row exists.
 *
 *   php scripts/patch_shared_images.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;
use Illuminate\Support\Facades\DB;

$n = ContentBlock::query()
    ->where('type', 'image')
    ->whereIn('locale', ['fr', 'en', 'ar'])
    ->whereExists(function ($q) {
        $q->select(DB::raw(1))
            ->from('content_blocks as b2')
            ->whereColumn('b2.page', 'content_blocks.page')
            ->whereColumn('b2.section', 'content_blocks.section')
            ->whereColumn('b2.key', 'content_blocks.key')
            ->where('b2.locale', '_all');
    })
    ->delete();

echo "removed duplicate locale image rows: {$n}\n";

$n2 = ContentBlock::query()
    ->whereIn('key', ['badge_pos'])
    ->whereIn('locale', ['fr', 'en', 'ar'])
    ->whereExists(function ($q) {
        $q->select(DB::raw(1))
            ->from('content_blocks as b2')
            ->whereColumn('b2.page', 'content_blocks.page')
            ->whereColumn('b2.section', 'content_blocks.section')
            ->whereColumn('b2.key', 'content_blocks.key')
            ->where('b2.locale', '_all');
    })
    ->delete();

echo "removed duplicate locale badge_pos rows: {$n2}\n";
