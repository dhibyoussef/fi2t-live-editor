<?php

/**
 * Point every groupement's `hero.image` at the banner the page actually shows.
 *
 * The banners used to be plain <img> tags, so the stored value drifted (most
 * were left at the generic `/hero.jpg`). Now that the banner is editable, that
 * stale row would win over the Figma photo and change the design — so realign
 * it once. Only auto-seeded values are touched; uploaded files are left alone.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ContentBlock;

$map = json_decode((string) file_get_contents(__DIR__ . '/data/groupement-hero-images.json'), true);

if (! is_array($map)) {
    fwrite(STDERR, "groupement-hero-images.json missing or invalid\n");
    exit(1);
}

$updated = 0;
$skipped = [];

foreach ($map as $slug => $image) {
    $rows = ContentBlock::where('page', $slug)->where('section', 'hero')->where('key', 'image')->get();
    // EditableImage stores one shared `_all` value. Preserve any historical
    // upload even if an older script put it under a language-specific row.
    $uploaded = $rows->first(fn ($row) => str_contains((string) $row->value, '/storage/'));
    $value = $uploaded?->value ?? $image;
    if ($uploaded) {
        $skipped[] = "{$slug} ({$uploaded->locale})";
    }

    ContentBlock::where('page', $slug)
        ->where('section', 'hero')
        ->where('key', 'image')
        ->delete();

    ContentBlock::create([
            'page' => $slug,
            'section' => 'hero',
            'key' => 'image',
            'locale' => '_all',
            'type' => 'image',
            'label' => 'Bannière',
            'value' => $value,
            'sort_order' => 1,
    ]);
    printf("%-30s (shared) -> %s\n", $slug, $value);
    $updated++;
}

echo "\nupdated {$updated} row(s)\n";

if ($skipped) {
    echo 'kept uploaded image for: ' . implode(', ', $skipped) . "\n";
}
