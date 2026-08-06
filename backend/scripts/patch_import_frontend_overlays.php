<?php

/**
 * Import frontend EN/AR overlays into CMS DB (overwrites locale rows).
 *
 *   1) cd website && npx tsx scripts/dump-locale-overlays.ts
 *   2) php scripts/patch_import_frontend_overlays.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

$path = __DIR__ . '/data/frontend-locale-overlays.json';
if (! is_file($path)) {
    fwrite(STDERR, "Missing {$path}. Run website dump script first.\n");
    exit(1);
}

$data = json_decode(file_get_contents($path), true);
if (! is_array($data)) {
    fwrite(STDERR, "Invalid JSON\n");
    exit(1);
}

$skipKey = static function (string $key): bool {
    return str_ends_with($key, '.image')
        || str_ends_with($key, '.img')
        || str_ends_with($key, '.icon')
        || str_ends_with($key, '.bg')
        || str_ends_with($key, '_pos')
        || str_ends_with($key, '_alt')
        || $key === 'header.logo'
        || str_contains($key, '.image');
};

$n = 0;
foreach (['en', 'ar'] as $locale) {
    foreach ($data[$locale] ?? [] as $page => $blocks) {
        if (! is_array($blocks)) {
            continue;
        }
        foreach ($blocks as $compound => $value) {
            if (! is_string($compound) || ! is_string($value)) {
                continue;
            }
            if ($skipKey($compound)) {
                continue;
            }
            if (! str_contains($compound, '.')) {
                continue;
            }
            [$section, $key] = explode('.', $compound, 2);
            $fr = ContentBlock::query()
                ->where(['page' => $page, 'section' => $section, 'key' => $key, 'locale' => 'fr'])
                ->first();

            $type = $fr?->type;
            if (! $type) {
                $trimmed = ltrim($value);
                $type = ($trimmed !== '' && ($trimmed[0] === '[' || $trimmed[0] === '{')) ? 'json' : 'text';
            }

            ContentBlock::updateOrCreate(
                [
                    'page' => $page,
                    'section' => $section,
                    'key' => $key,
                    'locale' => $locale,
                ],
                [
                    'type' => $type,
                    'label' => $fr?->label ?? ucfirst($section) . ' — ' . $key,
                    'value' => $value,
                    'sort_order' => $fr?->sort_order ?? 0,
                ]
            );
            $n++;
        }
    }
}

echo "Imported {$n} EN/AR overlay rows\n";

$sample = ContentBlock::flatForPage('hebergements-alternatifs', 'ar');
echo 'heb hero.title = ' . ($sample['hero.title'] ?? 'MISSING') . "\n";
echo 'heb intro.body = ' . mb_substr((string) ($sample['intro.body'] ?? 'MISSING'), 0, 80) . "\n";

$contact = ContentBlock::flatForPage('contact', 'ar');
echo 'contact form.placeholder_email = ' . ($contact['form.placeholder_email'] ?? 'MISSING') . "\n";
echo 'contact info.items starts = ' . mb_substr((string) ($contact['info.items'] ?? 'MISSING'), 0, 60) . "\n";
