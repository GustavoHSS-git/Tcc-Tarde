<?php
include('conex.php'); // Conexão com o banco de dados

// Captura o ID do item da URL
$id_game = isset($_GET['id_game']) ? intval($_GET['id_game']) : 0;

// Query para buscar os dados do item específico
$sql = "SELECT * FROM games WHERE id_game = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_game);
$stmt->execute();
$result = $stmt->get_result();

// Verifica se o item foi encontrado
if ($result->num_rows > 0) {
    $item = $result->fetch_assoc();
} else {
    echo "Item não encontrado.";
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do Item</title>
    <link rel="stylesheet" href="css/geral.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>

<body>
    <div class="container detalhes">
        <?php
        $caminhoImagem = "../uploads/capas/{$id_game}.png";
        if (!file_exists($caminhoImagem)) {
            $caminhoImagem = "../uploads/capas/amargura.jpg";
        }
        ?>

        <div>
            <img id="itemImagem" src="<?= $caminhoImagem ?>" alt="Imagem do Item" class="img-direita">
            <input type="file" id="uploadInput" style="display: none;" accept="image/png,image/jpeg,image/jpg,image/webp">
        </div>
        <!--<img src="<?= $caminhoImagem ?>" alt="Imagem do Item" class="img-direita">-->
        <h1>Detalhes do Item</h1>

        <div>
            <label>Nome:</label>
            <span><strong><?= htmlspecialchars($item['nomegame']) ?></strong></span>
        </div>

        <div>
            <label>Descrição:</label>
            <span class="editable" data-field="descricao"><?= htmlspecialchars($item['descricao']) ?></span>
            <textarea class="input-field" cols="60" data-field="descricao"><?= htmlspecialchars($item['descricao']) ?></textarea>
        </div>

        <!-- Botão para salvar as mudanças -->
        <button id="save-button">Salvar Alterações</button>
    </div>
    <script>
        $(document).ready(function() {
            // Ao clicar em um campo, exibe o input correspondente e oculta o texto
            $('.editable').click(function() {
                const field = $(this).data('field');
                $(this).hide();
                $(`input[data-field="${field}"], textarea[data-field="${field}"]`).show().focus();
                $('#save-button').show(); // Exibe o botão de salvar
            });

            // Ao clicar em salvar, enviar os dados via AJAX para atualizar no banco
            $('#save-button').click(function() {
                const id_game = <?= $id_game ?>;
                const data = {
                    id_game: id_game,
                    descricao: $('textarea[data-field="descricao"]').val(),
                    valorMin: $('input[data-field="valorMin"]').val(),
                    valorMax: $('input[data-field="valorMax"]').val(),
                    statsDano: $('textarea[data-field="statsDano"]').val()
                };

                $.ajax({
                    url: 'atualizar_item.php',
                    type: 'POST',
                    data: data,
                    success: function(response) {
                        if (response.trim() === 'sucesso') {
                            alert("Dados atualizados com sucesso!");
                            location.reload(); // Recarrega a página para atualizar os valores
                        } else {
                            alert("Erro ao atualizar dados: " + response);
                        }
                    },
                    error: function(xhr, status, error) {
                        alert("Erro na requisição: " + error);
                    }
                });
            });
        });
        document.getElementById('itemImagem').addEventListener('click', function() {
            document.getElementById('uploadInput').click();
        });

        document.getElementById('uploadInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('imagem', file);
            formData.append('id', '<?= $id_game ?>');

            fetch('atualizaImagemItem.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.text())
                .then(result => {
                    if (result === 'OK') {
                        // Atualiza a imagem sem cache
                        document.getElementById('itemImagem').src = `../uploads/capas/<?= $id_game ?>.png?cache=${Date.now()}`;
                        location.reload();
                    } else {
                        alert('Erro ao enviar imagem: ' + result);
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro ao enviar imagem.');
                });
        });
    </script>
</body>

</html>