<?php

/**
 * Verify that every CMS page has sections and every field has FR/EN/AR
 * content (or one shared `_all` value).
 *
 *   php scripts/audit_cms_completeness.php
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$locales = ['fr', 'en', 'ar'];
$issues = [];
$pages = DB::table('cms_pages')->orderBy('sort_order')->pluck('slug');
$storagePaths = [];

foreach ($pages as $page) {
    $sections = DB::table('cms_sections')->where('page', $page)->orderBy('sort_order')->get();
    if ($sections->isEmpty()) {
        $issues[] = "{$page}: no sections";
        continue;
    }

    foreach ($sections as $section) {
        $blocks = DB::table('content_blocks')
            ->where('page', $page)
            ->where('section', $section->slug)
            ->get()
            ->groupBy('key');

        if ($blocks->isEmpty()) {
            $issues[] = "{$page}.{$section->slug}: no blocks";
            continue;
        }

        foreach ($blocks as $key => $variants) {
            $shared = $variants->firstWhere('locale', '_all');
            foreach ($locales as $locale) {
                $block = $variants->firstWhere('locale', $locale) ?: $shared;
                if (! $block) {
                    $issues[] = "{$page}.{$section->slug}.{$key}: missing {$locale}";
                } elseif (trim((string) $block->value) === '') {
                    $issues[] = "{$page}.{$section->slug}.{$key}: empty {$locale}";
                } else {
                    preg_match_all('#/storage/([^"\'\s\\\\]+)#', (string) $block->value, $matches);
                    foreach ($matches[1] ?? [] as $path) {
                        $storagePaths[urldecode($path)] = true;
                    }
                }
            }
        }
    }

    $knownSections = $sections->pluck('slug');
    $orphans = DB::table('content_blocks')
        ->where('page', $page)
        ->whereNotIn('section', $knownSections)
        ->distinct()
        ->pluck('section');
    foreach ($orphans as $orphan) {
        $issues[] = "{$page}.{$orphan}: blocks without section";
    }
}

$orphanPages = DB::table('content_blocks')
    ->whereNotIn('page', $pages)
    ->distinct()
    ->pluck('page');
foreach ($orphanPages as $page) {
    $issues[] = "{$page}: blocks without CMS page";
}

$storageRoot = realpath(storage_path('app/public'));
$publicStorageRoot = realpath(public_path('storage'));
if (! $storageRoot || ! $publicStorageRoot || $storageRoot !== $publicStorageRoot) {
    $issues[] = 'public/storage is not linked to storage/app/public';
}
foreach (array_keys($storagePaths) as $path) {
    if (! is_file(storage_path('app/public/' . $path))) {
        $issues[] = "uploaded image missing: /storage/{$path}";
    }
}

echo 'pages=' . $pages->count() . PHP_EOL;
echo 'sections=' . DB::table('cms_sections')->count() . PHP_EOL;
echo 'blocks=' . DB::table('content_blocks')->count() . PHP_EOL;
echo 'uploaded_images=' . count($storagePaths) . PHP_EOL;
echo 'issues=' . count($issues) . PHP_EOL;
foreach ($issues as $issue) {
    echo "ISSUE {$issue}" . PHP_EOL;
}

exit($issues === [] ? 0 : 1);
