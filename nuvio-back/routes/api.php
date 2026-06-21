<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../middleware/auth.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$uri = preg_replace('#^/api#', '', $uri);

require_once __DIR__ . '/../controllers/AuthController.php';

if ($uri === '/auth/login' && $method === 'POST') {
    $controller = new AuthController();
    $controller->login();
    exit;
}

if ($uri === '/auth/register' && $method === 'POST') {
    $controller = new AuthController();
    $controller->registro();
    exit;
}

if ($uri === '/auth/me' && $method === 'GET') {
    $controller = new AuthController();
    $controller->me();
    exit;
}

http_response_code(404);
echo json_encode(['erro' => 'Rota não encontrada.']);