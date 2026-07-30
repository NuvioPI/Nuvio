<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/rate-limit.php';

// Controllers
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/TicketController.php';
require_once __DIR__ . '/../controllers/CategoriaController.php';
require_once __DIR__ . '/../controllers/SlaController.php';
require_once __DIR__ . '/../controllers/RespostaTicketController.php';
require_once __DIR__ . '/../controllers/UsuarioController.php';
require_once __DIR__ . '/../controllers/TecnicoController.php';
require_once __DIR__ . '/../controllers/AdministradorController.php';
require_once __DIR__ . '/../controllers/AnexoController.php';
require_once __DIR__ . '/../controllers/AvaliacaoTicketController.php';
require_once __DIR__ . '/../controllers/TipoUsuarioController.php';

// Captura método e URI
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

// Remove o caminho do script quando a API é chamada como /routes/api.php/recurso.
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
if ($scriptName && str_starts_with($uri, $scriptName)) {
    $uri = substr($uri, strlen($scriptName));
}

// Compatibilidade com chamadas antigas em subpasta.
$uri = preg_replace('#^/nuvio-back/routes/api\.php#', '', $uri);
$uri = preg_replace('#^/nuvio-back/routes#', '', $uri);
$uri = $uri === '' ? '/' : $uri;

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
    // Rate limiting no login (10 tentativas a cada 15 minutos por IP)
    $rateLimiter = new RateLimiter();
    $clientIP = $_SERVER['REMOTE_ADDR'];
    $chaveRateLimit = "login_" . $clientIP;
    
    if (!$rateLimiter->permite($chaveRateLimit, 10, 900)) {
        http_response_code(429); // Too Many Requests
        echo json_encode([
            'erro' => 'Muitas tentativas de login. Tente novamente em 15 minutos.',
            'retry_after' => 900
        ]);
        exit();
    }
    
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
$segmentoId = $uriParts[1] ?? null;
$id       = $segmentoId !== null && is_numeric($segmentoId) ? (int)$segmentoId : null;
$subrecurso = $uriParts[2] ?? null;

// --- Tickets ---
if ($recurso === 'tickets') {
    $controller = new TicketController(
        (int) $usuarioAutenticado['idUsuario']
    );
    
    if ($method === 'GET' && $segmentoId === null) {
        $controller->index();
    } elseif (
        $method === 'GET' &&
        $id &&
        $subrecurso === 'historico'
    ) {
        $controller->historico($id);
    } elseif ($method === 'GET' && $id && !$subrecurso) {
        $controller->show($id);
    } elseif ($method === 'POST' && $segmentoId === null) {
        $controller->store();
    } elseif ($method === 'PUT' && !$subrecurso) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do ticket é obrigatório para atualizar.']);
        } else {
            $controller->update($id);
        }
    } elseif ($method === 'DELETE' && !$subrecurso) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do ticket é obrigatório para deletar.']);
        } else {
            $controller->destroy($id);
        }
    } else {
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
    }
    exit();
}

// --- Categorias ---
if ($recurso === 'categorias') {
    // Apenas Técnico e Administrador podem gerenciar categorias
    if ($method !== 'GET') {
        autenticarEAutorizar(['Técnico', 'Administrador']);
    } else {
        // GET é público para autenticados
        autenticar();
    }
    
    $controller = new CategoriaController();
    
    if ($method === 'GET' && !$id) {
        $controller->index();
    } elseif ($method === 'GET' && $id) {
        $controller->show($id);
    } elseif ($method === 'POST') {
        $controller->store();
    } elseif ($method === 'PUT') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID da categoria é obrigatório para atualizar.']);
        } else {
            $controller->update($id);
        }
    } elseif ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID da categoria é obrigatório para deletar.']);
        } else {
            $controller->destroy($id);
        }
    } else {
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
    }
    exit();
}

// --- SLA ---
if ($recurso === 'sla') {
    $controller = new SLAController();
    
    if ($method === 'GET' && !$id) {
        $controller->index();
    } elseif ($method === 'GET' && $id) {
        $controller->show($id);
    } elseif ($method === 'POST') {
        $controller->store();
    } elseif ($method === 'PUT') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do SLA é obrigatório para atualizar.']);
        } else {
            $controller->update($id);
        }
    } elseif ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID do SLA é obrigatório para deletar.']);
        } else {
            $controller->destroy($id);
        }
    } else {
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
    }
    exit();
}

// --- Respostas de Ticket ---
if ($recurso === 'respostas') {
    $controller = new RespostaTicketController();
    
    if ($method === 'GET' && !$id) {
        $controller->index();
    } elseif ($method === 'GET' && $id) {
        $controller->show($id);
    } elseif ($method === 'POST') {
        $controller->store();
    } elseif ($method === 'PUT') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID da resposta é obrigatório para atualizar.']);
        } else {
            $controller->update($id);
        }
    } elseif ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID da resposta é obrigatório para deletar.']);
        } else {
            $controller->destroy($id);
        }
    } else {
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
    }
    exit();
}

// --- Usuários ---
if ($recurso === 'usuarios') {
    // Apenas Administrador pode gerenciar usuários
    autenticarEAutorizar(['Administrador']);
    
    $controller = new UsuarioController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Técnicos ---
if ($recurso === 'tecnicos') {
    $controller = new TecnicoController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Administradores ---
if ($recurso === 'administradores') {
    // Apenas Administrador pode gerenciar administradores
    autenticarEAutorizar(['Administrador']);
    
    $controller = new AdministradorController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Anexos ---
if ($recurso === 'anexos') {
    $controller = new AnexoController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Avaliações ---
if ($recurso === 'avaliacoes') {
    $controller = new AvaliacaoTicketController();
    if ($method === 'GET' && !$id)      $controller->index();
    elseif ($method === 'GET' && $id)   $controller->show($id);
    elseif ($method === 'POST')         $controller->store();
    elseif ($method === 'PUT' && $id)   $controller->update($id);
    elseif ($method === 'DELETE' && $id) $controller->destroy($id);
    else { http_response_code(405); echo json_encode(['erro' => 'Método não permitido.']); }
    exit();
}

// --- Tipos de usuário ---
if ($recurso === 'tipos-usuario') {
    $controller = new TipoUsuarioController();
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
