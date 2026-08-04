<?php

/**
 * Flatten Tourisme médical CMS bands into click-editable flat keys.
 *
 *   php scripts/patch_tourisme_medical.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-medical';

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'adv' => 'Avantages',
    'origin' => 'Origine des patients',
    'bars' => 'Répartition',
    'donut' => 'Indicateur',
    'diag' => 'Diagnostic',
    'actions' => 'Actions',
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
    'adv' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Avantages — Titre',
            'items' => 'Avantages — Cartes',
        ],
    ],
    'origin' => [
        'map' => ['title' => 'title', 'sub' => 'sub'],
        'labels' => [
            'title' => 'Origine — Titre',
            'sub' => 'Origine — Sous-titre',
        ],
    ],
    'bars' => [
        'map' => ['items' => 'items'],
        'labels' => [
            'items' => 'Répartition — Barres',
        ],
    ],
    'donut' => [
        'map' => ['value' => 'value', 'label' => 'label'],
        'labels' => [
            'value' => 'Indicateur — Valeur',
            'label' => 'Indicateur — Libellé',
        ],
    ],
    'diag' => [
        'map' => ['intro' => 'intro', 'items' => 'items'],
        'labels' => [
            'intro' => 'Diagnostic — Intro',
            'items' => 'Diagnostic — Cartes',
        ],
    ],
    'actions' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Actions — Titre',
            'items' => 'Actions — Cartes',
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

            // Bars store pct as strings for EditableJsonList.
            if ($section === 'bars' && $field === 'items' && is_array($value)) {
                $value = array_map(static function ($row) {
                    if (! is_array($row)) {
                        return $row;
                    }
                    if (array_key_exists('pct', $row)) {
                        $row['pct'] = (string) $row['pct'];
                    }
                    if (! array_key_exists('fill', $row)) {
                        $row['fill'] = '';
                    }

                    return $row;
                }, $value);
            }

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
    'adv.title' => 'Avantages — Titre',
    'adv.items' => 'Avantages — Cartes',
    'origin.title' => 'Origine — Titre',
    'origin.sub' => 'Origine — Sous-titre',
    'bars.items' => 'Répartition — Barres',
    'donut.value' => 'Indicateur — Valeur',
    'donut.label' => 'Indicateur — Libellé',
    'diag.intro' => 'Diagnostic — Intro',
    'diag.items' => 'Diagnostic — Cartes',
    'actions.title' => 'Actions — Titre',
    'actions.items' => 'Actions — Cartes',
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
