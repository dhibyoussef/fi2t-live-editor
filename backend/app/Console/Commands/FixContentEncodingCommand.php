<?php

namespace App\Console\Commands;

use App\Models\ContentBlock;
use App\Models\Translation;
use Illuminate\Console\Command;

class FixContentEncodingCommand extends Command
{
    protected $signature = 'content:fix-encoding {--dry-run : Show how many rows would change}';

    protected $description = 'Repair UTF-8 mojibake (rÃ©glementaire → réglementaire) in CMS content';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $changed = 0;

        ContentBlock::query()->orderBy('id')->each(function (ContentBlock $block) use ($dry, &$changed) {
            $value = is_string($block->value) ? $this->repair($block->value) : $block->value;
            $label = is_string($block->label) ? $this->repair($block->label) : $block->label;
            if ($value === $block->value && $label === $block->label) {
                return;
            }
            $changed++;
            if ($dry) {
                return;
            }
            $block->value = $value;
            $block->label = $label;
            $block->save();
        });

        if (class_exists(Translation::class)) {
            Translation::query()->orderBy('id')->each(function (Translation $row) use ($dry, &$changed) {
                $value = is_string($row->value) ? $this->repair($row->value) : $row->value;
                if ($value === $row->value) {
                    return;
                }
                $changed++;
                if ($dry) {
                    return;
                }
                $row->value = $value;
                $row->save();
            });
        }

        $this->info(($dry ? 'Would update ' : 'Updated ').$changed.' row(s).');

        return self::SUCCESS;
    }

    private function repair(string $value): string
    {
        if (! preg_match('/Ã.|Â.|â€|Å“/u', $value)) {
            return $value;
        }

        $as1252 = @iconv('UTF-8', 'Windows-1252//IGNORE', $value);
        if (! is_string($as1252) || $as1252 === '') {
            return $value;
        }
        if (! mb_check_encoding($as1252, 'UTF-8')) {
            return $value;
        }

        return $as1252;
    }
}
