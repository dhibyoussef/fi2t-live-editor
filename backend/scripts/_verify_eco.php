<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Models\ContentBlock;
$rows = ContentBlock::where('page', 'tourisme-ecologique')->where('locale', 'fr')
    ->orderBy('section')->orderBy('key')->get(['section', 'key', 'type']);
foreach ($rows as $r) echo "{$r->section}.{$r->key} [{$r->type}]\n";
echo 'opaque=' . ContentBlock::where('page', 'tourisme-ecologique')->where('key', 'data')->count() . "\n";
