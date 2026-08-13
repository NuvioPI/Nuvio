<?php

require_once __DIR__ . '/../config/jwt.php';

function autenticar()
{
    $authHeader = obterCabecalhoAuthorization();

    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(['erro' => 'Token não fornecido.']);
        exit();
    }

    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['erro' => 'Formato inválido. Use: Bearer {token}']);
        exit();
    }

    $token = substr($authHeader, 7);
    $dados = JWT::validar($token);

    if (!$dados) {
        http_response_code(401);
        echo json_encode(['erro' => 'Token inválido ou expirado.']);
        exit();
    }

    return $dados; // retorna o payload: idUsuario, email, etc.
}

function obterCabecalhoAuthorization()
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];

    foreach ($headers as $nome => $valor) {
        if (strtolower($nome) === 'authorization') {
            return $valor;
        }
    }

    $possiveisChaves = [
        'HTTP_AUTHORIZATION',
        'REDIRECT_HTTP_AUTHORIZATION',
        'Authorization',
        'authorization',
    ];

    foreach ($possiveisChaves as $chave) {
        if (!empty($_SERVER[$chave])) {
            return $_SERVER[$chave];
        }
    }

    return null;
}

/**
 * Verifica autenticação e autorização baseada em roles
 * @param array $rolesPermitidas Roles que podem acessar
 * @return array Dados do usuário autenticado
 */
function normalizarRole($valor)
{
    if (!is_string($valor)) {
        return '';
    }

    $valor = iconv('UTF-8', 'ASCII//TRANSLIT', $valor);
    $valor = strtolower(trim((string) $valor));
    $valor = preg_replace('/[^a-z0-9]+/', '', $valor);

    return (string) $valor;
}

function autenticarEAutorizar($rolesPermitidas = [])
{
    require_once __DIR__ . '/../config/database.php';

    $usuarioAutenticado = autenticar();

    if (empty($rolesPermitidas)) {
        return $usuarioAutenticado;
    }

    $db = (new DB())->getConnection();
    $query = "
        SELECT tu.descricao as role
        FROM Usuario u
        LEFT JOIN tipoUsuario tu ON u.idtipoUsuario = tu.idtipoUsuario
        WHERE u.idUsuario = ?
        LIMIT 1
    ";

    $stmt = $db->prepare($query);
    $stmt->execute([$usuarioAutenticado['idUsuario']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    $roleAtual = normalizarRole($usuario['role'] ?? '');
    $rolesPermitidasNormalizadas = array_map(
        fn($role) => normalizarRole($role),
        $rolesPermitidas
    );

    if (!$usuario || !in_array($roleAtual, $rolesPermitidasNormalizadas, true)) {
        http_response_code(403);
        echo json_encode([
            'erro' => 'Acesso negado. Permissão insuficiente.',
            'rolesRequeridas' => $rolesPermitidas,
            'roleAtual' => $usuario['role'] ?? 'desconhecido'
        ]);
        exit();
    }

    return $usuarioAutenticado;
}
