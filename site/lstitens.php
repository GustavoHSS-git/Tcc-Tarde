<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listar Itens</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> <!-- Inclui jQuery para AJAX -->
    <link rel="stylesheet" href="css/geral.css">
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
    <style>
        .item-loot{
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    
<?php
// Conexão com o banco de dados
include('conex.php');

// Query para selecionar todos os itens e suas categorias
$sql = "SELECT games.*, genero.nome AS nomeGenero
        FROM games 
        INNER JOIN genero ON games.genero = genero.id_genero
        ORDER BY games.nomegame";

// Executar a query
$result = $conn->query($sql);

// Verificar se há resultados
if ($result->num_rows > 0) {
    // Exibir os resultados
    echo "<table>
            <tr>
                <th>Nome</th>
                <th>Genero</th>
                <th>Descrição</th>
            </tr>";
    
        while($linha = $result->fetch_assoc()) {
            // Adicionando o caminho da imagem
            $itemImagem = "../uploads/capas/{$linha['id_game']}.png";
            if (!file_exists($itemImagem)) {
                $itemImagem = "../uploads/capas/amargura.jpg"; // Fallback para a imagem padrão
            }
            echo '<tr>
                    <td class="td-central">
                            <button type="submit" class="abrirdetalhes" data-id='.$linha['id_game'].'>
                                <img src="'.$itemImagem. '" alt="Imagem do Item" class="item-loot" loading="lazy">
                                <div>'.htmlspecialchars($linha['nomegame']).'</div>
                            </button>
                    </td>
                    <td class="categoria">
                        <p class="categoria abralink" data-id='.$linha['id_game'].'>' . $linha['nomeGenero'] . '</p>
                    </td>
                    <td>' . $linha['descricao'] . '<br></td>
                    </tr>';
        }
            

    echo "</table>";
} else {
    echo "Nenhum item encontrado.";
}

// Fechar a conexão
$conn->close();
?>

<!-- Modal HTML -->
<div id="modal" class="modal">
    <div class="modal-content">
        <span class="modal-close">&times;</span>
        <div id="modal-body">Carregando...</div>
    </div>
</div>

<script>
$(document).ready(function(){
    $(document).on('click', '.abrirdetalhes', function() {
        const id = $(this).data('id');
        $('#modal').css('display', 'flex');
        $('#modal').fadeIn();
        $('#modal-body').html('Carregando...');
        $.get('editaitens.php?id_game=' + id, function(data) {
            $('#modal-body').html(data);
        });
    });

    $('.modal-close, #modal').on('click', function(e) {
        if (e.target === this || e.target.classList.contains('modal-close')) {
            $('#modal').fadeOut();
        }
    });
});
</script>
</body>
</html>