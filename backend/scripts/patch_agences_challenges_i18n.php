<?php
/**
 * Translate défis 02–05 bodies for EN / AR after the FR enrich patch.
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$byLocale = [
    'en' => [
        1 => [
            'body' => "• Commercial margins under constant pressure from platforms and international tour operators.\n• Heavy reliance on foreign tour operators and reduced commissions.\n• Strong seasonality limiting cash flow and investment capacity.\n• Difficult access to bank financing and support schemes.",
            'constat' => 'FI2T finding: without economic strengthening, agencies can neither modernise nor withstand shocks.',
        ],
        2 => [
            'body' => "• Offer still too focused on mass seaside tourism.\n• Underuse of high-value niches (cultural, sustainable, sports, MICE, senior).\n• Lack of packaging and go-to-market for differentiated products.\n• Insufficient coordination with the Federation’s other sectors.",
            'constat' => 'FI2T finding: diversification is the condition for value-driven and resilient tourism.',
        ],
        3 => [
            'body' => "• Partial digitisation of internal processes (booking, CRM, reporting).\n• Weak presence and visibility on digital channels.\n• Distribution tools poorly suited to current customer behaviours.\n• Structural lag versus OTAs and international platforms.",
            'constat' => 'FI2T finding: without digital acceleration, agencies lose market share and clients.',
        ],
        4 => [
            'body' => "• Need for continuous training on emerging travel professions.\n• Gaps in digital customer relations and e-commerce.\n• Lack of skills in designing experience products.\n• Weak data and yield-management culture.",
            'constat' => 'FI2T finding: upskilling is a priority lever for competitiveness.',
        ],
    ],
    'ar' => [
        1 => [
            'body' => "• هوامش تجارية تحت ضغط مستمر أمام المنصات ومنظمي الرحلات الدوليين.\n• اعتماد قوي على منظمي الرحلات الأجانب والعمولات المخفّضة.\n• موسمية حادة تحدّ من السيولة وقدرة الاستثمار.\n• صعوبة الولوج إلى التمويل البنكي وآليات الدعم.",
            'constat' => 'ملاحظة FI2T: بدون تعزيز اقتصادي، لا تستطيع الوكالات التحديث ولا مواجهة الصدمات.',
        ],
        2 => [
            'body' => "• عرض ما زال مركّزاً أكثر من اللازم على السياحة الشاطئية الجماعية.\n• ضعف استغلال المجالات ذات القيمة العالية (ثقافي، مستدام، رياضي، أعمال، كبار السن).\n• نقص في تغليف المنتجات المميزة وتسويقها.\n• تنسيق غير كافٍ مع باقي فروع الجامعة.",
            'constat' => 'ملاحظة FI2T: التنويع شرط لسياحة ذات قيمة ومرونة.',
        ],
        3 => [
            'body' => "• رقمنة جزئية للعمليات الداخلية (الحجز، إدارة العملاء، التقارير).\n• حضور ضعيف على القنوات الرقمية.\n• أدوات توزيع غير ملائمة لسلوك العملاء الحالي.\n• تأخّر هيكلي أمام منصات الحجز الدولية.",
            'constat' => 'ملاحظة FI2T: بدون تسريع رقمي، تفقد الوكالات حصص السوق والعملاء.',
        ],
        4 => [
            'body' => "• حاجة إلى تكوين مستمر في المهن الناشئة للسفر.\n• ثغرات في علاقة العميل الرقمية والتجارة الإلكترونية.\n• نقص كفاءات في تصميم منتجات التجربة.\n• ثقافة ضعيفة للبيانات وإدارة العائد.",
            'constat' => 'ملاحظة FI2T: رفع الكفاءات رافعة أولوية للقدرة التنافسية.',
        ],
    ],
];

foreach ($byLocale as $locale => $enriched) {
    $rows = DB::table('content_blocks')
        ->where('page', 'agences-de-voyages')
        ->where('section', 'challenges')
        ->where('key', 'items')
        ->where('locale', $locale)
        ->get();

    foreach ($rows as $row) {
        $items = json_decode($row->value, true);
        if (!is_array($items)) {
            continue;
        }
        foreach ($enriched as $idx => $patch) {
            if (!isset($items[$idx])) {
                continue;
            }
            $items[$idx]['body'] = $patch['body'];
            $items[$idx]['constat'] = $patch['constat'];
        }
        DB::table('content_blocks')->where('id', $row->id)->update([
            'value' => json_encode($items, JSON_UNESCAPED_UNICODE),
            'updated_at' => now(),
        ]);
        echo "translated challenges.items id={$row->id} locale={$locale}\n";
    }
}
