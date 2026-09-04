<?php
require_once('conex.php');

$sql = "SELECT * FROM games LIMIT 10";
$result = $conn->query($sql);

$info = [];

while ($row = $result->fetch_assoc()) {
    $info[] = [
        "id" => $row['id_game'],
        "title" => $row['nomegame'],
        "img" => $row['capa'],
        "desc" => $row['descricao']
    ];
}
//trocar img ../uploads/capas/{$row['id_game']}.png

header("Content-Type: application/json; charset=utf-8");

echo json_encode($info, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
