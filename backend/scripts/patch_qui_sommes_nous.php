<?php

/**
 * Repair Qui sommes-nous content so Structure de la page matches the site.
 *
 *   php scripts/patch_qui_sommes_nous.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$fixed = 0;

// FR banner title was null — the site fell back, the CMS showed a blank field.
$title = ContentBlock::where('page', 'qui-sommes-nous')
    ->where('section', 'hero')
    ->where('key', 'title')
    ->where('locale', 'fr')
    ->first();

if ($title && trim((string) $title->value) === '') {
    $title->update(['value' => 'Qui sommes-nous', 'type' => 'text', 'label' => 'Titre']);
    echo "filled hero.title fr\n";
    $fixed++;
}

// The band is titled "Nos objectifs" on the page — keep the CMS label in sync.
$section = CmsSection::where('page', 'qui-sommes-nous')->where('slug', 'values')->first();
if ($section && $section->title !== 'Nos objectifs') {
    $section->update(['title' => 'Nos objectifs']);
    echo "renamed values → Nos objectifs\n";
    $fixed++;
}

// Make sure every rendered key exists in FR/EN/AR so Contenu du site is never blank.
$defaults = [
    'fr' => [
        'hero.title' => 'Qui sommes-nous',
        'mission.title' => 'Notre Histoire & Mission',
        'values.title' => 'Nos objectifs',
        'diversify.title' => 'Pourquoi diversifier et innover ?',
        'diversify.intro' => 'La diversification des produits touristique n’est pas un luxe, c’est plutôt :',
        'join.title' => "Prêt à rejoindre l'excellence ?",
        'join.body' => 'Contribuez activement à la transformation du tourisme tunisien en devenant membre de notre fédération interprofessionnelle.',
        'join.cta' => 'Devenir membre',
    ],
    'en' => [
        'hero.title' => 'Who we are',
        'mission.title' => 'Our history & mission',
        'values.title' => 'Our objectives',
        'diversify.title' => 'Why diversify and innovate?',
        'diversify.intro' => 'Diversifying tourism products is not a luxury — it is rather:',
        'join.title' => 'Ready to join excellence?',
        'join.body' => 'Actively contribute to transforming Tunisian tourism by becoming a member of our interprofessional federation.',
        'join.cta' => 'Become a member',
    ],
    'ar' => [
        'hero.title' => 'من نحن',
        'mission.title' => 'تاريخنا ورسالتنا',
        'values.title' => 'أهدافنا',
        'diversify.title' => 'لماذا التنويع والابتكار؟',
        'diversify.intro' => 'تنويع المنتجات السياحية ليس ترفاً، بل هو:',
        'join.title' => 'هل أنتم مستعدون للانضمام إلى التميز؟',
        'join.body' => 'ساهموا بفعالية في تحويل السياحة التونسية بالانضمام إلى فيدراليتنا.',
        'join.cta' => 'كن عضواً',
    ],
];

foreach ($defaults as $locale => $blocks) {
    foreach ($blocks as $blockKey => $value) {
        [$sectionSlug, $key] = explode('.', $blockKey, 2);
        $row = ContentBlock::firstOrCreate(
            [
                'page' => 'qui-sommes-nous',
                'section' => $sectionSlug,
                'key' => $key,
                'locale' => $locale,
            ],
            [
                'type' => 'text',
                'label' => $key,
                'value' => $value,
                'sort_order' => match ($sectionSlug) {
                    'hero' => 1,
                    'mission' => 2,
                    'values' => 3,
                    'diversify' => 4,
                    'join' => 5,
                    default => 0,
                },
            ]
        );

        if (trim((string) $row->value) === '') {
            $row->update(['value' => $value]);
            echo "filled {$blockKey} {$locale}\n";
            $fixed++;
        }
    }
}

echo "done ({$fixed} fix(es))\n";
