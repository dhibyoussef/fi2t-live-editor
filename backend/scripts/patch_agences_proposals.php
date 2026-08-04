<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$rows = DB::table('content_blocks')
    ->where('page', 'agences-de-voyages')
    ->where(function ($q) {
        $q->where('key', 'items')->where('section', 'proposals');
    })
    ->get();

if ($rows->isEmpty()) {
    $rows = DB::table('content_blocks')
        ->where('page', 'agences-de-voyages')
        ->get(['id', 'section', 'key', 'locale']);
    foreach ($rows as $r) {
        echo "{$r->id} {$r->section}.{$r->key} ({$r->locale})\n";
    }
    exit(1);
}

$newBody = "• Révision de la loi régissant les agences de voyages.\n• Reconnaissance officielle des nouvelles catégories d'opérateurs.\n• Simplification et digitalisation des procédures administratives.\n• Révision des garanties financières selon l'activité réelle et le risque.\nRôle FI2T : force de proposition et partenaire technique de l'État dans la réforme.";

foreach ($rows as $row) {
    $items = json_decode($row->value, true);
    if (!is_array($items) || !isset($items[0]['body'])) {
        echo "skip {$row->id}\n";
        continue;
    }
    $items[0]['body'] = $newBody;
    DB::table('content_blocks')->where('id', $row->id)->update([
        'value' => json_encode($items, JSON_UNESCAPED_UNICODE),
        'updated_at' => now(),
    ]);
    echo "patched {$row->id} locale={$row->locale}\n";
}
