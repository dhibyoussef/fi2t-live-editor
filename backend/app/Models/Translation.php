<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $fillable = ['locale', 'key', 'value'];

    /** Return all translations for a locale as a flat key→value array */
    public static function flatForLocale(string $locale): array
    {
        return static::where('locale', $locale)
                     ->pluck('value', 'key')
                     ->toArray();
    }

    /** Return all translations grouped by locale, each locale as flat k→v */
    public static function allGrouped(): array
    {
        return static::all()
                     ->groupBy('locale')
                     ->map(fn ($rows) => $rows->pluck('value', 'key'))
                     ->toArray();
    }
}
