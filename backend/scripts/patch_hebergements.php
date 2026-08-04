<?php

/**
 * Align Hébergements Alternatifs CMS section titles with live page headings.
 *
 *   php scripts/patch_hebergements.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$page = 'hebergements-alternatifs';

$titles = [
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'types' => 'Typologies',
    'values' => 'Valeurs',
    'growth' => 'Un secteur en pleine croissance',
    'diag' => 'Le Diagnostic Stratégique',
];

foreach ($titles as $slug => $title) {
    CmsSection::where('page', $page)->where('slug', $slug)->update(['title' => $title]);
}

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'intro.body' => 'Introduction — Accroche',
    'intro.lead' => 'Introduction — Titre',
    'intro.copy' => 'Introduction — Texte',
    'types.items' => 'Typologies — Cartes',
    'values.items' => 'Valeurs — Cartes',
    'growth.title' => 'Croissance — Titre',
    'growth.body' => 'Croissance — Texte',
    'growth.stats' => 'Croissance — Chiffres',
    'diag.title' => 'Diagnostic — Titre',
    'diag.items' => 'Diagnostic — Points',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', $page)
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

$empty = ContentBlock::where('page', $page)->get()
    ->filter(fn ($b) => trim((string) $b->value) === '');
foreach ($empty as $b) {
    echo "EMPTY {$b->section}.{$b->key} {$b->locale}\n";
}

echo "updated section titles + {$n} block label(s)\n";
echo $empty->isEmpty() ? "no empty blocks\n" : '';
