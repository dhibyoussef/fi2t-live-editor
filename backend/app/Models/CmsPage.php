<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsPage extends Model
{
    protected $fillable = [
        'slug', 'title', 'status', 'template',
        'meta_title', 'meta_description', 'is_system', 'sort_order',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CmsSection::class, 'page', 'slug')->orderBy('sort_order');
    }
}
