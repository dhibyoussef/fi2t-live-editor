<?php
/**
 * Patch Accueil groupements to exact Figma 12-card set.
 */
$itemsFr = [
    ['label' => 'Agences de voyages', 'slug' => 'agences-de-voyages', 'icon' => '/images/icon1.png?v=5'],
    ['label' => 'Hébergement alternatif', 'slug' => 'hebergements-alternatifs', 'icon' => '/images/icon2.png?v=5'],
    ['label' => 'Tourisme culturel', 'slug' => 'tourisme-culturel', 'icon' => '/images/icon3.png?v=5'],
    ['label' => 'Tourisme de santé', 'slug' => 'tourisme-de-sante', 'icon' => '/images/icon4.png?v=5'],
    ['label' => "Tourisme d'aventure", 'slug' => 'tourisme-aventure', 'icon' => '/images/icon5.png?v=5'],
    ['label' => "Tourisme d'affaires", 'slug' => 'tourisme-affaire', 'icon' => '/images/icon6.png?v=5'],
    ['label' => 'Tourisme écologique', 'slug' => 'tourisme-ecologique', 'icon' => '/images/icon7.png?v=5'],
    ['label' => 'Tourisme aéronautique', 'slug' => 'tourisme-aeronautique', 'icon' => '/images/icon8.png?v=5'],
    ['label' => 'Tourisme automobile', 'slug' => 'tourisme-automobile', 'icon' => '/images/icon9.png?v=5'],
    ['label' => 'Tourisme sportif', 'slug' => 'tourisme-sportif', 'icon' => '/images/icon10.png?v=5'],
    ['label' => 'Tourisme nautique', 'slug' => 'tourisme-nautique', 'icon' => '/images/icon11.png?v=5'],
    ['label' => 'Tourisme subaquatique', 'slug' => 'tourisme-subaquatique', 'icon' => '/images/icon12.png?v=5'],
];

$itemsEn = [
    ['label' => 'Travel agencies', 'slug' => 'agences-de-voyages', 'icon' => '/images/icon1.png?v=5'],
    ['label' => 'Alternative accommodation', 'slug' => 'hebergements-alternatifs', 'icon' => '/images/icon2.png?v=5'],
    ['label' => 'Cultural tourism', 'slug' => 'tourisme-culturel', 'icon' => '/images/icon3.png?v=5'],
    ['label' => 'Health tourism', 'slug' => 'tourisme-de-sante', 'icon' => '/images/icon4.png?v=5'],
    ['label' => 'Adventure tourism', 'slug' => 'tourisme-aventure', 'icon' => '/images/icon5.png?v=5'],
    ['label' => 'Business tourism', 'slug' => 'tourisme-affaire', 'icon' => '/images/icon6.png?v=5'],
    ['label' => 'Ecological tourism', 'slug' => 'tourisme-ecologique', 'icon' => '/images/icon7.png?v=5'],
    ['label' => 'Aeronautical tourism', 'slug' => 'tourisme-aeronautique', 'icon' => '/images/icon8.png?v=5'],
    ['label' => 'Automotive tourism', 'slug' => 'tourisme-automobile', 'icon' => '/images/icon9.png?v=5'],
    ['label' => 'Sports tourism', 'slug' => 'tourisme-sportif', 'icon' => '/images/icon10.png?v=5'],
    ['label' => 'Nautical tourism', 'slug' => 'tourisme-nautique', 'icon' => '/images/icon11.png?v=5'],
    ['label' => 'Underwater tourism', 'slug' => 'tourisme-subaquatique', 'icon' => '/images/icon12.png?v=5'],
];

$itemsAr = [
    ['label' => 'وكالات الأسفار', 'slug' => 'agences-de-voyages', 'icon' => '/images/icon1.png?v=5'],
    ['label' => 'الإقامة البديلة', 'slug' => 'hebergements-alternatifs', 'icon' => '/images/icon2.png?v=5'],
    ['label' => 'السياحة الثقافية', 'slug' => 'tourisme-culturel', 'icon' => '/images/icon3.png?v=5'],
    ['label' => 'سياحة الصحة', 'slug' => 'tourisme-de-sante', 'icon' => '/images/icon4.png?v=5'],
    ['label' => 'سياحة المغامرة', 'slug' => 'tourisme-aventure', 'icon' => '/images/icon5.png?v=5'],
    ['label' => 'سياحة الأعمال', 'slug' => 'tourisme-affaire', 'icon' => '/images/icon6.png?v=5'],
    ['label' => 'السياحة البيئية', 'slug' => 'tourisme-ecologique', 'icon' => '/images/icon7.png?v=5'],
    ['label' => 'السياحة الجوية', 'slug' => 'tourisme-aeronautique', 'icon' => '/images/icon8.png?v=5'],
    ['label' => 'سياحة السيارات', 'slug' => 'tourisme-automobile', 'icon' => '/images/icon9.png?v=5'],
    ['label' => 'السياحة الرياضية', 'slug' => 'tourisme-sportif', 'icon' => '/images/icon10.png?v=5'],
    ['label' => 'السياحة البحرية', 'slug' => 'tourisme-nautique', 'icon' => '/images/icon11.png?v=5'],
    ['label' => 'السياحة تحت الماء', 'slug' => 'tourisme-subaquatique', 'icon' => '/images/icon12.png?v=5'],
];

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=fi2t', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $byLocale = [
        '_all' => $itemsFr,
        'fr' => $itemsFr,
        'en' => $itemsEn,
        'ar' => $itemsAr,
    ];

    $stmt = $pdo->query("SELECT id, page, locale, value FROM content_blocks WHERE section='groupements' AND `key`='items'");
    $n = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $locale = $row['locale'];
        $items = $byLocale[$locale] ?? $itemsFr;
        $json = json_encode($items, JSON_UNESCAPED_UNICODE);
        $u = $pdo->prepare('UPDATE content_blocks SET value=? WHERE id=?');
        $u->execute([$json, $row['id']]);
        $n++;
        echo "updated id {$row['id']} page={$row['page']} locale={$locale}\n";
    }
    echo "patched {$n} rows\n";
} catch (Throwable $e) {
    echo 'db skip: ' . $e->getMessage() . "\n";
}
