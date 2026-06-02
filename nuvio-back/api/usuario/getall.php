<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../../config/database.php';
include_once '../../models/usuario.php';
$database = new DB();
$db = $database->getConnection();
$usuario = new Usuario($db);
$stmt = $usuario->getall();
$num = $stmt->rowCount();
if ($num > 0) {
    $usuario_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $usuario_item = array(
            "id" => $idusuario,
            "nome" => $nome,
            "email" => $email,
            "senha" => $senha
        );
        array_push($usuario_arr, $usuario_item);
    }
    http_response_code(200);
    echo json_encode($usuario_arr);
} else {
    http_response_code(404);
    echo json_encode(
        array("message" => "Nenhum usuario encontrada.")
    );
}