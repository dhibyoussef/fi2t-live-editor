<?php

/**
 * Flatten Tourisme golfique CMS bands into click-editable flat keys.
 *
 *   php scripts/patch_tourisme_golfique.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-golfique';

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'pot' => 'Potentiel Mondial',
    'banner' => 'Bandeau',
    'etat' => 'État des Lieux',
    'defis' => 'Défis Stratégiques',
    'roadmap' => 'Feuille de Route',
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
    'banner' => [
        'map' => ['text' => 'value'],
        'labels' => [
            'text' => 'Bandeau — Texte',
        ],
    ],
    'etat' => [
        'map' => [
            'title' => 'title',
            'body' => 'body',
            'stats' => 'stats',
            'box' => 'box',
            'boxLabel' => 'boxLabel',
            'boxSub' => 'boxSub',
        ],
        'labels' => [
            'title' => 'État — Titre',
            'body' => 'État — Texte',
            'stats' => 'État — Stats',
            'box' => 'État — Box valeur',
            'boxLabel' => 'État — Box libellé',
            'boxSub' => 'État — Box sous-texte',
        ],
    ],
    'defis' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Défis — Titre',
            'sub' => 'Défis — Sous-titre',
            'items' => 'Défis — Cartes',
        ],
    ],
    'roadmap' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Feuille de route — Titre',
            'sub' => 'Feuille de route — Sous-titre',
            'items' => 'Feuille de route — Actions',
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

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'intro.body' => 'Introduction',
    'pot.title' => 'Potentiel — Titre',
    'pot.sub' => 'Potentiel — Sous-titre',
    'pot.items' => 'Potentiel — Chiffres',
    'banner.text' => 'Bandeau — Texte',
    'etat.title' => 'État — Titre',
    'etat.body' => 'État — Texte',
    'etat.stats' => 'État — Stats',
    'etat.box' => 'État — Box valeur',
    'etat.boxLabel' => 'État — Box libellé',
    'etat.boxSub' => 'État — Box sous-texte',
    'defis.title' => 'Défis — Titre',
    'defis.sub' => 'Défis — Sous-titre',
    'defis.items' => 'Défis — Cartes',
    'roadmap.title' => 'Feuille de route — Titre',
    'roadmap.sub' => 'Feuille de route — Sous-titre',
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
