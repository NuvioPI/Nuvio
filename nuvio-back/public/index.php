<?php
require_once __DIR__ . '/../config/env.php';

<<<<<<< HEAD
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../routes/api.php';
=======
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
>>>>>>> e2efb29203b66f8f057ad3671ee022964bc47a02
