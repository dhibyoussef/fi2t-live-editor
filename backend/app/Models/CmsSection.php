<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsSection extends Model
{
    protected $fillable = [
        'page', 'slug', 'title', 'pattern', 'sort_order',
    ];

    public function cmsPage(): BelongsTo
    {
        return $this->belongsTo(CmsPage::class, 'page', 'slug');
    }
}
