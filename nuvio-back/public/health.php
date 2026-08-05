<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$status = [
    'api' => 'online',
    'db' => 'offline',
    'erro' => null,
];

try {
    $pdo = (new DB())->getConnection();
    $pdo->query('SELECT 1');
    $status['db'] = 'online';
} catch (Throwable $e) {
    $status['erro'] = 'Não foi possível conectar ao banco de dados.';
}

echo json_encode($status);
