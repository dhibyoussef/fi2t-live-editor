<?php

/**
 * Polish Organisation CMS labels so Contenu du site matches the page.
 *
 *   php scripts/patch_organisation.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'stats.value_groupements' => 'Chiffre — Groupements',
    'stats.label_groupements' => 'Libellé — Groupements',
    'stats.value_regions' => 'Chiffre — Régions',
    'stats.label_regions' => 'Libellé — Régions',
    'stats.mandate_years' => 'Chiffre — Mandat',
    'stats.label_mandate' => 'Libellé — Mandat',
    'board.title' => 'Bureau — Titre',
    'board.members' => 'Bureau — Membres',
    'headquarters.title' => 'Siège — Titre',
    'headquarters.staff' => 'Siège — Équipe',
    'regional.title' => 'Régional — Titre',
    'regional.items' => 'Régional — Bureaux',
    'regional.map_image' => 'Régional — Carte',
    'regional.map_label' => 'Régional — Libellé carte',
    'groupements.title' => 'Groupements — Titre',
    'groupements.items' => 'Groupements — Cartes',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', 'organisation')
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

$sections = [
    'hero' => 'Bannière',
    'stats' => 'Chiffres clés',
    'board' => 'Composition actuelle',
    'headquarters' => 'Bureau du siège',
    'regional' => 'Bureaux régionaux',
    'groupements' => 'Groupements professionnels',
];

foreach ($sections as $slug => $title) {
    CmsSection::where('page', 'organisation')->where('slug', $slug)->update(['title' => $title]);
}

// Ensure no empty text blocks remain.
$empty = ContentBlock::where('page', 'organisation')
    ->where('type', '!=', 'image')
    ->get()
    ->filter(fn ($b) => trim((string) $b->value) === '');

foreach ($empty as $b) {
    echo "EMPTY {$b->section}.{$b->key} {$b->locale}\n";
}

echo "updated labels on {$n} row(s)\n";
echo $empty->isEmpty() ? "no empty blocks\n" : '';
