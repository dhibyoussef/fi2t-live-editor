<?php
/**
 * Enrich défis 02–05 on agences-de-voyages: bullet bodies + Constat FI2T,
 * matching the depth of item 01 (Cadre réglementaire).
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$enriched = [
    1 => [ // 02
        'body' => "• Marges commerciales en constante compression face à la concurrence des plateformes et des TO internationaux.\n• Forte dépendance aux tour-opérateurs étrangers et aux commissions réduites.\n• Saisonnalité marquée limitant la trésorerie et la capacité d'investissement.\n• Accès difficile au financement bancaire et aux dispositifs de soutien.",
        'constat' => 'Constat FI2T : sans renforcement économique, les agences ne peuvent ni moderniser ni résister aux chocs.',
    ],
    2 => [ // 03
        'body' => "• Offre encore trop centrée sur le tourisme balnéaire de masse.\n• Sous-exploitation des niches à forte valeur (culturel, durable, sportif, MICE, senior).\n• Manque de packaging et de mise en marché des produits différenciés.\n• Coordination insuffisante avec les autres filières de la Fédération.",
        'constat' => "Constat FI2T : la diversification est la condition d'un tourisme de valeur et de résilience.",
    ],
    3 => [ // 04
        'body' => "• Digitalisation partielle des process internes (réservation, CRM, reporting).\n• Faible présence et visibilité sur les canaux digitaux.\n• Outils de distribution peu adaptés aux comportements clients actuels.\n• Retard structurel face aux OTA et aux plateformes internationales.",
        'constat' => 'Constat FI2T : sans accélération digitale, les agences perdent parts de marché et clients.',
    ],
    4 => [ // 05
        'body' => "• Besoin de formation continue sur les métiers émergents du voyage.\n• Lacunes en relation client digitale et en e-commerce.\n• Manque de compétences en conception de produits d'expérience.\n• Faible culture de la data et du yield management.",
        'constat' => 'Constat FI2T : la montée en compétences est un levier prioritaire de compétitivité.',
    ],
];

$rows = DB::table('content_blocks')
    ->where('page', 'agences-de-voyages')
    ->where('section', 'challenges')
    ->where('key', 'items')
    ->get();

if ($rows->isEmpty()) {
    echo "no challenges.items rows\n";
    exit(1);
}

foreach ($rows as $row) {
    $items = json_decode($row->value, true);
    if (!is_array($items)) {
        echo "skip {$row->id}: not json array\n";
        continue;
    }
    foreach ($enriched as $idx => $patch) {
        if (!isset($items[$idx])) {
            continue;
        }
        $items[$idx]['body'] = $patch['body'];
        $items[$idx]['constat'] = $patch['constat'];
    }
    DB::table('content_blocks')->where('id', $row->id)->update([
        'value' => json_encode($items, JSON_UNESCAPED_UNICODE),
        'updated_at' => now(),
    ]);
    echo "patched challenges.items id={$row->id} locale={$row->locale}\n";
}
