<?php

/**
 * Flatten Tourisme thermal CMS bands + refresh place photo URLs.
 *
 *   php scripts/patch_tourisme_thermal.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-thermal';

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'pot' => 'Le Potentiel du Secteur',
    'real' => 'Réalité du Produit en Tunisie',
    'places' => 'Stations thermales',
    'defis' => 'Défis & Problématiques Structurelles',
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

$bands = [
    'pot' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Potentiel — Titre',
            'sub' => 'Potentiel — Sous-titre',
            'items' => 'Potentiel — Chiffres',
        ],
    ],
    'defis' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Défis — Titre',
            'items' => 'Défis — Cartes',
        ],
    ],
    'roadmap' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Feuille de route — Titre',
            'items' => 'Feuille de route — Actions',
        ],
    ],
    'places' => [
        'map' => ['items' => 'items'],
        'labels' => [
            'items' => 'Stations — Cartes',
        ],
    ],
];

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
            echo "SKIP {$section}.data {$block->locale}\n";
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
                    'label' => $meta['labels'][$field] ?? "{$section}.{$field}",
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

// Flat real.* fields may already exist as real.data — hydrate if present.
$realData = ContentBlock::where('page', $page)->where('section', 'real')->where('key', 'data')->get();
foreach ($realData as $block) {
    $decoded = json_decode((string) $block->value, true);
    if (! is_array($decoded)) {
        continue;
    }
    $map = [
        'title' => 'realTitle',
        'body' => 'realBody',
        'metricValue' => 'realMetricValue',
        'metricLabel' => 'realMetricLabel',
        'metricSub' => 'realMetricSub',
    ];
    // Schema uses title/body/metric* keys in opaque band
    $fieldMap = [
        'title' => 'title',
        'body' => 'body',
        'metricValue' => 'metricValue',
        'metricLabel' => 'metricLabel',
        'metricSub' => 'metricSub',
    ];
    foreach ($fieldMap as $field => $jsonKey) {
        if (! array_key_exists($jsonKey, $decoded)) {
            continue;
        }
        ContentBlock::updateOrCreate(
            [
                'page' => $page,
                'section' => 'real',
                'key' => $field,
                'locale' => $block->locale,
            ],
            [
                'type' => 'text',
                'label' => "Réalité — {$field}",
                'value' => (string) $decoded[$jsonKey],
                'sort_order' => $block->sort_order,
            ]
        );
        $created++;
    }
    $block->delete();
    $deleted++;
    echo "flattened real.data [{$block->locale}]\n";
}

// Bust place photo cache query in places.items
$photoMap = [
    'thermal-korbous-photo.jpg' => '/images/groupement-media/thermal-korbous-photo.jpg?v=8',
    'thermal-jebel-photo.jpg' => '/images/groupement-media/thermal-jebel-photo.jpg?v=8',
    'thermal-hammam-photo.jpg' => '/images/groupement-media/thermal-hammam-photo.jpg?v=8',
    'thermal-jerba-photo.jpg' => '/images/groupement-media/thermal-jerba-photo.jpg?v=8',
];

$placeBlocks = ContentBlock::where('page', $page)->where('section', 'places')->where('key', 'items')->get();
foreach ($placeBlocks as $block) {
    $items = json_decode((string) $block->value, true);
    if (! is_array($items)) {
        continue;
    }
    $changed = false;
    foreach ($items as &$item) {
        if (! is_array($item) || empty($item['img'])) {
            continue;
        }
        $img = (string) $item['img'];
        foreach ($photoMap as $needle => $replacement) {
            if (str_contains($img, $needle)) {
                if ($img !== $replacement) {
                    $item['img'] = $replacement;
                    $changed = true;
                }
                break;
            }
        }
    }
    unset($item);
    if ($changed) {
        $block->value = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $block->save();
        echo "refreshed places.items [{$block->locale}]\n";
    }
}

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'intro.body' => 'Introduction',
    'pot.title' => 'Potentiel — Titre',
    'pot.sub' => 'Potentiel — Sous-titre',
    'pot.items' => 'Potentiel — Chiffres',
    'real.title' => 'Réalité — Titre',
    'real.body' => 'Réalité — Texte',
    'real.metricValue' => 'Réalité — Valeur',
    'real.metricLabel' => 'Réalité — Libellé',
    'real.metricSub' => 'Réalité — Sous-texte',
    'places.items' => 'Stations — Cartes',
    'defis.title' => 'Défis — Titre',
    'defis.items' => 'Défis — Cartes',
    'roadmap.title' => 'Feuille de route — Titre',
    'roadmap.items' => 'Feuille de route — Actions',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', $page)
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

echo "created/updated {$created}, deleted {$deleted} *.data, relabeled {$n}\n";
