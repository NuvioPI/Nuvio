<?php

require_once __DIR__ . '/../config/jwt.php';

function autenticar()
{
    $headers = getallheaders();

    if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
        http_response_code(401);
        echo json_encode(['erro' => 'Token não fornecido.']);
        exit();
    }

    $authHeader = $headers['Authorization'] ?? $headers['authorization'];

    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['erro' => 'Formato inválido. Use: Bearer {token}']);
        exit();
    }

    $token = substr($authHeader, 7);
    $dados = JWT::validar($token);

    if (!$dados) {
        http_response_code(401);
        echo json_encode(['erro' => 'Token inválido ou expirado.']);
        exit();
    }

    return $dados; // retorna o payload: idUsuario, email, etc.
}