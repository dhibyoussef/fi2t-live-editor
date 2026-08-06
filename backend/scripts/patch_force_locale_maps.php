<?php

/**
 * Force-refresh EN/AR CMS text from content-locale-maps.php
 * (overwrites mixed/corrupt locale rows).
 *
 *   php scripts/patch_force_locale_maps.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

$maps = require __DIR__ . '/../database/seeders/data/content-locale-maps.php';
$n = 0;

foreach (['en', 'ar'] as $locale) {
    foreach ($maps[$locale] ?? [] as $page => $blocks) {
        foreach ($blocks as $compound => $value) {
            [$section, $key] = explode('.', $compound, 2);
            $fr = ContentBlock::query()
                ->where(['page' => $page, 'section' => $section, 'key' => $key, 'locale' => 'fr'])
                ->first();

            ContentBlock::updateOrCreate(
                [
                    'page' => $page,
                    'section' => $section,
                    'key' => $key,
                    'locale' => $locale,
                ],
                [
                    'type' => $fr?->type ?? (str_ends_with($key, 'items') || in_array($key, ['pillars', 'reasons', 'members', 'staff'], true) ? 'json' : 'text'),
                    'label' => $fr?->label ?? ucfirst($section) . ' — ' . $key,
                    'value' => is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value,
                    'sort_order' => $fr?->sort_order ?? 0,
                ]
            );
            $n++;
        }
    }
}

echo "Forced {$n} EN/AR map rows\n";

$ar = ContentBlock::query()
    ->where(['page' => 'home', 'section' => 'groupements', 'key' => 'items', 'locale' => 'ar'])
    ->value('value');
echo "AR groupements.items = {$ar}\n";
