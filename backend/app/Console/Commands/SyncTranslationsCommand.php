<?php

namespace App\Console\Commands;

use App\Models\Translation;
use App\Support\TranslationCatalog;
use Illuminate\Console\Command;

class SyncTranslationsCommand extends Command
{
    protected $signature = 'translations:sync';

    protected $description = 'Upsert missing CMS translation keys without overwriting existing values';

    public function handle(): int
    {
        $data = TranslationCatalog::load();
        $fr = $data['fr'] ?? [];
        $added = 0;

        foreach ($fr as $key => $value) {
            $row = Translation::firstOrCreate(
                ['locale' => 'fr', 'key' => $key],
                ['value' => $value]
            );
            if ($row->wasRecentlyCreated || trim((string) $row->value) === '') {
                if (! $row->wasRecentlyCreated) {
                    $row->update(['value' => $value]);
                }
                $added++;
            }
            foreach (['en', 'ar'] as $locale) {
                Translation::firstOrCreate(
                    ['locale' => $locale, 'key' => $key],
                    ['value' => $data[$locale][$key] ?? '']
                );
            }
        }

        $this->info(count($fr).' clés — '.$added.' ajoutée(s).');

        return self::SUCCESS;
    }
}
