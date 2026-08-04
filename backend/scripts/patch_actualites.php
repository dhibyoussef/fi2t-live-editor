<?php

/**
 * Polish Actualités CMS so Structure de la page matches the site.
 *
 *   php scripts/patch_actualites.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CmsSection;
use App\Models\ContentBlock;

$labels = [
    'hero.image' => 'Bannière — Image',
    'hero.title' => 'Bannière — Titre',
    'grid.items' => 'Actualités — Cartes',
    'grid.per_page' => 'Actualités — Par page',
    'article.banner' => 'Article — Bannière',
];

$n = 0;
foreach ($labels as $compound => $label) {
    [$section, $key] = explode('.', $compound, 2);
    $n += ContentBlock::where('page', 'actualites')
        ->where('section', $section)
        ->where('key', $key)
        ->update(['label' => $label]);
}

foreach ([
    'hero' => 'Bannière',
    'grid' => 'Grille des articles',
    'article' => 'Page article',
] as $slug => $title) {
    CmsSection::where('page', 'actualites')->where('slug', $slug)->update(['title' => $title]);
}

// Keep EN/AR first page at 9 translated cards (pager still pads to 6 pages live).
$en = ContentBlock::where([
    'page' => 'actualites', 'section' => 'grid', 'key' => 'items', 'locale' => 'en',
])->first();
$ar = ContentBlock::where([
    'page' => 'actualites', 'section' => 'grid', 'key' => 'items', 'locale' => 'ar',
])->first();

$enItems = [
    ['slug' => 'walid-tritar-president-fi2t', 'title' => 'Tourism: Walid Tritar, new President of Fi2T', 'desc' => 'Walid Tritar has been elected new President of Fi2T (Interprofessional Federation of Tunisian Tourism) for 2026–2029....', 'date' => '11 May 2026', 'img' => '/images/act1.png?v=6'],
    ['slug' => 'secteur-sous-pression', 'title' => 'Tourism sector: under pressure, but resilient...', 'desc' => 'The global tourism sector is going through a challenging phase, with more demanding markets and later booking decisions....', 'date' => '22 May 2026', 'img' => '/images/act2.png?v=6'],
    ['slug' => 'houssem-azouz-centre-ouest', 'title' => 'Houssem Azouz (President of the Interprofessional Federation...', 'desc' => 'Houssem Azouz — the Centre-West of the country, marked by the scale of its heritage and its colours...', 'date' => '7 April 2026', 'img' => '/images/act3.png?v=6', 'hero_title' => "Houssem Azouz (President of the\nInterprofessional Federation"],
    ['slug' => 'trois-questions-walid-tritar', 'title' => 'Tunisian tourism — Three questions for Walid Tritar', 'desc' => 'Walid Tritar has been elected new President of Fi2T for 2026–2029....', 'date' => '11 May 2026', 'img' => '/images/article-featured-walid.png?v=2'],
    ['slug' => 'resilience-secteur-touristique', 'title' => 'Tourism sector: under pressure, but resilient...', 'desc' => 'The global tourism sector is going through a challenging phase....', 'date' => '22 May 2026', 'img' => '/images/act5.png?v=6'],
    ['slug' => 'fi2t-centre-ouest', 'title' => 'Houssem Azouz (President of the Interprofessional Federation...', 'desc' => 'Houssem Azouz — the Centre-West of the country...', 'date' => '7 April 2026', 'img' => '/images/act6.png?v=6'],
    ['slug' => 'mandat-fi2t-2026', 'title' => 'Tourism: Walid Tritar, new President of Fi2T', 'desc' => 'Walid Tritar has been elected new President of Fi2T for 2026–2029....', 'date' => '11 May 2026', 'img' => '/images/act7.png?v=6'],
    ['slug' => 'marches-touristiques-2026', 'title' => 'Tourism sector: under pressure, but resilient...', 'desc' => 'The global tourism sector is going through a challenging phase....', 'date' => '22 May 2026', 'img' => '/images/act8.png?v=6'],
    ['slug' => 'patrimoine-centre-ouest', 'title' => 'Houssem Azouz (President of the Interprofessional Federation...', 'desc' => 'Houssem Azouz — the Centre-West of the country...', 'date' => '7 April 2026', 'img' => '/images/act9.png?v=6'],
];

$arItems = [
    ['slug' => 'walid-tritar-president-fi2t', 'title' => 'السياحة: وليد تريتار، الرئيس الجديد لـ Fi2T', 'desc' => 'تم انتخاب وليد تريتار رئيساً جديداً لـ Fi2T للفترة 2026–2029....', 'date' => '11 مايو 2026', 'img' => '/images/act1.png?v=6'],
    ['slug' => 'secteur-sous-pression', 'title' => 'القطاع السياحي: تحت الضغط لكنه صامد...', 'desc' => 'يشهد القطاع السياحي العالمي مرحلة صعبة مع أسواق أكثر تطلباً وقرارات سفر متأخرة....', 'date' => '22 مايو 2026', 'img' => '/images/act2.png?v=6'],
    ['slug' => 'houssem-azouz-centre-ouest', 'title' => 'حسام عزوز (رئيس الاتحاد المهني المشترك...', 'desc' => 'حسام عزوز — الوسط الغربي للبلاد بما يحمله من آثار وألوان...', 'date' => '7 أبريل 2026', 'img' => '/images/act3.png?v=6', 'hero_title' => "حسام عزوز (رئيس الاتحاد\nالمهني المشترك"],
    ['slug' => 'trois-questions-walid-tritar', 'title' => 'السياحة التونسية — ثلاثة أسئلة لوليد تريتار', 'desc' => 'تم انتخاب وليد تريتار رئيساً جديداً لـ Fi2T للفترة 2026–2029....', 'date' => '11 مايو 2026', 'img' => '/images/article-featured-walid.png?v=2'],
    ['slug' => 'resilience-secteur-touristique', 'title' => 'القطاع السياحي: تحت الضغط لكنه صامد...', 'desc' => 'يشهد القطاع السياحي العالمي مرحلة صعبة....', 'date' => '22 مايو 2026', 'img' => '/images/act5.png?v=6'],
    ['slug' => 'fi2t-centre-ouest', 'title' => 'حسام عزوز (رئيس الاتحاد المهني المشترك...', 'desc' => 'حسام عزوز — الوسط الغربي للبلاد...', 'date' => '7 أبريل 2026', 'img' => '/images/act6.png?v=6'],
    ['slug' => 'mandat-fi2t-2026', 'title' => 'السياحة: وليد تريتار، الرئيس الجديد لـ Fi2T', 'desc' => 'تم انتخاب وليد تريتار رئيساً جديداً لـ Fi2T للفترة 2026–2029....', 'date' => '11 مايو 2026', 'img' => '/images/act7.png?v=6'],
    ['slug' => 'marches-touristiques-2026', 'title' => 'القطاع السياحي: تحت الضغط لكنه صامد...', 'desc' => 'يشهد القطاع السياحي العالمي مرحلة صعبة....', 'date' => '22 مايو 2026', 'img' => '/images/act8.png?v=6'],
    ['slug' => 'patrimoine-centre-ouest', 'title' => 'حسام عزوز (رئيس الاتحاد المهني المشترك...', 'desc' => 'حسام عزوز — الوسط الغربي للبلاد...', 'date' => '7 أبريل 2026', 'img' => '/images/act9.png?v=6'],
];

$flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
if ($en) {
    $en->update(['value' => json_encode($enItems, $flags), 'type' => 'json', 'label' => 'Actualités — Cartes']);
    echo "synced en grid.items (" . count($enItems) . ")\n";
}
if ($ar) {
    $ar->update(['value' => json_encode($arItems, $flags), 'type' => 'json', 'label' => 'Actualités — Cartes']);
    echo "synced ar grid.items (" . count($arItems) . ")\n";
}

// Hero image + article banner defaults if blank.
ContentBlock::where('page', 'actualites')->where('section', 'hero')->where('key', 'image')
    ->where(function ($q) {
        $q->whereNull('value')->orWhere('value', '');
    })
    ->update(['value' => '/images/desert-banner.jpg?v=1']);

ContentBlock::where('page', 'actualites')->where('section', 'article')->where('key', 'banner')
    ->where(function ($q) {
        $q->whereNull('value')->orWhere('value', '');
    })
    ->update(['value' => '/images/article-banner.jpg?v=1']);

ContentBlock::firstOrCreate(
    ['page' => 'actualites', 'section' => 'grid', 'key' => 'per_page', 'locale' => '_all'],
    ['type' => 'text', 'label' => 'Actualités — Par page', 'value' => '9', 'sort_order' => 2]
);

$empty = ContentBlock::where('page', 'actualites')->get()
    ->filter(fn ($b) => trim((string) $b->value) === '');
foreach ($empty as $b) {
    echo "EMPTY {$b->section}.{$b->key} {$b->locale}\n";
}

echo "updated labels on {$n} row(s)\n";
echo $empty->isEmpty() ? "no empty blocks\n" : '';
