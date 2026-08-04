<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=fi2t', 'root', '');
    $stmt = $pdo->query("SELECT id, value FROM content_blocks WHERE value LIKE '%icon1%'");
    $n = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $nv = preg_replace(
            '/\\\\\/images\\\\\/icon(\d+)\.(?:png|svg)(?:\?v=\d+)?/',
            '\/images\/icon$1.png?v=5',
            $row['value']
        );
        $nv = preg_replace(
            '/\/images\/icon(\d+)\.(?:png|svg)(?:\?v=\d+)?/',
            '/images/icon$1.png?v=5',
            $nv
        );
        if ($nv !== $row['value']) {
            $u = $pdo->prepare('UPDATE content_blocks SET value=? WHERE id=?');
            $u->execute([$nv, $row['id']]);
            $n++;
            echo "updated id {$row['id']}\n";
        }
    }
    echo "patched {$n} rows\n";
} catch (Throwable $e) {
    echo 'db skip: ' . $e->getMessage() . "\n";
}
