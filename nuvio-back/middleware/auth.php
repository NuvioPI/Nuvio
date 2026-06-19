<?php

function autenticar()
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['erro' => 'Token não fornecido.']);
        exit;
    }

    $token = $matches[1];
    $dados = JWT::validar($token);

    if (!$dados) {
        http_response_code(401);
        echo json_encode(['erro' => 'Token inválido ou expirado.']);
        exit;
    }

    return $dados;
}

function autenticarAdmin()
{
    $dados = autenticar();
    if (($dados['idtipoUsuario'] ?? 0) != 3) {
        http_response_code(403);
        echo json_encode(['erro' => 'Acesso negado. Apenas administradores.']);
        exit;
    }
    return $dados;
}