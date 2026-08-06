<?php

/**
 * Normalize home badge_pos to shared LTR defaults (mirrored in CSS/JS for RTL).
 *
 *   php scripts/patch_badge_pos_rtl.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

$defaults = [
    'about' => ['left' => -29, 'bottom' => -43],
    'adherer' => ['right' => -26, 'bottom' => -41],
];

foreach ($defaults as $section => $pos) {
    ContentBlock::updateOrCreate(
        [
            'page' => 'home',
            'section' => $section,
            'key' => 'badge_pos',
            'locale' => '_all',
        ],
        [
            'type' => 'json',
            'label' => $section === 'about' ? 'Badge 10+ — Position' : 'Badge 50+ — Position',
            'value' => json_encode($pos),
            'sort_order' => 50,
        ]
    );
    $deleted = ContentBlock::where('page', 'home')
        ->where('section', $section)
        ->where('key', 'badge_pos')
        ->whereIn('locale', ['fr', 'en', 'ar'])
        ->delete();
    echo "{$section}.badge_pos → _all " . json_encode($pos) . " (removed {$deleted} locale rows)\n";
}
