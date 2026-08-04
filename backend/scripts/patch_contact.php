<?php

/**
 * Polish Contact CMS labels and seed form.success.
 *
 *   php scripts/patch_contact.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'info.title' => 'Info — Titre',
    'info.items' => 'Info — Coordonnées',
    'info.per_page' => 'Info — Par page',
    'form.label_name' => 'Formulaire — Label nom',
    'form.placeholder_name' => 'Formulaire — Placeholder nom',
    'form.label_email' => 'Formulaire — Label email',
    'form.placeholder_email' => 'Formulaire — Placeholder email',
    'form.label_subject' => 'Formulaire — Label sujet',
    'form.placeholder_subject' => 'Formulaire — Placeholder sujet',
    'form.label_message' => 'Formulaire — Label message',
    'form.placeholder_message' => 'Formulaire — Placeholder message',
    'form.submit' => 'Formulaire — Bouton',
    'form.success' => 'Formulaire — Message de succès',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', 'contact')
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

foreach ([
    'hero' => 'Bannière',
    'info' => 'Informations de contact',
    'form' => 'Formulaire',
] as $slug => $title) {
    CmsSection::where('page', 'contact')->where('slug', $slug)->update(['title' => $title]);
}

$success = [
    'fr' => 'Merci — votre message a bien été envoyé.',
    'en' => 'Thank you — your message has been sent.',
    'ar' => 'شكراً — تم إرسال رسالتكم بنجاح.',
];

foreach ($success as $locale => $value) {
    ContentBlock::updateOrCreate(
        [
            'page' => 'contact',
            'section' => 'form',
            'key' => 'success',
            'locale' => $locale,
        ],
        [
            'type' => 'text',
            'label' => 'Formulaire — Message de succès',
            'value' => $value,
            'sort_order' => 3,
        ]
    );
}

// Drop legacy flat address/phone/email fields.
$dead = ['address_label', 'address', 'phone_label', 'phone', 'email_label', 'email'];
ContentBlock::where('page', 'contact')->where('section', 'info')->whereIn('key', $dead)->delete();

$empty = ContentBlock::where('page', 'contact')->get()
    ->filter(fn ($b) => trim((string) $b->value) === '');
foreach ($empty as $b) {
    echo "EMPTY {$b->section}.{$b->key} {$b->locale}\n";
}

echo "updated labels on {$n} row(s)\n";
echo $empty->isEmpty() ? "no empty blocks\n" : '';
