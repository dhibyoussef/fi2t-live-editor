<?php

/**
 * Promote per-locale CMS text to shared `_all` so Live Editor edits
 * apply to every language. Prefers the most recently updated row, then fr.
 *
 *   php scripts/patch_promote_shared_content.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;
use Illuminate\Support\Facades\DB;

$groups = ContentBlock::query()
    ->select('page', 'section', 'key', 'type')
    ->whereIn('locale', ['fr', 'en', 'ar', '_all'])
    ->groupBy('page', 'section', 'key', 'type')
    ->get();

$promoted = 0;
$deleted = 0;

foreach ($groups as $g) {
    $rows = ContentBlock::query()
        ->where('page', $g->page)
        ->where('section', $g->section)
        ->where('key', $g->key)
        ->orderByRaw("CASE locale WHEN '_all' THEN 0 WHEN 'fr' THEN 1 WHEN 'en' THEN 2 ELSE 3 END")
        ->orderByDesc('updated_at')
        ->get();

    if ($rows->isEmpty()) {
        continue;
    }

    $all = $rows->firstWhere('locale', '_all');
    // Prefer newest non-empty among fr/en/ar if _all missing or empty
    $best = $rows
        ->filter(fn ($r) => $r->locale !== '_all' && trim((string) $r->value) !== '')
        ->sortByDesc('updated_at')
        ->first();

    // If FR was edited most recently (like hero title), use that
    $fr = $rows->firstWhere('locale', 'fr');
    if ($fr && $best && $fr->updated_at >= $best->updated_at) {
        $best = $fr;
    }

    $value = $all && trim((string) $all->value) !== ''
        ? $all->value
        : ($best?->value ?? $all?->value ?? '');

    // Prefer FR value when promoting first time so site stays French-primary
    // unless another locale is clearly newer
    if (! $all && $fr && trim((string) $fr->value) !== '') {
        $value = $fr->value;
        if ($best && $best->updated_at > $fr->updated_at) {
            $value = $best->value;
        }
    }

    ContentBlock::updateOrCreate(
        [
            'page' => $g->page,
            'section' => $g->section,
            'key' => $g->key,
            'locale' => '_all',
        ],
        [
            'type' => $g->type ?: ($all?->type ?? $best?->type ?? 'text'),
            'value' => $value,
            'label' => $all?->label ?? $best?->label ?? $fr?->label,
            'sort_order' => $all?->sort_order ?? $best?->sort_order ?? $fr?->sort_order ?? 0,
        ]
    );
    $promoted++;

    $deleted += ContentBlock::query()
        ->where('page', $g->page)
        ->where('section', $g->section)
        ->where('key', $g->key)
        ->whereIn('locale', ['fr', 'en', 'ar'])
        ->delete();
}

echo "promoted {$promoted} keys to _all\n";
echo "deleted {$deleted} per-locale rows\n";
