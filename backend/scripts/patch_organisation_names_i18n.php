<?php
/**
 * Organisation i18n: Arabic names for board/staff, live map card (no baked FR text).
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$boardAr = [
    ['name' => 'حسام بن عزوز', 'role' => 'الرئيس', 'image' => ''],
    ['name' => 'شهلة خيخية', 'role' => 'الأمينة العامة', 'image' => ''],
    ['name' => 'أحمد عباية', 'role' => 'أمين المال', 'image' => ''],
    ['name' => 'نجيب قانة', 'role' => 'نائب الرئيس', 'image' => ''],
    ['name' => 'عمر شريف', 'role' => 'مستشار', 'image' => ''],
];

$staffAr = [
    ['initials' => 'KB', 'name' => 'خولة بشير', 'role' => 'المديرة الإدارية'],
    ['initials' => 'HI', 'name' => 'هبة إنوبلي', 'role' => 'مسؤولة الموقع'],
    ['initials' => 'SS', 'name' => 'سارة سالمي', 'role' => 'الشؤون الإدارية والمحاسبية'],
];

$staffEn = [
    ['initials' => 'KB', 'name' => "Khawla B'Chir", 'role' => 'Administrative Director'],
    ['initials' => 'HI', 'name' => 'Hiba Inoubli', 'role' => 'Webmaster'],
    ['initials' => 'SS', 'name' => 'Sarra Sallemi', 'role' => 'Administrative and accounting affairs'],
];

$updates = [
    ['board', 'members', 'ar', json_encode($boardAr, JSON_UNESCAPED_UNICODE)],
    ['headquarters', 'staff', 'ar', json_encode($staffAr, JSON_UNESCAPED_UNICODE)],
    ['headquarters', 'staff', 'en', json_encode($staffEn, JSON_UNESCAPED_UNICODE)],
    ['regional', 'map_image', '_all', '/images/org-regional-map-card.png?v=1'],
];

foreach ($updates as [$section, $key, $locale, $value]) {
    $n = DB::table('content_blocks')
        ->where('page', 'organisation')
        ->where('section', $section)
        ->where('key', $key)
        ->where('locale', $locale)
        ->update(['value' => $value, 'updated_at' => now()]);
    if ($n === 0) {
        // insert if missing
        $fr = DB::table('content_blocks')
            ->where('page', 'organisation')
            ->where('section', $section)
            ->where('key', $key)
            ->where('locale', 'fr')
            ->first();
        $type = $fr->type ?? ($key === 'map_image' ? 'image' : 'json');
        $label = $fr->label ?? "{$section}.{$key}";
        DB::table('content_blocks')->insert([
            'page' => 'organisation',
            'section' => $section,
            'key' => $key,
            'locale' => $locale,
            'type' => $type,
            'label' => $label,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "inserted {$section}.{$key} ({$locale})\n";
    } else {
        echo "updated {$section}.{$key} ({$locale}) rows={$n}\n";
    }
}
