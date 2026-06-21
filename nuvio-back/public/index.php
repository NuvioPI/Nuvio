<?php
require_once __DIR__ . '/../config/env.php';

// CORS - Permitir apenas a origem configurada
$origem_permitida = env('CORS_ORIGIN', 'http://localhost:3000');
$origem_requisicao = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origem_requisicao === $origem_permitida) {
    header("Access-Control-Allow-Origin: " . $origem_requisicao);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    "status" => "ok",
    "message" => "Nuvio API Online"
]);