<?php

/**
 * Flatten segment-layout groupement pages (écologique, aéronautique, subaquatique).
 *
 *   php scripts/patch_tourisme_segment.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$pages = [
    'tourisme-ecologique',
    'tourisme-aeronautique',
    'tourisme-subaquatique',
];

$sectionTitles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'stats' => 'Chiffres clés',
    'pillars' => 'Piliers',
    'challenges' => 'Défis',
    'actions' => 'Actions',
    'cta' => 'Appel à l’action',
];

$bands = [
    'intro' => [
        'map' => ['eyebrow' => 'eyebrow', 'lead' => 'lead'],
        'labels' => [
            'eyebrow' => 'Intro — Surtitre',
            'lead' => 'Intro — Accroche',
        ],
        'flatKeys' => [
            'eyebrow' => 'intro.eyebrow',
            'lead' => 'intro.lead',
        ],
    ],
    'stats' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Chiffres — Titre',
            'items' => 'Chiffres — Liste',
        ],
    ],
    'pillars' => [
        'map' => ['title' => 'title', 'sub' => 'sub', 'items' => 'items'],
        'labels' => [
            'title' => 'Piliers — Titre',
            'sub' => 'Piliers — Sous-titre',
            'items' => 'Piliers — Cartes',
        ],
    ],
    'challenges' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Défis — Titre',
            'items' => 'Défis — Liste',
        ],
        'textList' => true,
    ],
    'actions' => [
        'map' => ['title' => 'title', 'items' => 'items'],
        'labels' => [
            'title' => 'Actions — Titre',
            'items' => 'Actions — Liste',
        ],
        'textList' => true,
    ],
    'cta' => [
        'map' => ['title' => 'title', 'body' => 'body', 'label' => 'label', 'to' => 'to'],
        'labels' => [
            'title' => 'CTA — Titre',
            'body' => 'CTA — Texte',
            'label' => 'CTA — Libellé',
            'to' => 'CTA — Lien',
        ],
    ],
];

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'intro.body' => 'Introduction',
    'intro.eyebrow' => 'Intro — Surtitre',
    'intro.lead' => 'Intro — Accroche',
    'stats.title' => 'Chiffres — Titre',
    'stats.items' => 'Chiffres — Liste',
    'pillars.title' => 'Piliers — Titre',
    'pillars.sub' => 'Piliers — Sous-titre',
    'pillars.items' => 'Piliers — Cartes',
    'challenges.title' => 'Défis — Titre',
    'challenges.items' => 'Défis — Liste',
    'actions.title' => 'Actions — Titre',
    'actions.items' => 'Actions — Liste',
    'cta.title' => 'CTA — Titre',
    'cta.body' => 'CTA — Texte',
    'cta.label' => 'CTA — Libellé',
    'cta.to' => 'CTA — Lien',
];

foreach ($pages as $page) {
    echo "=== {$page} ===\n";

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
                echo "SKIP {$section}.data {$block->locale}\n";
                continue;
            }

            foreach ($meta['map'] as $field => $jsonKey) {
                if (! array_key_exists($jsonKey, $decoded)) {
                    continue;
                }
                $value = $decoded[$jsonKey];

                if (! empty($meta['textList']) && $field === 'items' && is_array($value)) {
                    $value = array_map(static function ($row) {
                        if (is_string($row)) {
                            return ['text' => $row];
                        }
                        if (is_array($row) && isset($row['text'])) {
                            return ['text' => (string) $row['text']];
                        }

                        return ['text' => ''];
                    }, $value);
                }

                // intro.data folds into intro.eyebrow / intro.lead
                $storeSection = $section;
                $storeKey = $field;
                if ($section === 'intro' && isset($meta['flatKeys'][$field])) {
                    [$storeSection, $storeKey] = explode('.', $meta['flatKeys'][$field], 2);
                }

                $isJson = is_array($value);
                $stored = $isJson
                    ? json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                    : (string) $value;

                ContentBlock::updateOrCreate(
                    [
                        'page' => $page,
                        'section' => $storeSection,
                        'key' => $storeKey,
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

    $n = 0;
    foreach ($labels as $compound => $label) {
        [$section, $key] = explode('.', $compound, 2);
        $n += ContentBlock::where('page', $page)
            ->where('section', $section)
            ->where('key', $key)
            ->update(['label' => $label]);
    }

    echo "created/updated {$created}, deleted {$deleted} *.data, relabeled {$n}\n";
}
