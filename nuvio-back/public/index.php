<?php

require_once __DIR__ . '/../config/cors.php';

aplicarCors();
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', '0');
ini_set('log_errors', '1');

/**
 * Garante que erros de bootstrap nunca virem uma resposta 500 vazia.
 * O detalhe completo continua apenas no log do servidor.
 */
function responderErroInterno(Throwable $erro): void
{
    $requestId = bin2hex(random_bytes(6));

    error_log(sprintf(
        '[%s] %s: %s em %s:%d',
        $requestId,
        get_class($erro),
        $erro->getMessage(),
        $erro->getFile(),
        $erro->getLine()
    ));

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
    }

    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro interno ao iniciar a API.',
        'requestId' => $requestId,
    ], JSON_UNESCAPED_UNICODE);
}

set_exception_handler(static function (Throwable $erro): void {
    responderErroInterno($erro);
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Health check não depende de banco, autenticação ou controllers.
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if ($uri === '/health' || $uri === '/health/') {
    http_response_code(200);
    echo json_encode([
        'sucesso' => true,
        'servico' => 'nuvio-api',
        'status' => 'online',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $autoload = __DIR__ . '/../vendor/autoload.php';
    if (!is_file($autoload)) {
        throw new RuntimeException('Dependências do Composer não foram instaladas.');
    }

    require_once $autoload;
    require_once __DIR__ . '/../routes/api.php';
} catch (Throwable $erro) {
    responderErroInterno($erro);
}
