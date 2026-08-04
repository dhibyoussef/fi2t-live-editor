<?php

/**
 * Remove stored sequence fields (`num`, `number`) from CMS JSON lists.
 * Display order is always derived from array index on the public site.
 *
 *   php scripts/patch_strip_sequence_numbers.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

function stripSequenceFields(mixed $value): mixed
{
    if (is_array($value)) {
        $isList = array_is_list($value);
        $out = [];
        foreach ($value as $key => $child) {
            if (! $isList && ($key === 'num' || $key === 'number')) {
                continue;
            }
            $out[$key] = stripSequenceFields($child);
        }

        return $out;
    }

    return $value;
}

$updated = 0;
$blocks = ContentBlock::where('type', 'json')->get();

foreach ($blocks as $block) {
    $raw = (string) $block->value;
    if ($raw === '') {
        continue;
    }
    $decoded = json_decode($raw, true);
    if (! is_array($decoded)) {
        continue;
    }
    $clean = stripSequenceFields($decoded);
    $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    if (json_encode($clean, $flags) === json_encode($decoded, $flags)) {
        continue;
    }
    $block->update(['value' => json_encode($clean, $flags)]);
    $updated++;
    echo "{$block->page}.{$block->section}.{$block->key} [{$block->locale}]\n";
}

// Drop orphan fiche benefits band if a fresh seed recreated it.
$deadBlocks = App\Models\ContentBlock::where('page', 'fiche-adhesion')->where('section', 'benefits')->delete();
$deadSections = App\Models\CmsSection::where('page', 'fiche-adhesion')->where('slug', 'benefits')->delete();

echo "updated {$updated} json block(s)\n";
echo "dropped fiche benefits blocks={$deadBlocks} sections={$deadSections}\n";
