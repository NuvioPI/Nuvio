<?php

require_once __DIR__ . '/../config/cors.php';

require_once __DIR__ . '/../vendor/autoload.php';

aplicarCors();
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../routes/api.php';
