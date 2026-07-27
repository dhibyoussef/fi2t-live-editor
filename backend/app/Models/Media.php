<?php

namespace App\Models;

use App\Enums\MediaTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Media extends Model
{
    protected $fillable = [
        'mediable_type', 'mediable_id', 'url', 'alt_text',
        'type', 'sort_order', 'is_carousel', 'is_cover',
    ];

    protected $casts = [
        'type'        => MediaTypeEnum::class,
        'is_carousel' => 'boolean',
        'is_cover'    => 'boolean',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
