<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentBlock extends Model
{
    protected $fillable = [
        'page', 'section', 'key', 'locale', 'type', 'value', 'label', 'sort_order',
    ];

    /** Flat map for a page: "section.key" => value */
    public static function flatForPage(string $page, string $locale = 'fr'): array
    {
        $blocks = static::query()
            ->where('page', $page)
            ->where(function ($q) use ($locale) {
                $q->where('locale', $locale)->orWhere('locale', '_all');
            })
            ->orderBy('sort_order')
            ->get();

        $flat = [];
        foreach ($blocks as $block) {
            $compound = "{$block->section}.{$block->key}";
            // Locale-specific overrides _all for text; images usually _all
            if (!isset($flat[$compound]) || $block->locale !== '_all') {
                $flat[$compound] = $block->value;
            }
        }

        return $flat;
    }

    /** All pages grouped: page => { section.key => value } */
    public static function allGrouped(string $locale = 'fr'): array
    {
        $pages = static::query()->distinct()->pluck('page');
        $result = [];
        foreach ($pages as $page) {
            $result[$page] = static::flatForPage($page, $locale);
        }
        return $result;
    }
}
