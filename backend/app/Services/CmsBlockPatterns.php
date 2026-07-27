<?php

namespace App\Services;

class CmsBlockPatterns
{
    /** @return array<string, array{title: string, description: string, category: string, blocks: array<int, array<string, mixed>>}> */
    public static function all(): array
    {
        return [
            'heading' => [
                'title'       => 'Titre',
                'description' => 'Un titre de section',
                'category'    => 'texte',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre', 'locale' => 'fr', 'value' => 'Nouveau titre', 'sort_order' => 1],
                ],
            ],
            'text' => [
                'title'       => 'Titre & texte',
                'description' => 'Titre avec paragraphe descriptif',
                'category'    => 'texte',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'desc', 'type' => 'text', 'label' => 'Description', 'locale' => 'fr', 'value' => '', 'sort_order' => 2],
                ],
            ],
            'image' => [
                'title'       => 'Image',
                'description' => 'Une image seule',
                'category'    => 'media',
                'blocks'      => [
                    ['key' => 'image', 'type' => 'image', 'label' => 'Image', 'locale' => '_all', 'value' => '', 'sort_order' => 1],
                ],
            ],
            'text_image' => [
                'title'       => 'Texte + image',
                'description' => 'Texte à gauche, image à droite',
                'category'    => 'mise_en_page',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'desc', 'type' => 'text', 'label' => 'Description', 'locale' => 'fr', 'value' => '', 'sort_order' => 2],
                    ['key' => 'image', 'type' => 'image', 'label' => 'Image', 'locale' => '_all', 'value' => '', 'sort_order' => 3],
                ],
            ],
            'hero' => [
                'title'       => 'Bannière Hero',
                'description' => 'Grande bannière avec titre, sous-titre et image',
                'category'    => 'sections',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre principal', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'subtitle', 'type' => 'text', 'label' => 'Sous-titre', 'locale' => 'fr', 'value' => '', 'sort_order' => 2],
                    ['key' => 'image', 'type' => 'image', 'label' => 'Image de fond', 'locale' => '_all', 'value' => '', 'sort_order' => 3],
                    ['key' => 'cta_primary', 'type' => 'text', 'label' => 'CTA principal', 'locale' => 'fr', 'value' => '', 'sort_order' => 4],
                    ['key' => 'cta_secondary', 'type' => 'text', 'label' => 'CTA secondaire', 'locale' => 'fr', 'value' => '', 'sort_order' => 5],
                ],
            ],
            'cards_grid' => [
                'title'       => 'Grille de cartes',
                'description' => 'Cartes JSON (objectifs, groupements, actualités…)',
                'category'    => 'listes',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre de section', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'intro', 'type' => 'text', 'label' => 'Introduction', 'locale' => 'fr', 'value' => '', 'sort_order' => 2],
                    ['key' => 'items', 'type' => 'json', 'label' => 'Cartes (JSON)', 'locale' => '_all', 'value' => '[]', 'sort_order' => 3],
                ],
            ],
            'gallery' => [
                'title'       => 'Galerie photos',
                'description' => 'Grille de photos',
                'category'    => 'listes',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre galerie', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'photos', 'type' => 'json', 'label' => 'Photos', 'locale' => '_all', 'value' => '[]', 'sort_order' => 2],
                ],
            ],
            'cta_banner' => [
                'title'       => 'Bandeau CTA',
                'description' => 'Appel à l’action avec fond et boutons',
                'category'    => 'sections',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'body', 'type' => 'text', 'label' => 'Texte', 'locale' => 'fr', 'value' => '', 'sort_order' => 2],
                    ['key' => 'bg', 'type' => 'image', 'label' => 'Image de fond', 'locale' => '_all', 'value' => '', 'sort_order' => 3],
                    ['key' => 'primary', 'type' => 'text', 'label' => 'Bouton 1', 'locale' => 'fr', 'value' => '', 'sort_order' => 4],
                    ['key' => 'secondary', 'type' => 'text', 'label' => 'Bouton 2', 'locale' => 'fr', 'value' => '', 'sort_order' => 5],
                ],
            ],
            'simple_list' => [
                'title'       => 'Liste simple',
                'description' => 'Éléments avec titre et texte',
                'category'    => 'listes',
                'blocks'      => [
                    ['key' => 'title', 'type' => 'text', 'label' => 'Titre de section', 'locale' => 'fr', 'value' => '', 'sort_order' => 1],
                    ['key' => 'items', 'type' => 'json', 'label' => 'Éléments', 'locale' => '_all', 'value' => '[]', 'sort_order' => 2],
                ],
            ],
        ];
    }

    public static function get(string $pattern): ?array
    {
        return self::all()[$pattern] ?? null;
    }
}
