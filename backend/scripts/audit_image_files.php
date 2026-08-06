<?php

use App\Models\ContentBlock;
use Illuminate\Support\Facades\Storage;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$urls = ContentBlock::query()
    ->where('type', 'image')
    ->pluck('value')
    ->filter()
    ->unique()
    ->values();

$ok = 0;
$missing = [];
$external = 0;

foreach ($urls as $u) {
    $u = str_replace('\\', '/', (string) $u);
    if ($u === '') {
        continue;
    }
    // Strip cache-busting query (?v=1)
    $u = preg_replace('/\?.*$/', '', $u) ?? $u;
    if (str_starts_with($u, 'http://') || str_starts_with($u, 'https://')) {
        $external++;
        continue;
    }
    if (str_starts_with($u, '/storage/')) {
        $rel = substr($u, strlen('/storage/'));
        if (Storage::disk('public')->exists($rel)) {
            $ok++;
        } else {
            $missing[] = $u;
        }
        continue;
    }
    // Site static assets live under website/public — check common paths
    $candidates = [
        dirname(__DIR__, 2) . '/website/public' . $u,
        dirname(__DIR__) . '/public' . $u,
    ];
    $found = false;
    foreach ($candidates as $path) {
        if (is_file($path)) {
            $found = true;
            break;
        }
    }
    if ($found) {
        $ok++;
    } else {
        $missing[] = $u;
    }
}

echo "image_blocks=" . $urls->count() . " ok={$ok} external={$external} missing=" . count($missing) . PHP_EOL;
foreach (array_slice($missing, 0, 50) as $m) {
    echo "MISSING {$m}" . PHP_EOL;
}
