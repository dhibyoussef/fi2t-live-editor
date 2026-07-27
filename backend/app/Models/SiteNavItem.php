<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteNavItem extends Model
{
    protected $fillable = [
        'parent_id', 'label_fr', 'label_en', 'label_ar',
        'url', 'sort_order', 'is_active', 'open_in_new_tab',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'open_in_new_tab'  => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function labelFor(string $locale): string
    {
        return match ($locale) {
            'en'    => $this->label_en ?: $this->label_fr,
            'ar'    => $this->label_ar ?: $this->label_fr,
            default => $this->label_fr,
        };
    }

    public static function treeForLocale(string $locale = 'fr', bool $activeOnly = true): array
    {
        $query = static::query()->whereNull('parent_id')->orderBy('sort_order');
        if ($activeOnly) {
            $query->where('is_active', true);
        }

        return $query->with(['children' => function ($q) use ($activeOnly) {
            $q->orderBy('sort_order');
            if ($activeOnly) {
                $q->where('is_active', true);
            }
        }])->get()->map(fn (self $item) => static::formatNode($item, $locale))->values()->all();
    }

    private static function formatNode(self $item, string $locale): array
    {
        return [
            'id'               => $item->id,
            'label'            => $item->labelFor($locale),
            'label_fr'         => $item->label_fr,
            'label_en'         => $item->label_en,
            'label_ar'         => $item->label_ar,
            'url'              => $item->url,
            'open_in_new_tab'  => $item->open_in_new_tab,
            'is_active'        => $item->is_active,
            'sort_order'       => $item->sort_order,
            'children'         => $item->children->map(fn (self $c) => static::formatNode($c, $locale))->values()->all(),
        ];
    }
}
