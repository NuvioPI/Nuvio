<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../models/usuario.php';

class AuthController
{
    private $db;
    private $usuario;

    public function __construct()
    {
        $database = new DB();
        $this->db = $database->getConnection();
        $this->usuario = new Usuario($this->db);
    }

    public function login()
    {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) {
            $body = [];
        }

        $body['email'] = isset($body['email']) ? trim((string) $body['email']) : '';
        $body['senha'] = isset($body['senha']) ? (string) $body['senha'] : '';

        // Logging básico para depuração de login (não grava senhas)
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
        $logFile = $logDir . '/auth.log';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '??';
        $emailLog = $body['email'] !== '' ? $body['email'] : 'desconhecido';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN ATTEMPT | IP={$ip} | email={$emailLog}\n", FILE_APPEND);

        if ($body['email'] === '' || $body['senha'] === '') {
            http_response_code(400);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN FAILED | missing credentials | IP={$ip} | email={$emailLog}\n", FILE_APPEND);
            echo json_encode(['erro' => 'Email e senha são obrigatórios.']);
            return;
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN FAILED | invalid email format | IP={$ip} | email={$emailLog}\n", FILE_APPEND);
            echo json_encode(['erro' => 'Formato de email inválido.']);
            return;
        }

        $usuario = $this->buscarPorEmailComTipo($body['email']);
        if (!$usuario) {
            http_response_code(401);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN FAILED | user not found | IP={$ip} | email={$emailLog}\n", FILE_APPEND);
            echo json_encode(['erro' => 'Credenciais inválidas.']);
            return;
        }

        $senhaHash = $usuario['senhahash'] ?? $usuario['senhaHash'] ?? null;
        $senhaValida = $senhaHash && password_verify($body['senha'], $senhaHash);

        // Registros antigos foram importados com senha em texto puro. Ao
        // autenticarem corretamente, são migrados de imediato para bcrypt.
        if (!$senhaValida && $senhaHash && hash_equals($senhaHash, $body['senha'])) {
            $senhaValida = true;
            $atualizarSenha = $this->db->prepare(
                'UPDATE Usuario SET senhaHash = ? WHERE idUsuario = ?'
            );
            $atualizarSenha->execute([
                password_hash($body['senha'], PASSWORD_BCRYPT),
                (int) ($usuario['idusuario'] ?? $usuario['idUsuario']),
            ]);
        }

        if (!$senhaValida) {
            http_response_code(401);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN FAILED | invalid password | IP={$ip} | email={$emailLog}\n", FILE_APPEND);
            echo json_encode(['erro' => 'Credenciais inválidas.']);
            return;
        }

        $idUsuario = (int) ($usuario['idusuario'] ?? $usuario['idUsuario']);
        $idTipoUsuario = (int) ($usuario['idtipousuario'] ?? $usuario['idtipoUsuario']);
        $tipo = $usuario['tipo'] ?? null;

        $token = JWT::gerar([
            'idUsuario' => $idUsuario,
            'idtipoUsuario' => $idTipoUsuario,
            'email' => $usuario['email'],
            'nome' => $usuario['nome'],
            'tipo' => $tipo,
        ]);

        file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN SUCCESS | IP={$ip} | idUsuario={$idUsuario} | email={$emailLog}\n", FILE_APPEND);

        echo json_encode([
            'mensagem' => 'Login realizado com sucesso.',
            'token' => $token,
            'usuario' => [
                'id' => $idUsuario,
                'idtipoUsuario' => $idTipoUsuario,
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'cargo' => $usuario['cargo'] ?? null,
                'setor' => $usuario['setor'] ?? null,
                'tipo' => [
                    'id' => $idTipoUsuario,
                    'nome' => $tipo,
                ],
            ],
        ]);
    }

    public function registro()
    {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) {
            $body = [];
        }

        $body['nome'] = isset($body['nome']) ? trim((string) $body['nome']) : '';
        $body['email'] = isset($body['email']) ? trim((string) $body['email']) : '';
        $body['senha'] = isset($body['senha']) ? (string) $body['senha'] : '';

        if ($body['nome'] === '' || $body['email'] === '' || $body['senha'] === '') {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, email e senha são obrigatórios.']);
            return;
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Formato de email inválido.']);
            return;
        }

        if ($this->usuario->emailExiste($body['email'])) {
            http_response_code(409);
            echo json_encode(['erro' => 'Email já cadastrado.']);
            return;
        }

        $this->usuario->idtipoUsuario = 1;
        $this->usuario->nome = htmlspecialchars(strip_tags($body['nome']));
        $this->usuario->email = htmlspecialchars(strip_tags($body['email']));
        $this->usuario->senhaHash = password_hash($body['senha'], PASSWORD_BCRYPT);
        $this->usuario->cargo = htmlspecialchars(strip_tags((string) ($body['cargo'] ?? '')));
        $this->usuario->setor = htmlspecialchars(strip_tags((string) ($body['setor'] ?? '')));

        if ($this->usuario->criar()) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Usuário criado com sucesso.']);
            return;
        }

        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao criar usuário.']);
    }

    public function me()
    {
        $auth = autenticar();
        $usuario = $this->usuario->buscarPorId($auth['idUsuario']);
        if ($usuario) {
            echo json_encode([
                'usuario' => [
                    'id' => (int) ($usuario['idusuario'] ?? $usuario['idUsuario']),
                    'idtipoUsuario' => (int) ($usuario['idtipousuario'] ?? $usuario['idtipoUsuario']),
                    'nome' => $usuario['nome'],
                    'email' => $usuario['email'],
                    'cargo' => $usuario['cargo'] ?? null,
                    'setor' => $usuario['setor'] ?? null,
                    'telefone' => $usuario['telefone'] ?? null,
                    'fotoPerfil' => $usuario['fotoPerfil'] ?? $usuario['fotoperfil'] ?? null,
                    'dataCadastro' => $usuario['dataCadastro'] ?? $usuario['datacadastro'] ?? null,
                    'tipo' => $usuario['tipo'] ?? $auth['tipo'] ?? null,
                ],
            ]);
            return;
        }

        http_response_code(404);
        echo json_encode(['erro' => 'Usuário não encontrado.']);
    }

    public function atualizarPerfil($idUsuario)
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['nome']) || empty($body['email'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome e e-mail são obrigatórios.']);
            return;
        }

        $this->usuario->idUsuario = (int) $idUsuario;
        if (!$this->usuario->get()) {
            http_response_code(404);
            echo json_encode(['erro' => 'Usuário não encontrado.']);
            return;
        }

        if ($body['email'] !== $this->usuario->email && $this->usuario->emailExiste($body['email'])) {
            http_response_code(409);
            echo json_encode(['erro' => 'Este e-mail já está em uso por outro usuário.']);
            return;
        }

        $this->usuario->nome = htmlspecialchars(strip_tags($body['nome']));
        $this->usuario->email = htmlspecialchars(strip_tags($body['email']));
        if (isset($body['cargo'])) $this->usuario->cargo = htmlspecialchars(strip_tags($body['cargo']));
        if (isset($body['setor'])) $this->usuario->setor = htmlspecialchars(strip_tags($body['setor']));
        if (isset($body['telefone'])) $this->usuario->telefone = htmlspecialchars(strip_tags($body['telefone']));
        if (isset($body['fotoPerfil'])) $this->usuario->fotoPerfil = htmlspecialchars(strip_tags($body['fotoPerfil']));

        if ($this->usuario->update()) {
            if (!empty($body['senha'])) {
                $this->usuario->updateSenha(password_hash($body['senha'], PASSWORD_BCRYPT));
            }

            $usuarioAtualizado = $this->usuario->buscarPorId($idUsuario);

            echo json_encode([
                'mensagem' => 'Perfil atualizado com sucesso!',
                'usuario' => [
                    'id' => (int) ($usuarioAtualizado['idusuario'] ?? $usuarioAtualizado['idUsuario']),
                    'idtipoUsuario' => (int) ($usuarioAtualizado['idtipousuario'] ?? $usuarioAtualizado['idtipoUsuario']),
                    'nome' => $usuarioAtualizado['nome'],
                    'email' => $usuarioAtualizado['email'],
                    'cargo' => $usuarioAtualizado['cargo'] ?? null,
                    'setor' => $usuarioAtualizado['setor'] ?? null,
                    'telefone' => $usuarioAtualizado['telefone'] ?? null,
                    'fotoPerfil' => $usuarioAtualizado['fotoPerfil'] ?? $usuarioAtualizado['fotoperfil'] ?? null,
                    'dataCadastro' => $usuarioAtualizado['dataCadastro'] ?? $usuarioAtualizado['datacadastro'] ?? null,
                    'tipo' => $usuarioAtualizado['tipo'] ?? null,
                ]
            ]);
            return;
        }

        http_response_code(500);
        echo json_encode(['erro' => 'Não foi possível atualizar o perfil.']);
    }

    private function buscarPorEmailComTipo(string $email)
    {
        $query = '
            SELECT u.*, tu.descricao AS tipo
            FROM Usuario u
            INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
            WHERE u.email = ?
            LIMIT 1
        ';
        $stmt = $this->db->prepare($query);
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
