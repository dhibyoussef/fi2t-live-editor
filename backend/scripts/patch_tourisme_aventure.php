<?php

/**
 * Flatten Tourisme d'aventure CMS bands into click-editable flat keys.
 *
 *   php scripts/patch_tourisme_aventure.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'tourisme-aventure';

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'market' => 'Potentiel du Marché',
    'wealth' => 'Richesse Territoriale',
    'photos' => 'Galerie',
    'freins' => 'Freins à la Croissance',
    'roadmap' => 'Feuille de Route Fi2T',
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
    'market' => [
        'map' => ['title' => 'title', 'body' => 'body', 'items' => 'items'],
        'labels' => [
            'title' => 'Marché — Titre',
            'body' => 'Marché — Texte',
            'items' => 'Marché — KPIs',
        ],
    ],
    'wealth' => [
        'map' => [
            'title' => 'title',
            'body' => 'body',
            'metricValue' => 'metricValue',
            'metricLabel' => 'metricLabel',
            'metricSub' => 'metricSub',
        ],
        'labels' => [
            'title' => 'Richesse — Titre',
            'body' => 'Richesse — Texte',
            'metricValue' => 'Richesse — Valeur',
            'metricLabel' => 'Richesse — Libellé',
            'metricSub' => 'Richesse — Sous-texte',
        ],
    ],
    'photos' => [
        'map' => ['items' => 'items'],
        'labels' => [
            'items' => 'Galerie — Photos',
        ],
    ],
    'freins' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Freins — Titre',
            'sub' => 'Freins — Sous-titre',
            'items' => 'Freins — Cartes',
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

            // Photos: string[] → [{img}]
            if ($section === 'photos' && $field === 'items' && is_array($value)) {
                $value = array_map(static function ($row) {
                    if (is_string($row)) {
                        return ['img' => $row];
                    }
                    if (is_array($row) && isset($row['img'])) {
                        return ['img' => (string) $row['img']];
                    }

                    return ['img' => ''];
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
    'market.title' => 'Marché — Titre',
    'market.body' => 'Marché — Texte',
    'market.items' => 'Marché — KPIs',
    'wealth.title' => 'Richesse — Titre',
    'wealth.body' => 'Richesse — Texte',
    'wealth.metricValue' => 'Richesse — Valeur',
    'wealth.metricLabel' => 'Richesse — Libellé',
    'wealth.metricSub' => 'Richesse — Sous-texte',
    'photos.items' => 'Galerie — Photos',
    'freins.title' => 'Freins — Titre',
    'freins.sub' => 'Freins — Sous-titre',
    'freins.items' => 'Freins — Cartes',
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
