<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/JWT.php'; // ajusta o caminho conforme onde está seu JWT.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // depois ajustamos pro domínio certo da Vercel
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responde preflight do CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? null;
$senha = $data['senha'] ?? null;

if (!$email || !$senha) {
    http_response_code(400);
    echo json_encode(['erro' => 'E-mail e senha são obrigatórios']);
    exit;
}

$db = new DB();
$conn = $db->getConnection();

try {
    $stmt = $conn->prepare("SELECT idUsuario, idtipoUsuario, nome, email, senhaHash FROM Usuario WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !password_verify($senha, $usuario['senhaHash'])) {
        http_response_code(401);
        echo json_encode(['erro' => 'E-mail ou senha inválidos']);
        exit;
    }

    // Monta o payload do token
    $payload = [
        'idUsuario' => $usuario['idUsuario'],
        'nome' => $usuario['nome'],
        'email' => $usuario['email'],
        'idtipoUsuario' => $usuario['idtipoUsuario'],
    ];

    $token = JWT::gerar($payload);

    echo json_encode([
        'sucesso' => true,
        'token' => $token,
        'usuario' => [
            'id' => $usuario['idUsuario'],
            'nome' => $usuario['nome'],
            'email' => $usuario['email'],
            'tipo' => $usuario['idtipoUsuario'],
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
}