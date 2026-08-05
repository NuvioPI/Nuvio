<?php

require_once __DIR__ . '/../config/env.php';

require_once __DIR__ . '/../vendor/autoload.php';

$origemPermitida = env('CORS_ORIGIN', 'https://nuvio-fawn.vercel.app');
$origemRequisicao = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origemRequisicao === $origemPermitida) {
    header('Access-Control-Allow-Origin: ' . $origemRequisicao);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../routes/api.php';
