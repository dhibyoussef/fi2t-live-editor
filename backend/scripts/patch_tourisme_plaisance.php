<?php

/**
 * Flatten Tourisme la plaisance CMS bands into click-editable flat keys.
 *
 *   php scripts/patch_tourisme_plaisance.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-plaisance';

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'impact' => 'Impact économique',
    'marina' => 'Marina',
    'parent' => 'Parent pauvre',
    'prob' => 'Problématiques',
    'actions' => 'Actions',
    'blueprint' => 'Schéma',
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
    'impact' => [
        'map' => ['title' => 'title', 'items' => 'cards'],
        'labels' => [
            'title' => 'Impact — Titre',
            'items' => 'Impact — Cartes',
        ],
    ],
    'marina' => [
        'map' => ['img' => 'img'],
        'labels' => [
            'img' => 'Marina — Photo',
        ],
    ],
    'parent' => [
        'map' => ['title' => 'title', 'body' => 'body'],
        'labels' => [
            'title' => 'Parent pauvre — Titre',
            'body' => 'Parent pauvre — Texte',
        ],
    ],
    'prob' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Problématiques — Titre',
            'sub' => 'Problématiques — Sous-titre',
            'items' => 'Problématiques — Cartes',
        ],
    ],
    'actions' => [
        'map' => ['title' => 'title', 'body' => 'body', 'items' => 'items'],
        'labels' => [
            'title' => 'Actions — Titre',
            'body' => 'Actions — Texte',
            'items' => 'Actions — Liste',
        ],
        'textList' => true,
    ],
    'blueprint' => [
        'map' => ['img' => 'value'],
        'labels' => [
            'img' => 'Schéma — Image',
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

            if (! empty($meta['textList']) && $field === 'items' && is_array($value)) {
                $value = array_map(
                    static fn ($row) => is_string($row)
                        ? ['text' => $row]
                        : ['text' => (string) ($row['text'] ?? '')],
                    $value
                );
            }

            $isJson = is_array($value);
            $stored = $isJson
                ? json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                : (string) $value;
            $isImage = ! $isJson && (
                in_array($field, ['img', 'image', 'photo', 'face'], true)
                || str_starts_with($stored, '/images/')
                || str_starts_with($stored, '/storage/')
            );

            if ($isImage) {
                ContentBlock::where('page', $page)
                    ->where('section', $section)
                    ->where('key', $field)
                    ->where('locale', '!=', '_all')
                    ->delete();

                ContentBlock::updateOrCreate(
                    [
                        'page' => $page,
                        'section' => $section,
                        'key' => $field,
                        'locale' => '_all',
                    ],
                    [
                        'type' => 'image',
                        'label' => $meta['labels'][$field] ?? "{$section}.{$field}",
                        'value' => $stored,
                        'sort_order' => $block->sort_order,
                    ]
                );
            } else {
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
            }
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
    'impact.title' => 'Impact — Titre',
    'impact.items' => 'Impact — Cartes',
    'marina.img' => 'Marina — Photo',
    'parent.title' => 'Parent pauvre — Titre',
    'parent.body' => 'Parent pauvre — Texte',
    'prob.title' => 'Problématiques — Titre',
    'prob.sub' => 'Problématiques — Sous-titre',
    'prob.items' => 'Problématiques — Cartes',
    'actions.title' => 'Actions — Titre',
    'actions.body' => 'Actions — Texte',
    'actions.items' => 'Actions — Liste',
    'blueprint.img' => 'Schéma — Image',
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
