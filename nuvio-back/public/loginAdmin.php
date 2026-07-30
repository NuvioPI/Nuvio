<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

$origemPermitida = env('CORS_ORIGIN', 'http://localhost:3000');
$origemRequisicao = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origemRequisicao === $origemPermitida) {
    header('Access-Control-Allow-Origin: ' . $origemRequisicao);
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'erro' => 'Método não permitido.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($body['email'] ?? '');
$senha = $body['senha'] ?? '';

if ($email === '' || $senha === '') {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => 'Email e senha são obrigatórios.']);
    exit;
}

try {
    $db = (new DB())->getConnection();

    $stmt = $db->prepare("
        SELECT u.idusuario, u.nome, u.email, u.senhahash, u.idtipousuario, tu.descricao AS tipo
        FROM usuario u
        INNER JOIN tipousuario tu ON u.idtipousuario = tu.idtipousuario
        WHERE u.email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['sucesso' => false, 'erro' => 'Credenciais inválidas.']);
        exit;
    }

    if ($user['tipo'] !== 'Administrador') {
        http_response_code(403);
        echo json_encode(['sucesso' => false, 'erro' => 'Acesso restrito a administradores.']);
        exit;
    }

    if (!password_verify($senha, $user['senhahash'])) {
        http_response_code(401);
        echo json_encode(['sucesso' => false, 'erro' => 'Credenciais inválidas.']);
        exit;
    }

    $token = JWT::gerar([
        'idUsuario' => $user['idusuario'],
        'email'     => $user['email'],
        'nome'      => $user['nome'],
        'tipo'      => $user['tipo'],
    ]);

    http_response_code(200);
    echo json_encode([
        'sucesso' => true,
        'token'   => $token,
        'usuario' => [
            'id'    => (int) $user['idusuario'],
            'nome'  => $user['nome'],
            'email' => $user['email'],
            'tipo'  => (int) $user['idtipousuario'],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'erro' => 'Erro interno do servidor.']);
}
