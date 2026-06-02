<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8"); 
include_once '../../config/database.php';
include_once '../../models/usuario.php'; 
$database = new DB();
$db = $database->getConnection(); 
$usuario = new Usuario($db); 
$usuario->idUsuario = isset($_GET['id']) ? $_GET['id'] : null; 
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($usuario->idUsuario) {
        $usuario->get(); 
        $usuario_arr = array(
            "id" => $usuario->idUsuario,
            "nome" => $usuario->nome,
            "email" => $usuario->email,
            "senha" => $usuario->senha
        ); 
        echo json_encode($usuario_arr, JSON_PRETTY_PRINT);
    } else {
        http_response_code(400);
        echo json_encode(
            array("Mensagem" => "Id não informado.")
        );  
    }
}else {
     http_response_code(405);
    echo json_encode(
            array("Mensagem" => "Método não permitido.")
        );
}