<?php
/**
 * The mission card pointed at the home page's card, whose bottom-left has the
 * "10+ ANNEES D'ENGAGEMENT" badge baked in. Home covers it with a real badge
 * element; this page has none, so the baked block showed through, clipped.
 * Repoint it at a crop taken from the qui-sommes-nous artboard itself.
 */
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=fi2t', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $u = $pdo->prepare(
        "UPDATE content_blocks SET value=? WHERE page='qui-sommes-nous' AND section='mission' AND `key`='image'"
    );
    $u->execute(['/images/qui-sommes-nous-mission-card.png?v=1']);
    echo "mission.image updated rows={$u->rowCount()}\n";

    $s = $pdo->prepare(
        "SELECT locale, value FROM content_blocks WHERE page='qui-sommes-nous' AND section='mission' AND `key`='image'"
    );
    $s->execute();
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo "  {$row['locale']}: {$row['value']}\n";
    }

    // The artboard runs both mission paragraphs at the same 29px pitch with no
    // blank line, so the body needs a single newline rather than a blank one.
    $b = $pdo->prepare(
        "UPDATE content_blocks SET value = REPLACE(value, ?, ?)
         WHERE page='qui-sommes-nous' AND section='mission' AND `key`='body' AND value LIKE ?"
    );
    $b->execute(["\n\n", "\n", "%\n\n%"]);
    echo "mission.body newlines collapsed rows={$b->rowCount()}\n";
} catch (Throwable $e) {
    echo 'db skip: ' . $e->getMessage() . "\n";
}
