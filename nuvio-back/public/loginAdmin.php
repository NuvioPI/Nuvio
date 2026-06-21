<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$body = json_decode(file_get_contents('php://input'), true);

$email = $body['email'] ?? '';
$senha = $body['senha'] ?? '';

echo json_encode([
    "email_recebido" => $email,
    "senha_recebida" => $senha
]);
exit;

try {

    $pdo = new PDO(
        "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/../certs/ca.pem'
        ]
    );

    $stmt = $pdo->prepare("
        SELECT *
        FROM Usuario
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {

        echo json_encode([
            "sucesso" => false,
            "erro" => "Usuário não encontrado"
        ]);

        exit;
    }

    if (!password_verify($senha, $user['senhaHash'])) {

        echo json_encode([
            "sucesso" => false,
            "erro" => "Senha incorreta"
        ]);

        exit;
    }

    echo json_encode([
        "sucesso" => true,
        "token" => "teste123",
        "usuario" => [
            "id" => $user["idUsuario"],
            "nome" => $user["nome"],
            "email" => $user["email"],
            "tipo" => $user["idtipoUsuario"]
        ]
    ]);

} catch (Exception $e) {

    echo json_encode([
        "sucesso" => false,
        "erro" => $e->getMessage()
    ]);
}