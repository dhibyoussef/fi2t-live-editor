<?php

/**
 * Restore per-language CMS text after accidental `_all` promote.
 * Keeps images/positions on `_all`. Re-seeds EN/AR translations.
 *
 *   php scripts/patch_restore_content_locales.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;
use Database\Seeders\FillAllContentLocalesSeeder;

$moved = 0;
$deletedAll = 0;

ContentBlock::query()
    ->where('locale', '_all')
    ->whereIn('type', ['text', 'json'])
    ->orderBy('id')
    ->each(function (ContentBlock $block) use (&$moved, &$deletedAll) {
        $isSharedKey = $block->key === 'badge_pos'
            || str_ends_with((string) $block->key, '_pos')
            || str_ends_with((string) $block->key, '_alt')
            || $block->key === 'per_page';

        if ($isSharedKey) {
            return;
        }

        $value = (string) $block->value;

        // Fix corrupted hero title test edits
        if ($block->page === 'home' && $block->section === 'hero' && $block->key === 'title') {
            $value = 'Le futur du tourisme tunisien se construit ici !';
        }

        ContentBlock::updateOrCreate(
            [
                'page' => $block->page,
                'section' => $block->section,
                'key' => $block->key,
                'locale' => 'fr',
            ],
            [
                'type' => $block->type,
                'label' => $block->label,
                'value' => $value,
                'sort_order' => $block->sort_order,
            ]
        );
        $moved++;

        $block->delete();
        $deletedAll++;
    });

echo "moved {$moved} _all text/json → fr\n";
echo "deleted {$deletedAll} shared text/json rows\n";

// Ensure FR hero is clean
ContentBlock::updateOrCreate(
    ['page' => 'home', 'section' => 'hero', 'key' => 'title', 'locale' => 'fr'],
    [
        'type' => 'text',
        'label' => 'Hero — Titre',
        'value' => 'Le futur du tourisme tunisien se construit ici !',
        'sort_order' => 0,
    ]
);

echo "Running FillAllContentLocalesSeeder…\n";
(new FillAllContentLocalesSeeder())->run();

foreach (['fr', 'en', 'ar'] as $loc) {
    $flat = ContentBlock::flatForPage('home', $loc);
    echo "{$loc} hero.title = " . ($flat['hero.title'] ?? 'MISSING') . "\n";
}
