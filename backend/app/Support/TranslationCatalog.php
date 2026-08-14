<?php

namespace App\Support;

class TranslationCatalog
{
    /** @return array<string, array<string, string>> */
    public static function load(): array
    {
        $merged = ['fr' => [], 'en' => [], 'ar' => []];
        foreach ([
            database_path('seeders/data/translations-fi2t.php'),
            database_path('seeders/data/translations-fi2t-cms.php'),
        ] as $file) {
            if (! is_file($file)) {
                continue;
            }
            /** @var array<string, array<string, string>> $chunk */
            $chunk = require $file;
            foreach (['fr', 'en', 'ar'] as $locale) {
                $merged[$locale] = array_merge($merged[$locale], $chunk[$locale] ?? []);
            }
        }

        return $merged;
    }
}
