<?php

/**
 * Explicit full translations for key pages (preferred over phrase replace).
 * Values may be string or array (JSON-encoded by the seeder).
 */
$articlesI18n = require __DIR__ . '/actualites-articles-i18n.php';

$homeEnItems = [
    ['label' => 'Travel agencies', 'slug' => 'agences-de-voyages', 'icon' => '/images/icon1.png'],
    ['label' => 'Alternative tourist accommodation', 'slug' => 'hebergements-alternatifs', 'icon' => '/images/icon2.png'],
    ['label' => 'Cultural tourism', 'slug' => 'tourisme-culturel', 'icon' => '/images/icon3.png'],
    ['label' => 'Thalassotherapy', 'slug' => 'thalassotherapie', 'icon' => '/images/icon4.png'],
    ['label' => 'Senior tourism', 'slug' => 'tourisme-senior', 'icon' => '/images/icon5.png'],
    ['label' => 'Thermal tourism', 'slug' => 'tourisme-thermal', 'icon' => '/images/icon6.png'],
    ['label' => 'Medical tourism', 'slug' => 'tourisme-medical', 'icon' => '/images/icon7.png'],
    ['label' => 'Adventure / alternative tourism', 'slug' => 'tourisme-aventure', 'icon' => '/images/icon8.png'],
    ['label' => 'Business tourism', 'slug' => 'tourisme-affaire', 'icon' => '/images/icon9.png'],
    ['label' => 'Golf tourism', 'slug' => 'tourisme-golfique', 'icon' => '/images/icon10.png'],
    ['label' => 'Pleasure boating tourism', 'slug' => 'tourisme-plaisance', 'icon' => '/images/icon11.png'],
    ['label' => 'Automotive tourism', 'slug' => 'tourisme-automobile', 'icon' => '/images/icon12.png'],
];

$homeArItems = [
    ['label' => 'وكالات الأسفار', 'slug' => 'agences-de-voyages', 'icon' => '/images/icon1.png'],
    ['label' => 'الإقامات السياحية البديلة', 'slug' => 'hebergements-alternatifs', 'icon' => '/images/icon2.png'],
    ['label' => 'السياحة الثقافية', 'slug' => 'tourisme-culturel', 'icon' => '/images/icon3.png'],
    ['label' => 'العلاج بمياه البحر', 'slug' => 'thalassotherapie', 'icon' => '/images/icon4.png'],
    ['label' => 'سياحة كبار السن', 'slug' => 'tourisme-senior', 'icon' => '/images/icon5.png'],
    ['label' => 'السياحة الحرارية', 'slug' => 'tourisme-thermal', 'icon' => '/images/icon6.png'],
    ['label' => 'السياحة الطبية', 'slug' => 'tourisme-medical', 'icon' => '/images/icon7.png'],
    ['label' => 'سياحة المغامرة / البديلة', 'slug' => 'tourisme-aventure', 'icon' => '/images/icon8.png'],
    ['label' => 'سياحة الأعمال', 'slug' => 'tourisme-affaire', 'icon' => '/images/icon9.png'],
    ['label' => 'سياحة الغولف', 'slug' => 'tourisme-golfique', 'icon' => '/images/icon10.png'],
    ['label' => 'سياحة اليخوت', 'slug' => 'tourisme-plaisance', 'icon' => '/images/icon11.png'],
    ['label' => 'السياحة السياراتية', 'slug' => 'tourisme-automobile', 'icon' => '/images/icon12.png'],
];

$pillarsEn = [
    ['title' => 'Structured sector', 'icon' => '/images/g-icon-structure.svg'],
    ['title' => 'Professional interests', 'icon' => '/images/g-icon-interets.svg'],
    ['title' => 'Added value', 'icon' => '/images/g-icon-valeur.svg'],
    ['title' => 'Regulatory framework', 'icon' => '/images/g-icon-cadre.svg'],
];

$pillarsAr = [
    ['title' => 'قطاع منظّم', 'icon' => '/images/g-icon-structure.svg'],
    ['title' => 'المصالح المهنية', 'icon' => '/images/g-icon-interets.svg'],
    ['title' => 'قيمة مضافة', 'icon' => '/images/g-icon-valeur.svg'],
    ['title' => 'إطار تنظيمي', 'icon' => '/images/g-icon-cadre.svg'],
];

$groupementSharedEn = [
    'positioning.title' => 'FI2T Positioning',
    'positioning.pillars' => $pillarsEn,
    'challenges.title' => 'FI2T Positioning',
    'enjeux.title' => 'Strategic stakes',
    'proposals.title' => 'Strategic proposals',
];

$groupementSharedAr = [
    'positioning.title' => 'تموضع FI2T',
    'positioning.pillars' => $pillarsAr,
    'challenges.title' => 'تموضع FI2T',
    'enjeux.title' => 'التحديات الاستراتيجية',
    'proposals.title' => 'المقترحات الاستراتيجية',
];

$slugs = [
    'agences-de-voyages', 'hebergements-alternatifs', 'tourisme-culturel', 'thalassotherapie',
    'tourisme-senior', 'tourisme-thermal', 'tourisme-medical', 'tourisme-aventure',
    'tourisme-affaire', 'tourisme-golfique', 'tourisme-plaisance', 'tourisme-automobile',
];

$enPages = [
    'home' => [
        'hero.title' => 'The future of Tunisian tourism is built here!',
        'hero.subtitle' => 'Unite, innovate and promote Tunisian tourism',
        'hero.cta_primary' => 'Join the federation',
        'hero.cta_secondary' => 'Learn more',
        'about.title' => 'Who we are',
        'about.body' => 'The Interprofessional Federation of Tunisian Tourism is an independent employers’ professional union founded in March 2016 by operators from different tourism activities: travel agencies, alternative accommodation, leisure, entertainment, sports, transport…',
        'about.cta' => 'Sign up',
        'about.badge' => "10+\nYears of experience",
        'objectifs.title' => 'Our Objectives',
        'objectifs.intro' => 'Fi2T aims to bring together different tourism operators within a single professional union.',
        'objectifs.items' => [
            ['num' => '01', 'title' => 'Strategic vision', 'desc' => 'Contribute to strategic vision for the sector'],
            ['num' => '02', 'title' => 'Members’ interests', 'desc' => 'Safeguard economic and social interests'],
            ['num' => '03', 'title' => 'Synergy', 'desc' => 'Create synergy between operators'],
            ['num' => '04', 'title' => 'Development', 'desc' => 'Contribute to the development of Tunisian tourism'],
        ],
        'groupements.title' => 'Professional Groups',
        'groupements.intro' => "Led by 3 elected members, they represent and defend operators’ interests.\nEach group defines its own strategy for targeted industry expertise.",
        'groupements.items' => $homeEnItems,
        'adherer.title' => 'Why join Fi2T?',
        'adherer.badge' => "20+\nApproved partners",
        'adherer.cta' => 'Join now',
        'adherer.reasons' => [
            ['title' => 'Institutional representation', 'desc' => 'Be represented before governments and institutions'],
            ['title' => 'Strategic networking', 'desc' => 'Join a structured professional network'],
            ['title' => 'Greater visibility', 'desc' => 'Improve visibility and business opportunities'],
            ['title' => 'Quality label', 'desc' => 'Benefit from a quality and compliance label'],
            ['title' => 'Resources & expertise', 'desc' => 'Access professional resources and training'],
        ],
        'actualites.title' => 'Latest News',
        'actualites.cta' => 'See all',
        'actualites.items' => $articlesI18n['home_en'],
        'cta.title' => 'Join our vision for the future',
        'cta.body' => "Become a member of the Federation and take an active part in building\noutstanding Tunisian tourism.",
        'cta.primary' => 'Join the federation',
        'cta.secondary' => 'Contact space',
    ],
    'organisation' => [
        'hero.title' => 'Organisation',
        'stats.items' => [
            ['value' => '12', 'label' => 'GROUPS'],
            ['value' => '11', 'label' => 'REGIONS'],
            ['value' => '03', 'label' => 'YEARS OF MANDATE'],
        ],
        'board.title' => 'Current composition',
        'board.members' => [
            ['name' => 'Houssem Ben Azouz', 'role' => 'PRESIDENT', 'image' => ''],
            ['name' => 'Chahla Khekhia', 'role' => 'SECRETARY GENERAL', 'image' => ''],
            ['name' => 'Ahmed Oubaia', 'role' => 'TREASURER', 'image' => ''],
            ['name' => 'Néjib Gana', 'role' => 'VICE-PRESIDENT', 'image' => ''],
            ['name' => 'Omar Cherif', 'role' => 'ADVISOR', 'image' => ''],
        ],
        'headquarters.title' => 'Fi2T headquarters office',
        'headquarters.staff' => [
            ['initials' => 'KB', 'name' => "Khawla B'Chir", 'role' => 'Administrative Director'],
            ['initials' => 'HI', 'name' => 'Hiba Inoubli', 'role' => 'Webmaster'],
            ['initials' => 'SS', 'name' => 'Sarra Sallemi', 'role' => 'Administrative and accounting affairs'],
        ],
        'regional.title' => 'Regional offices',
        'regional.map_label' => '11 Regional Offices',
        'regional.items' => [
            ['name' => 'Mr Nebil Azouz', 'region' => 'Bizerte'],
            ['name' => 'Mr Foued Ben Ammar', 'region' => 'Hammamet/Nabeul'],
            ['name' => 'Mr Khaled Hayouni', 'region' => 'Monastir/Mahdia'],
            ['name' => 'Mr Alaeddine Khodhri', 'region' => 'Gabes'],
            ['name' => 'Mme Chahla Khekhia', 'region' => 'Le Kef'],
            ['name' => 'Mr Akram Bouzguarrou', 'region' => 'Sousse'],
            ['name' => 'Mr Belgacem Kalawi', 'region' => 'Kairouan'],
            ['name' => 'Mr Hatem Mejlissi', 'region' => 'Djerba'],
        ],
        'groupements.title' => 'Professional Groups',
        'groupements.items' => $homeEnItems,
    ],
    'qui-sommes-nous' => [
        'hero.title' => 'Who we are',
        'mission.title' => 'Our history & mission',
        'values.title' => 'Our objectives',
        'diversify.title' => 'Why diversify and innovate?',
        'diversify.intro' => 'Diversifying tourism products is not a luxury — it is rather:',
        'join.title' => 'Ready to join excellence?',
        'join.cta' => 'Become a member',
    ],
    'actualites' => [
        'hero.title' => 'News',
        'grid.items' => $articlesI18n['en'],
    ],
    'contact' => [
        'hero.title' => 'Contact',
        'info.title' => 'Contact information',
        'info.address_label' => 'Address',
        'info.phone_label' => 'Phone',
        'info.email_label' => 'Email',
        'form.label_name' => 'FULL NAME',
        'form.placeholder_name' => 'First and last name',
        'form.label_email' => 'EMAIL ADDRESS',
        'form.placeholder_email' => 'name@example.com',
        'form.label_subject' => 'SUBJECT',
        'form.placeholder_subject' => 'E.g.: Request for...',
        'form.label_message' => 'MESSAGE',
        'form.placeholder_message' => 'Your message here...',
        'form.submit' => 'Send',
    ],
    'fiche-adhesion' => [
        'hero.title' => 'Membership form',
        'intro.title' => 'Join FI2T',
        'intro.body' => 'Become a member of the Interprofessional Federation of Tunisian Tourism and take an active part in modernising, diversifying and professionalising Tunisian tourism.',
        'benefits.title' => 'Why join?',
        'benefits.items' => [
            ['title' => 'Representation', 'desc' => 'Collective defence of professional interests before the authorities.'],
            ['title' => 'Network', 'desc' => 'Access to a network of operators and partners in the sector.'],
            ['title' => 'Visibility', 'desc' => 'Showcase your activity within the Federation.'],
            ['title' => 'Resources', 'desc' => 'Training, information and professional support.'],
        ],
        'form.title' => 'Membership application',
        'form.label_org' => 'COMPANY NAME',
        'form.placeholder_org' => 'Name of your organisation',
        'form.label_contact' => 'CONTACT NAME',
        'form.placeholder_contact' => 'First and last name',
        'form.label_email' => 'EMAIL ADDRESS',
        'form.placeholder_email' => 'name@example.com',
        'form.label_phone' => 'PHONE',
        'form.placeholder_phone' => '+216 XX XXX XXX',
        'form.label_activity' => 'ACTIVITY / GROUP',
        'form.placeholder_activity' => 'E.g.: Travel agencies',
        'form.label_message' => 'MESSAGE',
        'form.placeholder_message' => 'Briefly describe your activity…',
        'form.submit' => 'Submit application',
    ],
    'global' => [
        'settings.tagline' => 'Interprofessional Federation of Tunisian Tourism',
        'footer.about' => 'The Interprofessional Federation of Tunisian Tourism works for the outreach and modernisation of the sector.',
        'footer.newsletter' => 'Stay informed about our latest initiatives.',
        'settings.hotel_name' => 'FI2T',
    ],
];

$arPages = [
    'home' => [
        'hero.title' => 'مستقبل السياحة التونسية يُبنى هنا!',
        'hero.subtitle' => 'توحيد وابتكار وتعزيز السياحة التونسية',
        'hero.cta_primary' => 'الانضمام إلى الفيدرالية',
        'hero.cta_secondary' => 'اعرف المزيد',
        'about.title' => 'من نحن؟',
        'about.body' => 'الاتحاد المهني المشترك للسياحة التونسية هو نقابة مهنية لأرباب العمل مستقلة تأسست في مارس 2016 من قبل فاعلين من أنشطة سياحية مختلفة: وكالات أسفار، إقامة بديلة، ترفيه، تنشيط، رياضة، نقل…',
        'about.cta' => 'سجّل الآن',
        'about.badge' => "10+\nسنوات من الخبرة",
        'objectifs.title' => 'أهدافنا',
        'objectifs.intro' => 'تهدف Fi2T إلى جمع مختلف الفاعلين السياحيين ضمن نقابة مهنية واحدة.',
        'objectifs.items' => [
            ['num' => '01', 'title' => 'رؤية استراتيجية', 'desc' => 'المساهمة في الرؤية الاستراتيجية للقطاع'],
            ['num' => '02', 'title' => 'مصالح الأعضاء', 'desc' => 'حماية المصالح الاقتصادية والاجتماعية'],
            ['num' => '03', 'title' => 'التآزر', 'desc' => 'خلق تآزر بين الفاعلين'],
            ['num' => '04', 'title' => 'التطوير', 'desc' => 'المساهمة في تطوير السياحة التونسية'],
        ],
        'groupements.title' => 'التجمعات المهنية',
        'groupements.intro' => "يديرها 3 أعضاء منتخبون، وتمثل وتدافع عن مصالح الفاعلين.\nيحدد كل تجمع استراتيجيته باستقلالية لخبرة مهنية مستهدفة.",
        'groupements.items' => $homeArItems,
        'adherer.title' => 'لماذا الانضمام إلى Fi2T؟',
        'adherer.badge' => "20+\nشركاء معتمدون",
        'adherer.cta' => 'انضم الآن',
        'adherer.reasons' => [
            ['title' => 'التمثيل المؤسسي', 'desc' => 'التمثيل أمام الحكومات والمؤسسات'],
            ['title' => 'التواصل الاستراتيجي', 'desc' => 'المشاركة في شبكة مهنية منظمة'],
            ['title' => 'رؤية أكبر', 'desc' => 'تعزيز الظهور والفرص التجارية'],
            ['title' => 'علامة الجودة', 'desc' => 'الاستفادة من علامة جودة وامتثال'],
            ['title' => 'موارد وخبرة', 'desc' => 'الوصول إلى موارد مهنية وتكوينات'],
        ],
        'actualites.title' => 'آخر الأخبار',
        'actualites.cta' => 'عرض الكل',
        'actualites.items' => $articlesI18n['home_ar'],
        'cta.title' => 'انضموا إلى رؤيتنا للمستقبل',
        'cta.body' => "كن عضواً في الفيدرالية وشارك بفعالية في بناء\nسياحة تونسية استثنائية.",
        'cta.primary' => 'الانضمام إلى الفيدرالية',
        'cta.secondary' => 'فضاء الاتصال',
    ],
    'organisation' => [
        'hero.title' => 'التنظيم',
        'stats.items' => [
            ['value' => '12', 'label' => 'تجمعات'],
            ['value' => '11', 'label' => 'جهات'],
            ['value' => '03', 'label' => 'سنوات الولاية'],
        ],
        'board.title' => 'التشكيلة الحالية',
        'headquarters.title' => 'مكتب مقر Fi2T',
        'regional.title' => 'المكاتب الجهوية',
        'regional.map_label' => '11 مكتباً جهوياً',
        'regional.items' => [
            ['name' => 'السيد نبيل عزوز', 'region' => 'بنزرت'],
            ['name' => 'السيد فؤاد بن عمار', 'region' => 'الحمامات/نابل'],
            ['name' => 'السيد خالد حيوني', 'region' => 'المنستير/المهدية'],
            ['name' => 'السيد علاء الدين خضري', 'region' => 'قابس'],
            ['name' => 'السيدة شهلة خيخية', 'region' => 'الكاف'],
            ['name' => 'السيد أكرم بوزقرو', 'region' => 'سوسة'],
            ['name' => 'السيد بلقاسم قلاوي', 'region' => 'القيروان'],
            ['name' => 'السيد حاتم المجلسي', 'region' => 'جربة'],
        ],
        'groupements.title' => 'التجمعات المهنية',
        'groupements.items' => $homeArItems,
    ],
    'qui-sommes-nous' => [
        'hero.title' => 'من نحن',
        'mission.title' => 'تاريخنا ورسالتنا',
        'values.title' => 'أهدافنا',
        'diversify.title' => 'لماذا التنويع والابتكار؟',
        'join.title' => 'هل أنتم مستعدون للانضمام إلى التميز؟',
        'join.cta' => 'كن عضواً',
    ],
    'actualites' => [
        'hero.title' => 'الأخبار',
        'grid.items' => $articlesI18n['ar'],
    ],
    'contact' => [
        'hero.title' => 'اتصل بنا',
        'info.title' => 'معلومات الاتصال',
        'info.address_label' => 'العنوان',
        'info.phone_label' => 'الهاتف',
        'info.email_label' => 'البريد الإلكتروني',
        'form.label_name' => 'الاسم الكامل',
        'form.placeholder_name' => 'الاسم واللقب',
        'form.label_email' => 'البريد الإلكتروني',
        'form.label_subject' => 'الموضوع',
        'form.label_message' => 'الرسالة',
        'form.placeholder_message' => 'رسالتكم هنا...',
        'form.submit' => 'إرسال',
    ],
    'fiche-adhesion' => [
        'hero.title' => 'استمارة الانضمام',
        'intro.title' => 'انضموا إلى FI2T',
        'intro.body' => 'انضموا إلى الاتحاد المهني المشترك للسياحة التونسية وشاركوا في تحديث وتنويع واحتراف السياحة التونسية.',
        'benefits.title' => 'لماذا الانضمام؟',
        'benefits.items' => [
            ['title' => 'التمثيل', 'desc' => 'دفاع جماعي عن المصالح المهنية أمام السلطات.'],
            ['title' => 'الشبكة', 'desc' => 'الوصول إلى شبكة من الفاعلين والشركاء في القطاع.'],
            ['title' => 'الظهور', 'desc' => 'إبراز نشاطكم داخل الفيدرالية.'],
            ['title' => 'الموارد', 'desc' => 'تكوين ومعلومات ومرافقة مهنية.'],
        ],
        'form.title' => 'طلب انضمام',
        'form.label_org' => 'الاسم الاجتماعي',
        'form.label_contact' => 'اسم جهة الاتصال',
        'form.label_email' => 'البريد الإلكتروني',
        'form.label_phone' => 'الهاتف',
        'form.label_activity' => 'النشاط / التجمع',
        'form.label_message' => 'الرسالة',
        'form.submit' => 'إرسال الطلب',
    ],
    'global' => [
        'settings.tagline' => 'الاتحاد المهني المشترك للسياحة التونسية',
        'footer.about' => 'يعمل الاتحاد المهني المشترك للسياحة التونسية على إشعاع القطاع وتحديثه.',
        'footer.newsletter' => 'ابقوا على اطلاع بآخر مبادراتنا.',
        'settings.hotel_name' => 'FI2T',
    ],
];

foreach ($slugs as $slug) {
    $enPages[$slug] = $groupementSharedEn;
    $arPages[$slug] = $groupementSharedAr;
}

return [
    'en' => $enPages,
    'ar' => $arPages,
];
