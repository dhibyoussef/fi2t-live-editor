<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\CmsSection;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            ['slug' => 'home', 'title' => "Page d'accueil", 'status' => 'published', 'template' => 'home', 'is_system' => true, 'sort_order' => 1],
            ['slug' => 'qui-sommes-nous', 'title' => 'Qui sommes-nous ?', 'status' => 'published', 'template' => 'default', 'is_system' => true, 'sort_order' => 2],
            ['slug' => 'organisation', 'title' => 'Organisation', 'status' => 'published', 'template' => 'default', 'is_system' => true, 'sort_order' => 3],
            ['slug' => 'actualites', 'title' => 'Actualités', 'status' => 'published', 'template' => 'default', 'is_system' => true, 'sort_order' => 4],
            ['slug' => 'fiche-adhesion', 'title' => 'Fiche adhésion', 'status' => 'published', 'template' => 'landing', 'is_system' => true, 'sort_order' => 5],
            ['slug' => 'contact', 'title' => 'Contact', 'status' => 'published', 'template' => 'default', 'is_system' => true, 'sort_order' => 6],
            ['slug' => 'global', 'title' => 'Global (toutes les pages)', 'status' => 'published', 'template' => 'global', 'is_system' => true, 'sort_order' => 99],
        ];

        foreach ($pages as $page) {
            CmsPage::updateOrCreate(['slug' => $page['slug']], $page);
        }

        $groupementPages = [
            ['slug' => 'agences-de-voyages', 'title' => 'Agences de voyages', 'sort_order' => 7],
            ['slug' => 'hebergements-alternatifs', 'title' => 'Hébergements Alternatifs touristiques', 'sort_order' => 8],
            ['slug' => 'tourisme-culturel', 'title' => 'Tourisme culturel', 'sort_order' => 9],
            ['slug' => 'tourisme-de-sante', 'title' => 'Tourisme de santé', 'sort_order' => 10],
            ['slug' => 'thalassotherapie', 'title' => 'Thalassothérapie', 'sort_order' => 11],
            ['slug' => 'tourisme-senior', 'title' => 'Tourisme des séniors', 'sort_order' => 12],
            ['slug' => 'tourisme-thermal', 'title' => 'Tourisme thermal', 'sort_order' => 13],
            ['slug' => 'tourisme-medical', 'title' => 'Tourisme médical', 'sort_order' => 14],
            ['slug' => 'tourisme-aventure', 'title' => "Tourisme d'aventure / Tourisme Alternatif", 'sort_order' => 15],
            ['slug' => 'tourisme-affaire', 'title' => "Tourisme d'affaire", 'sort_order' => 16],
            ['slug' => 'tourisme-ecologique', 'title' => 'Tourisme écologique', 'sort_order' => 17],
            ['slug' => 'tourisme-aeronautique', 'title' => 'Tourisme aéronautique', 'sort_order' => 18],
            ['slug' => 'tourisme-automobile', 'title' => 'Tourisme automobile', 'sort_order' => 19],
            ['slug' => 'tourisme-sportif', 'title' => 'Tourisme sportif', 'sort_order' => 20],
            ['slug' => 'tourisme-golfique', 'title' => 'Tourisme golfique', 'sort_order' => 21],
            ['slug' => 'tourisme-nautique', 'title' => 'Tourisme nautique', 'sort_order' => 22],
            ['slug' => 'tourisme-plaisance', 'title' => 'Tourisme de plaisance', 'sort_order' => 23],
            ['slug' => 'tourisme-subaquatique', 'title' => 'Tourisme subaquatique', 'sort_order' => 24],
        ];

        foreach ($groupementPages as $page) {
            CmsPage::updateOrCreate(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'status' => 'published',
                    'template' => 'default',
                    'is_system' => true,
                    'sort_order' => $page['sort_order'],
                ]
            );
        }

        $homeSections = [
            ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
            ['slug' => 'about', 'title' => 'Qui sommes-nous', 'pattern' => 'text_image', 'sort_order' => 2],
            ['slug' => 'objectifs', 'title' => 'Nos objectifs', 'pattern' => 'cards_grid', 'sort_order' => 3],
            ['slug' => 'groupements', 'title' => 'Groupements professionnels', 'pattern' => 'cards_grid', 'sort_order' => 4],
            ['slug' => 'adherer', 'title' => 'Pourquoi adhérer', 'pattern' => 'text_image', 'sort_order' => 5],
            ['slug' => 'actualites', 'title' => 'Actualités', 'pattern' => 'cards_grid', 'sort_order' => 6],
            ['slug' => 'cta', 'title' => 'CTA rejoindre', 'pattern' => 'cta_banner', 'sort_order' => 7],
        ];

        foreach ($homeSections as $sec) {
            CmsSection::updateOrCreate(
                ['page' => 'home', 'slug' => $sec['slug']],
                array_merge($sec, ['page' => 'home'])
            );
        }

        foreach ([
            ['slug' => 'settings', 'title' => 'Paramètres du site', 'pattern' => 'text', 'sort_order' => 1],
            ['slug' => 'footer', 'title' => 'Pied de page', 'pattern' => 'text', 'sort_order' => 2],
        ] as $sec) {
            CmsSection::updateOrCreate(
                ['page' => 'global', 'slug' => $sec['slug']],
                array_merge($sec, ['page' => 'global'])
            );
        }

        foreach (['qui-sommes-nous', 'organisation', 'actualites', 'fiche-adhesion', 'contact'] as $slug) {
            if ($slug === 'qui-sommes-nous') {
                $sections = [
                    ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
                    ['slug' => 'mission', 'title' => 'Histoire & Mission', 'pattern' => 'text_image', 'sort_order' => 2],
                    ['slug' => 'values', 'title' => 'Nos valeurs', 'pattern' => 'cards_grid', 'sort_order' => 3],
                    ['slug' => 'diversify', 'title' => 'Diversification', 'pattern' => 'text', 'sort_order' => 4],
                    ['slug' => 'join', 'title' => 'CTA adhésion', 'pattern' => 'cta_banner', 'sort_order' => 5],
                ];
            } elseif ($slug === 'organisation') {
                $sections = [
                    ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
                    ['slug' => 'stats', 'title' => 'Statistiques', 'pattern' => 'stats', 'sort_order' => 2],
                    ['slug' => 'board', 'title' => 'Composition actuelle', 'pattern' => 'cards_grid', 'sort_order' => 3],
                    ['slug' => 'headquarters', 'title' => 'Bureau du siège', 'pattern' => 'cards_grid', 'sort_order' => 4],
                    ['slug' => 'regional', 'title' => 'Bureaux régionaux', 'pattern' => 'text', 'sort_order' => 5],
                    ['slug' => 'groupements', 'title' => 'Groupements professionnels', 'pattern' => 'cards_grid', 'sort_order' => 6],
                ];
            } elseif ($slug === 'actualites') {
                $sections = [
                    ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
                    ['slug' => 'grid', 'title' => 'Grille des articles', 'pattern' => 'cards_grid', 'sort_order' => 2],
                ];
            } elseif ($slug === 'fiche-adhesion') {
                $sections = [
                    ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
                    ['slug' => 'intro', 'title' => 'Introduction', 'pattern' => 'text_image', 'sort_order' => 2],
                    ['slug' => 'adherer', 'title' => 'Pourquoi adhérer', 'pattern' => 'cards_grid', 'sort_order' => 3],
                    ['slug' => 'form', 'title' => 'Formulaire', 'pattern' => 'text', 'sort_order' => 4],
                ];
            } elseif ($slug === 'contact') {
                $sections = [
                    ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
                    ['slug' => 'info', 'title' => 'Informations de contact', 'pattern' => 'text', 'sort_order' => 2],
                    ['slug' => 'form', 'title' => 'Formulaire', 'pattern' => 'text', 'sort_order' => 3],
                ];
            } else {
                $sections = [];
            }

            foreach ($sections as $sec) {
                CmsSection::updateOrCreate(
                    ['page' => $slug, 'slug' => $sec['slug']],
                    array_merge($sec, ['page' => $slug])
                );
            }
        }

        $groupementSections = [
            ['slug' => 'hero', 'title' => 'Bannière Hero', 'pattern' => 'hero', 'sort_order' => 1],
            ['slug' => 'positioning', 'title' => 'Positionnement', 'pattern' => 'text_image', 'sort_order' => 2],
            ['slug' => 'challenges', 'title' => 'Défis', 'pattern' => 'cards_grid', 'sort_order' => 3],
            ['slug' => 'enjeux', 'title' => 'Enjeux stratégiques', 'pattern' => 'text_image', 'sort_order' => 4],
            ['slug' => 'proposals', 'title' => 'Propositions', 'pattern' => 'cards_grid', 'sort_order' => 5],
        ];

        foreach (array_column($groupementPages, 'slug') as $slug) {
            foreach ($groupementSections as $sec) {
                CmsSection::updateOrCreate(
                    ['page' => $slug, 'slug' => $sec['slug']],
                    array_merge($sec, ['page' => $slug])
                );
            }
        }
    }
}
