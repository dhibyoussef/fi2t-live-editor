<?php

/**
 * Flatten Tourisme des Séniors CMS bands (*.data → title/sub/items)
 * so the live page can use click-to-edit like Thalasso.
 *
 *   php scripts/patch_tourisme_senior.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-senior';

$bands = [
    'pourquoi' => [
        'title' => 'Pourquoi — Titre',
        'sub' => 'Pourquoi — Sous-titre',
        'items' => 'Pourquoi — Cartes',
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
    ],
    'services' => [
        'title' => 'Services — Titre',
        'sub' => 'Services — Sous-titre',
        'items' => 'Services — Cartes',
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
    ],
    'defis' => [
        'title' => 'Défis — Titre',
        'sub' => 'Défis — Sous-titre',
        'items' => 'Défis — Cartes',
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
    ],
    'roadmap' => [
        'title' => 'Feuille de route — Titre',
        'body' => 'Feuille de route — Texte',
        'items' => 'Feuille de route — Étapes',
        'map' => ['title' => 'title', 'body' => 'body', 'items' => 'items'],
    ],
];

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'pourquoi' => 'Pourquoi la Tunisie ?',
    'services' => 'Des Services Spécialisés & Humains',
    'defis' => 'Défis & Engagements',
    'roadmap' => 'Feuille de Route Stratégique',
];

foreach ($sectionTitles as $slug => $title) {
    CmsSection::updateOrCreate(
        ['page' => $page, 'slug' => $slug],
        [
            'page' => $page,
            'slug' => $slug,
            'title' => $title,
            'pattern' => match ($slug) {
                'hero' => 'hero',
                'intro' => 'text',
                default => 'custom_band',
            },
            'sort_order' => array_search($slug, array_keys($sectionTitles), true) + 1,
        ]
    );
}

$created = 0;
$deleted = 0;

foreach ($bands as $section => $meta) {
    $dataBlocks = ContentBlock::where('page', $page)
        ->where('section', $section)
        ->where('key', 'data')
        ->get();

    foreach ($dataBlocks as $block) {
        $decoded = json_decode((string) $block->value, true);
        if (! is_array($decoded)) {
            echo "SKIP {$section}.data {$block->locale} (invalid JSON)\n";
            continue;
        }

        foreach ($meta['map'] as $field => $jsonKey) {
            if (! array_key_exists($jsonKey, $decoded)) {
                continue;
            }
            $value = $decoded[$jsonKey];
            $isJson = is_array($value);
            $stored = $isJson
                ? json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                : (string) $value;

            ContentBlock::updateOrCreate(
                [
                    'page' => $page,
                    'section' => $section,
                    'key' => $field,
                    'locale' => $block->locale,
                ],
                [
                    'type' => $isJson ? 'json' : 'text',
                    'label' => $meta[$field] ?? "{$section}.{$field}",
                    'value' => $stored,
                    'sort_order' => $block->sort_order,
                ]
            );
            $created++;
        }

        $block->delete();
        $deleted++;
        echo "flattened {$section}.data [{$block->locale}]\n";
    }
}

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'intro.body' => 'Introduction',
    'pourquoi.title' => 'Pourquoi — Titre',
    'pourquoi.sub' => 'Pourquoi — Sous-titre',
    'pourquoi.items' => 'Pourquoi — Cartes',
    'services.title' => 'Services — Titre',
    'services.sub' => 'Services — Sous-titre',
    'services.items' => 'Services — Cartes',
    'defis.title' => 'Défis — Titre',
    'defis.sub' => 'Défis — Sous-titre',
    'defis.items' => 'Défis — Cartes',
    'roadmap.title' => 'Feuille de route — Titre',
    'roadmap.body' => 'Feuille de route — Texte',
    'roadmap.items' => 'Feuille de route — Étapes',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', $page)
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

echo "created/updated {$created} flat block(s), deleted {$deleted} *.data, relabeled {$n}\n";
