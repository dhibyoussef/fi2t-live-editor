<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

foreach (['title', 'subtitle', 'cta_primary', 'cta_secondary'] as $key) {
    $fr = ContentBlock::where([
        'page' => 'home',
        'section' => 'hero',
        'key' => $key,
        'locale' => 'fr',
    ])->first();

    // Fall back to any existing row
    $src = $fr ?: ContentBlock::where([
        'page' => 'home',
        'section' => 'hero',
        'key' => $key,
    ])->orderByRaw("CASE locale WHEN '_all' THEN 0 WHEN 'fr' THEN 1 ELSE 2 END")->first();

    if (! $src) {
        echo "skip {$key}\n";
        continue;
    }

    ContentBlock::updateOrCreate(
        [
            'page' => 'home',
            'section' => 'hero',
            'key' => $key,
            'locale' => '_all',
        ],
        [
            'type' => 'text',
            'value' => $src->value,
            'label' => $src->label,
            'sort_order' => $src->sort_order ?? 0,
        ]
    );

    $d = ContentBlock::where([
        'page' => 'home',
        'section' => 'hero',
        'key' => $key,
    ])->whereIn('locale', ['fr', 'en', 'ar'])->delete();

    echo "hero.{$key} -> _all (removed {$d}) :: " . substr((string) $src->value, 0, 70) . "\n";
}
