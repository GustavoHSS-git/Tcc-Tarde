<?php
$servidor = "localhost:3308";
$user = "root";
$senha = "etec2024";
$banco = "tcctarde";

// Cria a conexão
$conn = new mysqli($servidor, $user, $senha, $banco);

// Verifica a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}
?>