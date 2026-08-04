<?php

/**
 * Flatten Tourisme d'affaire CMS bands into click-editable flat keys.
 *
 *   php scripts/patch_tourisme_affaire.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-affaire';

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'mondial' => 'Poids Économique Mondial',
    'tn' => 'Poids Économique en Tunisie',
    'atouts' => 'Atouts Stratégiques',
    'diag' => 'Diagnostic',
    'axes' => 'Feuille de Route & Actions',
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
    'mondial' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Mondial — Titre',
            'items' => 'Mondial — Chiffres',
        ],
    ],
    'tn' => [
        'map' => ['title' => 'title', 'body' => 'body', 'stats' => 'stats'],
        'labels' => [
            'title' => 'Tunisie — Titre',
            'body' => 'Tunisie — Texte',
            'stats' => 'Tunisie — Chiffres',
        ],
    ],
    'atouts' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Atouts — Titre',
            'sub' => 'Atouts — Sous-titre',
            'items' => 'Atouts — Cartes',
        ],
    ],
    'diag' => [
        'map' => ['title' => 'title', 'body' => 'body', 'items' => 'items'],
        'labels' => [
            'title' => 'Diagnostic — Titre',
            'body' => 'Diagnostic — Texte',
            'items' => 'Diagnostic — Cartes',
        ],
    ],
    'axes' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Axes — Titre',
            'sub' => 'Axes — Sous-titre',
            'items' => 'Axes — Cartes',
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
    'mondial.title' => 'Mondial — Titre',
    'mondial.items' => 'Mondial — Chiffres',
    'tn.title' => 'Tunisie — Titre',
    'tn.body' => 'Tunisie — Texte',
    'tn.stats' => 'Tunisie — Chiffres',
    'atouts.title' => 'Atouts — Titre',
    'atouts.sub' => 'Atouts — Sous-titre',
    'atouts.items' => 'Atouts — Cartes',
    'diag.title' => 'Diagnostic — Titre',
    'diag.body' => 'Diagnostic — Texte',
    'diag.items' => 'Diagnostic — Cartes',
    'axes.title' => 'Axes — Titre',
    'axes.sub' => 'Axes — Sous-titre',
    'axes.items' => 'Axes — Cartes',
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
