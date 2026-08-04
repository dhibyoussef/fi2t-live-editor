<?php

/**
 * Polish Fiche adhésion CMS labels and seed form.success.
 *
 *   php scripts/patch_fiche_adhesion.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'intro.title' => 'Intro — Titre',
    'intro.body' => 'Intro — Texte',
    'adherer.title' => 'Adhésion — Titre',
    'adherer.image' => 'Adhésion — Image',
    'adherer.badge' => 'Adhésion — Badge',
    'adherer.badge_pos' => 'Adhésion — Position badge',
    'adherer.per_page' => 'Adhésion — Par page',
    'adherer.reasons' => 'Adhésion — Avantages',
    'form.title' => 'Formulaire — Titre',
    'form.label_org' => 'Formulaire — Label raison sociale',
    'form.placeholder_org' => 'Formulaire — Placeholder raison sociale',
    'form.label_contact' => 'Formulaire — Label contact',
    'form.placeholder_contact' => 'Formulaire — Placeholder contact',
    'form.label_email' => 'Formulaire — Label email',
    'form.placeholder_email' => 'Formulaire — Placeholder email',
    'form.label_phone' => 'Formulaire — Label téléphone',
    'form.placeholder_phone' => 'Formulaire — Placeholder téléphone',
    'form.label_activity' => 'Formulaire — Label activité',
    'form.placeholder_activity' => 'Formulaire — Placeholder activité',
    'form.label_message' => 'Formulaire — Label message',
    'form.placeholder_message' => 'Formulaire — Placeholder message',
    'form.submit' => 'Formulaire — Bouton',
    'form.success' => 'Formulaire — Message de succès',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', 'fiche-adhesion')
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

foreach ([
    'hero' => 'Bannière',
    'intro' => 'Introduction',
    'adherer' => 'Pourquoi adhérer',
    'form' => 'Formulaire',
] as $slug => $title) {
    CmsSection::where('page', 'fiche-adhesion')->where('slug', $slug)->update(['title' => $title]);
}

$success = [
    'fr' => 'Merci — votre demande d’adhésion a bien été envoyée.',
    'en' => 'Thank you — your membership application has been sent.',
    'ar' => 'شكراً — تم إرسال طلب انضمامكم بنجاح.',
];

foreach ($success as $locale => $value) {
    ContentBlock::updateOrCreate(
        [
            'page' => 'fiche-adhesion',
            'section' => 'form',
            'key' => 'success',
            'locale' => $locale,
        ],
        [
            'type' => 'text',
            'label' => 'Formulaire — Message de succès',
            'value' => $value,
            'sort_order' => 4,
        ]
    );
}

// Drop any leftover benefits band from older seeds.
ContentBlock::where('page', 'fiche-adhesion')->where('section', 'benefits')->delete();
CmsSection::where('page', 'fiche-adhesion')->where('slug', 'benefits')->delete();

$empty = ContentBlock::where('page', 'fiche-adhesion')->get()
    ->filter(fn ($b) => trim((string) $b->value) === '');
foreach ($empty as $b) {
    echo "EMPTY {$b->section}.{$b->key} {$b->locale}\n";
}

echo "updated labels on {$n} row(s)\n";
echo $empty->isEmpty() ? "no empty blocks\n" : '';
