<?php

namespace Database\Seeders;

use App\Models\Locale;
use App\Models\Translation;
use Illuminate\Database\Seeder;

class TranslationSeeder extends Seeder
{
    public function run(): void
    {
        Locale::upsert([
            ['code' => 'fr', 'name' => 'Français', 'flag' => '🇫🇷', 'direction' => 'ltr', 'is_active' => 1, 'sort_order' => 0],
            ['code' => 'en', 'name' => 'English', 'flag' => '🇬🇧', 'direction' => 'ltr', 'is_active' => 1, 'sort_order' => 1],
            ['code' => 'ar', 'name' => 'العربية', 'flag' => '🇹🇳', 'direction' => 'rtl', 'is_active' => 1, 'sort_order' => 2],
        ], ['code'], ['name', 'flag', 'direction', 'is_active', 'sort_order']);

        /** @var array<string, array<string, string>> $data */
        $data = require __DIR__ . '/data/translations-fi2t.php';

        // 1) Seed French references first (source of truth for keys)
        $fr = $data['fr'] ?? [];
        foreach ($fr as $key => $value) {
            Translation::updateOrCreate(
                ['locale' => 'fr', 'key' => $key],
                ['value' => $value]
            );
        }

        // 2) Seed translations for every FR key (EN / AR)
        foreach (['en', 'ar'] as $locale) {
            $map = $data[$locale] ?? [];
            foreach ($fr as $key => $frValue) {
                Translation::updateOrCreate(
                    ['locale' => $locale, 'key' => $key],
                    ['value' => $map[$key] ?? '']
                );
            }
        }
    }
}
