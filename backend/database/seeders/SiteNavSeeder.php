<?php

namespace Database\Seeders;

use App\Models\SiteNavItem;
use Illuminate\Database\Seeder;

class SiteNavSeeder extends Seeder
{
    public function run(): void
    {
        SiteNavItem::query()->delete();

        $items = [
            ['label_fr' => 'Accueil', 'label_en' => 'Home', 'label_ar' => 'الرئيسية', 'url' => '/', 'sort_order' => 0],
            ['label_fr' => 'Qui sommes-nous ?', 'label_en' => 'About us', 'label_ar' => 'من نحن', 'url' => '/qui-sommes-nous', 'sort_order' => 1],
            [
                'label_fr' => 'Organisation', 'label_en' => 'Organisation', 'label_ar' => 'التنظيم',
                'url' => '/organisation', 'sort_order' => 2,
                'children' => [
                    ['label_fr' => 'Agences de voyages', 'label_en' => 'Travel agencies', 'label_ar' => 'وكالات الأسفار', 'url' => '/organisation'],
                    ['label_fr' => 'Hébergements alternatifs', 'label_en' => 'Alternative lodging', 'label_ar' => 'إقامات بديلة', 'url' => '/organisation'],
                    ['label_fr' => 'Tourisme culturel', 'label_en' => 'Cultural tourism', 'label_ar' => 'سياحة ثقافية', 'url' => '/organisation'],
                ],
            ],
            ['label_fr' => 'Actualités', 'label_en' => 'News', 'label_ar' => 'أخبار', 'url' => '/actualites', 'sort_order' => 3],
            ['label_fr' => 'Fiche adhésion', 'label_en' => 'Membership', 'label_ar' => 'انخراط', 'url' => '/fiche-adhesion', 'sort_order' => 4],
            ['label_fr' => 'Contact', 'label_en' => 'Contact', 'label_ar' => 'اتصل بنا', 'url' => '/contact', 'sort_order' => 5],
        ];

        foreach ($items as $item) {
            $children = $item['children'] ?? [];
            unset($item['children']);

            $parent = SiteNavItem::create(array_merge($item, [
                'parent_id' => null,
                'is_active' => true,
            ]));

            foreach ($children as $i => $child) {
                SiteNavItem::create(array_merge($child, [
                    'parent_id' => $parent->id,
                    'sort_order' => $i,
                    'is_active' => true,
                ]));
            }
        }
    }
}
