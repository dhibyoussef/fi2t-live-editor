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
            // _all first as base; locale-specific text/json overrides it
            ->orderByRaw("CASE WHEN locale = '_all' THEN 0 ELSE 1 END")
            ->orderBy('sort_order')
            ->get();

        $flat = [];
        foreach ($blocks as $block) {
            $compound = "{$block->section}.{$block->key}";
            $isSharedType = $block->type === 'image'
                || $block->key === 'badge_pos'
                || str_ends_with((string) $block->key, '_pos')
                || str_ends_with((string) $block->key, '_alt');

            if ($isSharedType) {
                // Images / positions: _all wins; ignore per-locale duplicates
                if ($block->locale === '_all' || ! array_key_exists($compound, $flat)) {
                    $flat[$compound] = $block->value;
                }
                continue;
            }

            // Text / JSON: locale overrides _all
            if ($block->locale !== '_all' || ! array_key_exists($compound, $flat)) {
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
