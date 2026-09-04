<?php
if (!isset($_FILES['imagem']) || !isset($_POST['id'])) {
    http_response_code(400);
    echo "Dados incompletos.";
    exit;
}

$id = preg_replace('/[^0-9]/', '', $_POST['id']); // segurança
$caminho = "../uploads/capas/{$id}.png";

if ($_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo "Erro no upload.";
    exit;
}

// Validação básica de tipo de imagem
$tipo = mime_content_type($_FILES['imagem']['tmp_name']);
$tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
if (!in_array($tipo, $tiposPermitidos)) {
    http_response_code(400);
    echo "Apenas imagens PNG, JPG, JPEG e WebP são permitidas.";
    exit;
}

// Salva a imagem
if (move_uploaded_file($_FILES['imagem']['tmp_name'], $caminho)) {
    echo "OK";
} else {
    http_response_code(500);
    echo "Falha ao salvar imagem.";
}
