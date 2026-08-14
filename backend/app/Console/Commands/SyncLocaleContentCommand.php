<?php

namespace App\Console\Commands;

use App\Services\ContentLocaleSync;
use Illuminate\Console\Command;

class SyncLocaleContentCommand extends Command
{
    protected $signature = 'content:sync-locales {--page= : Limit to one CMS page slug} {--source=fr : Canonical locale} {--no-translate : Align structure only}';

    protected $description = 'Make FR / EN / AR page and article structure identical (translate missing text)';

    public function handle(ContentLocaleSync $sync): int
    {
        $page = $this->option('page') ?: null;
        $translate = ! $this->option('no-translate');
        $source = (string) $this->option('source') ?: 'fr';
        $this->info($translate
            ? "Alignement depuis {$source} + traduction…"
            : "Alignement de structure depuis {$source}…");

        $result = $sync->sync($page, $translate, true, $source);
        $this->info("Pages: {$result['pages']} · blocs: {$result['blocks']} · traduits: {$result['translated']}");

        return self::SUCCESS;
    }
}
