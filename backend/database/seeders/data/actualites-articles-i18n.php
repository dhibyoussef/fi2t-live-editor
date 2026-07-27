<?php

/**
 * Full EN / AR copies of actualites.grid.items (and home cards).
 * Interview long answers are translated so article pages switch language too.
 */

$interviewEn = [
    'hero_title' => "Houssem Azouz (President of the\nInterprofessional Federation",
    'subtitle' => 'Three questions to Walid Tritar on Tunisian tourism',
    'quote' => '“All inclusive is no longer really a choice: it is an obligation dictated by the market.”',
    'intro' => 'Walid Tritar, newly elected President of Fi2T, answers three questions about the all-inclusive model and Tunisian tourism.',
    'source' => 'Source: Fi2T',
    'sections' => [
        [
            'question' => 'Q1 — Does “all inclusive” really benefit the Tunisian economy?',
            'answer' => "Many misconceptions surround the all-inclusive concept in Tunisia. Competitors such as Egypt, Turkey and Bulgaria offer similar packages, so Tunisian hoteliers often have little choice but to follow the market.\n\nAll inclusive helps hotels forecast revenue and manage costs. It also supports employment. As leisure infrastructure outside hotels develops further, the model can evolve toward more open formulas.",
        ],
        [
            'question' => 'Q2 — Why is all inclusive so often criticised?',
            'answer' => "Criticism often comes from misunderstanding: there is not one single all-inclusive model. Quality varies widely between hotels — from basic offers to ultra all inclusive with à-la-carte dining and premium services.\n\nThe issue is not the concept itself, but how it is applied. Hoteliers can choose volume-driven low-cost offers or quality products that strengthen Tunisia’s destination image.",
        ],
        [
            'question' => 'Q3 — What should clients check before booking?',
            'answer' => "Clients should carefully read what is included: dining quality, facilities, entertainment, pool services, room comfort and extras. Not all all-inclusive offers are equal — comparing product descriptions is essential.",
        ],
    ],
];

$interviewAr = [
    'hero_title' => "حسام عزوز (رئيس الاتحاد\nالمهني المشترك",
    'subtitle' => 'ثلاثة أسئلة لوليد تريتار حول السياحة التونسية',
    'quote' => '«الكل شامل لم يعد خياراً حقيقياً: إنه التزام يفرضه السوق.»',
    'intro' => 'يجيب وليد تريتار، الرئيس الجديد لـ Fi2T، عن ثلاثة أسئلة حول نموذج الكل شامل والسياحة التونسية.',
    'source' => 'المصدر: Fi2T',
    'sections' => [
        [
            'question' => 'س1 — هل يفيد نموذج «الكل شامل» الاقتصاد التونسي فعلاً؟',
            'answer' => "تحيط بنموذج الكل شامل في تونس أفكار مسبقة كثيرة. منافسون مثل مصر وتركيا وبلغاريا يقدمون عروضاً مشابهة، لذلك غالباً ما لا يملك الفندقيون التونسيون خياراً غير مواكبة السوق.\n\nيساعد الكل شامل الفنادق على توقع المداخيل وإدارة التكاليف، كما يدعم التشغيل. ومع تطور البنية التحتية للترفيه خارج الفنادق، يمكن أن يتطور النموذج نحو صيغ أكثر انفتاحاً.",
        ],
        [
            'question' => 'س2 — لماذا يُنتقد الكل شامل كثيراً؟',
            'answer' => "غالباً ما ينبع النقد من سوء فهم: لا يوجد نموذج واحد للكل شامل. تختلف الجودة كثيراً بين الفنادق — من عروض أساسية إلى كل شامل فائق مع مطاعم حسب الطلب وخدمات راقية.\n\nالمشكلة ليست في المفهوم ذاته بل في طريقة تطبيقه. يمكن للفندقيين اختيار عروض حجم منخفضة التكلفة أو منتجات جودة تعزز صورة تونس كوجهة.",
        ],
        [
            'question' => 'س3 — ماذا يجب على الحريف التحقق منه قبل الحجز؟',
            'answer' => "ينبغي قراءة ما يشمله العرض بدقة: جودة المطاعم، التجهيزات، التنشيط، خدمات المسبح، راحة الغرف والخدمات الإضافية. ليست كل عروض الكل شامل متساوية — ومقارنة وصف المنتج أمر أساسي.",
        ],
    ],
];

$baseEn = [
    [
        'slug' => 'walid-tritar-president-fi2t',
        'title' => 'Tourism: Walid Tritar, new President of Fi2T',
        'desc' => 'Walid Tritar has been elected new President of Fi2T (Interprofessional Federation of Tunisian Tourism) for 2026–2029....',
        'date' => '11 May 2026',
        'img' => '/images/act1.jpg',
    ],
    [
        'slug' => 'secteur-sous-pression',
        'title' => 'Tourism sector: under pressure, but resilient...',
        'desc' => 'The global tourism sector is going through a challenging phase, with more demanding markets and later booking decisions....',
        'date' => '22 May 2026',
        'img' => '/images/act2.jpg',
    ],
    [
        'slug' => 'houssem-azouz-centre-ouest',
        'title' => 'Houssem Azouz (President of the Interprofessional Federation...',
        'desc' => 'Houssem Azouz — the Centre-West of the country, marked by the scale of its heritage and its colours...',
        'date' => '7 April 2026',
        'img' => '/images/act3.jpg',
        'hero_title' => "Houssem Azouz (President of the\nInterprofessional Federation",
    ],
    array_merge([
        'slug' => 'trois-questions-walid-tritar',
        'title' => 'Tunisian tourism — Three questions to Walid Tritar',
        'desc' => 'Walid Tritar, newly elected President of Fi2T, answers three questions on all inclusive and the Tunisian destination....',
        'date' => '11 May 2026',
        'img' => '/images/act1.jpg',
    ], $interviewEn),
    [
        'slug' => 'resilience-secteur-touristique',
        'title' => 'Tourism sector: under pressure, but resilient...',
        'desc' => 'The global tourism sector is going through a challenging phase, with more demanding markets and later booking decisions....',
        'date' => '22 May 2026',
        'img' => '/images/act2.jpg',
    ],
    [
        'slug' => 'fi2t-centre-ouest',
        'title' => 'Houssem Azouz (President of the Interprofessional Federation...',
        'desc' => 'Houssem Azouz — the Centre-West of the country, marked by the scale of its heritage and its colours...',
        'date' => '7 April 2026',
        'img' => '/images/act3.jpg',
        'hero_title' => "Houssem Azouz (President of the\nInterprofessional Federation",
    ],
    [
        'slug' => 'mandat-fi2t-2026',
        'title' => 'Tourism: Walid Tritar, new President of Fi2T',
        'desc' => 'Walid Tritar has been elected new President of Fi2T (Interprofessional Federation of Tunisian Tourism) for 2026–2029....',
        'date' => '11 May 2026',
        'img' => '/images/act1.jpg',
    ],
    [
        'slug' => 'marches-touristiques-2026',
        'title' => 'Tourism sector: under pressure, but resilient...',
        'desc' => 'The global tourism sector is going through a challenging phase, with more demanding markets and later booking decisions....',
        'date' => '22 May 2026',
        'img' => '/images/act2.jpg',
    ],
    [
        'slug' => 'patrimoine-centre-ouest',
        'title' => 'Houssem Azouz (President of the Interprofessional Federation...',
        'desc' => 'Houssem Azouz — the Centre-West of the country, marked by the scale of its heritage and its colours...',
        'date' => '7 April 2026',
        'img' => '/images/act3.jpg',
        'hero_title' => "Houssem Azouz (President of the\nInterprofessional Federation",
    ],
];

$baseAr = [
    [
        'slug' => 'walid-tritar-president-fi2t',
        'title' => 'السياحة: وليد تريتار، الرئيس الجديد لـ Fi2T',
        'desc' => 'تم انتخاب وليد تريتار رئيساً جديداً لـ Fi2T (الاتحاد المهني المشترك للسياحة التونسية) للفترة 2026–2029....',
        'date' => '11 مايو 2026',
        'img' => '/images/act1.jpg',
    ],
    [
        'slug' => 'secteur-sous-pression',
        'title' => 'القطاع السياحي: تحت الضغط لكنه صامد...',
        'desc' => 'يشهد القطاع السياحي العالمي مرحلة صعبة مع أسواق أكثر تطلباً وقرارات سفر متأخرة....',
        'date' => '22 مايو 2026',
        'img' => '/images/act2.jpg',
    ],
    [
        'slug' => 'houssem-azouz-centre-ouest',
        'title' => 'حسام عزوز (رئيس الاتحاد المهني المشترك...',
        'desc' => 'حسام عزوز — الوسط الغربي للبلاد بما يحمله من آثار وألوان...',
        'date' => '7 أبريل 2026',
        'img' => '/images/act3.jpg',
        'hero_title' => "حسام عزوز (رئيس الاتحاد\nالمهني المشترك",
    ],
    array_merge([
        'slug' => 'trois-questions-walid-tritar',
        'title' => 'السياحة التونسية — ثلاثة أسئلة لوليد تريتار',
        'desc' => 'يجيب وليد تريتار، الرئيس الجديد لـ Fi2T، عن ثلاثة أسئلة حول الكل شامل والوجهة التونسية....',
        'date' => '11 مايو 2026',
        'img' => '/images/act1.jpg',
    ], $interviewAr),
    [
        'slug' => 'resilience-secteur-touristique',
        'title' => 'القطاع السياحي: تحت الضغط لكنه صامد...',
        'desc' => 'يشهد القطاع السياحي العالمي مرحلة صعبة مع أسواق أكثر تطلباً وقرارات سفر متأخرة....',
        'date' => '22 مايو 2026',
        'img' => '/images/act2.jpg',
    ],
    [
        'slug' => 'fi2t-centre-ouest',
        'title' => 'حسام عزوز (رئيس الاتحاد المهني المشترك...',
        'desc' => 'حسام عزوز — الوسط الغربي للبلاد بما يحمله من آثار وألوان...',
        'date' => '7 أبريل 2026',
        'img' => '/images/act3.jpg',
        'hero_title' => "حسام عزوز (رئيس الاتحاد\nالمهني المشترك",
    ],
    [
        'slug' => 'mandat-fi2t-2026',
        'title' => 'السياحة: وليد تريتار، الرئيس الجديد لـ Fi2T',
        'desc' => 'تم انتخاب وليد تريتار رئيساً جديداً لـ Fi2T للفترة 2026–2029....',
        'date' => '11 مايو 2026',
        'img' => '/images/act1.jpg',
    ],
    [
        'slug' => 'marches-touristiques-2026',
        'title' => 'القطاع السياحي: تحت الضغط لكنه صامد...',
        'desc' => 'يشهد القطاع السياحي العالمي مرحلة صعبة مع أسواق أكثر تطلباً وقرارات سفر متأخرة....',
        'date' => '22 مايو 2026',
        'img' => '/images/act2.jpg',
    ],
    [
        'slug' => 'patrimoine-centre-ouest',
        'title' => 'حسام عزوز (رئيس الاتحاد المهني المشترك...',
        'desc' => 'حسام عزوز — الوسط الغربي للبلاد بما يحمله من آثار وألوان...',
        'date' => '7 أبريل 2026',
        'img' => '/images/act3.jpg',
        'hero_title' => "حسام عزوز (رئيس الاتحاد\nالمهني المشترك",
    ],
];

return [
    'en' => $baseEn,
    'ar' => $baseAr,
    'home_en' => array_slice($baseEn, 0, 3),
    'home_ar' => array_slice($baseAr, 0, 3),
];
