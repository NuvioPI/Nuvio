<?php

// Define cabeçalhos globais para JSON e CORS
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../middleware/auth.php';

// Controllers
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/TicketController.php';
require_once __DIR__ . '/../controllers/CategoriaController.php';
require_once __DIR__ . '/../controllers/SlaController.php';
require_once __DIR__ . '/../controllers/RespostaTicketController.php';
require_once __DIR__ . '/../controllers/ComentarioController.php';
require_once __DIR__ . '/../controllers/AnexoController.php';

// Captura método e URI
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

// Remove prefixo caso a API esteja em subpasta (ex: /nuvio-back/api)
// Melhora a limpeza para remover também o arquivo api.php do caminho
$uri = preg_replace('#^/nuvio-back/routes(/api\.php)?#', '', $uri);
$uri = str_replace('/api.php', '', $uri);

// Handle OPTIONS (preflight CORS)
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------------------------------------------
// Rotas de Autenticação (públicas)
// -------------------------------------------------------
if ($uri === '/auth/registro' && $method === 'POST') {
    $controller = new AuthController();
    $controller->registro();
    exit();
}

if ($uri === '/auth/login' && $method === 'POST') {
    $controller = new AuthController();
    $controller->login();
    exit();
}

// -------------------------------------------------------
// Rotas protegidas — requerem token JWT válido
// -------------------------------------------------------
$usuarioAutenticado = autenticar();

// Extrair ID da URI para rotas com parâmetro (ex: /tickets/5)
$uriParts = explode('/', ltrim($uri, '/'));
$recurso  = $uriParts[0] ?? '';
$id       = isset($uriParts[1]) && is_numeric($uriParts[1]) ? (int)$uriParts[1] : null;
$subRecurso = $uriParts[2] ?? '';

// --- Sub-rotas de Tickets (Comentários e Anexos) ---
if ($recurso === 'tickets' && $id) {
    if ($subRecurso === 'comments') {
        $controller = new ComentarioController();
        if ($method === 'GET') $controller->index($id);
        elseif ($method === 'POST') $controller->store($id);
        exit();
    }
    if ($subRecurso === 'attachments' && $method === 'POST') {
        $controller = new AnexoController();
        $controller->store($id);
        exit();
    }
}

// --- Tickets ---
if ($recurso === 'tickets') {
    $controller = new TicketController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Categorias ---
if ($recurso === 'categorias') {
    $controller = new CategoriaController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- SLA ---
if ($recurso === 'sla') {
    $controller = new SlaController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Respostas de Ticket ---
if ($recurso === 'respostas') {
    $controller = new RespostaTicketController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// -------------------------------------------------------
// Rota não encontrada
// -------------------------------------------------------
http_response_code(404);
echo json_encode(['erro' => 'Rota não encontrada.']);