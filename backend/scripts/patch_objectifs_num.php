<?php

/**
 * Objectives are numbered from their position on the page, so the stored
 * `num` field is dead weight — and an editor who changed it would see nothing
 * happen. Drop it from every locale.
 *
 *   php scripts/patch_objectifs_num.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

$patched = 0;

foreach (ContentBlock::where('page', 'home')->where('section', 'objectifs')->where('key', 'items')->get() as $block) {
    $items = json_decode((string) $block->value, true);

    if (! is_array($items)) {
        continue;
    }

    $clean = array_map(function ($item) {
        if (is_array($item)) {
            unset($item['num']);
        }

        return $item;
    }, $items);

    if ($clean === $items) {
        continue;
    }

    $block->update(['value' => json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    $patched++;
    echo "cleaned {$block->locale}\n";
}

echo "patched {$patched} block(s)\n";
