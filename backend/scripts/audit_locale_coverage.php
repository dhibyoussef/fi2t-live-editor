<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$fr = App\Models\ContentBlock::where('locale', 'fr')->get(['page', 'section', 'key']);
$en = App\Models\ContentBlock::where('locale', 'en')->get()->keyBy(fn ($b) => $b->page.'.'.$b->section.'.'.$b->key);
$ar = App\Models\ContentBlock::where('locale', 'ar')->get()->keyBy(fn ($b) => $b->page.'.'.$b->section.'.'.$b->key);

$missEn = [];
$missAr = [];
foreach ($fr as $b) {
    $k = $b->page.'.'.$b->section.'.'.$b->key;
    if (! $en->has($k)) {
        $missEn[$b->page] = ($missEn[$b->page] ?? 0) + 1;
    }
    if (! $ar->has($k)) {
        $missAr[$b->page] = ($missAr[$b->page] ?? 0) + 1;
    }
}

echo 'FR blocks='.$fr->count().PHP_EOL;
echo 'EN blocks='.$en->count().PHP_EOL;
echo 'AR blocks='.$ar->count().PHP_EOL;
echo 'missing EN keys='.array_sum($missEn).PHP_EOL;
echo 'missing AR keys='.array_sum($missAr).PHP_EOL;
echo 'EN gaps by page: '.json_encode($missEn, JSON_UNESCAPED_UNICODE).PHP_EOL;
echo 'AR gaps by page: '.json_encode($missAr, JSON_UNESCAPED_UNICODE).PHP_EOL;
