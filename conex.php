<?php 
$servidor='127.0.0.1:3308';
$usuariobanco='root';
$senhabanco='etec123';
$banco='tcctarde';

$conn= new mysqli($servidor, $usuariobanco, $senhabanco, $banco);
    if ($conn->connect_error){
        die("falha na conexão:". $conn->connect_error);
}
?>