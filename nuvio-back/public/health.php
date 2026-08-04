<?php

require_once __DIR__ . '/../config/env.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$status = [
    'api' => 'online',
    'db'  => 'offline',
    'erro' => null,
];

$host = env('DB_HOST');
$port = env('DB_PORT', '5432');
$dbname = env('DB_NAME', 'postgres');
$user = env('DB_USER', 'postgres');
$pass = env('DB_PASS', '');

if (!$host) {
    $status['erro'] = 'DB_HOST não configurado no .env';
    echo json_encode($status);
    exit;
}

try {
    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s;sslmode=require;options=--search_path=public',
        $host,
        $port,
        $dbname
    );

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $pdo->query('SELECT 1');
    $status['db'] = 'online';
} catch (Throwable $e) {
    $mensagem = $e->getMessage();
    if (str_contains($mensagem, 'could not translate host name')) {
        $mensagem = 'Host do banco inválido. Copie o host correto em Supabase > Project Settings > Database.';
    }
    $status['erro'] = $mensagem;
}

echo json_encode($status);
