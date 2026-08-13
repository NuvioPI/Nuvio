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

        // Logging básico para depuração de login (não grava senhas)
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
        $logFile = $logDir . '/auth.log';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '??';
        $emailLog = is_array($body) && isset($body['email']) ? $body['email'] : 'desconhecido';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN ATTEMPT | IP={$ip} | email={$emailLog}\n", FILE_APPEND);

        if (empty($body['email']) || empty($body['senha'])) {
            http_response_code(400);
            file_put_contents($logFile, date('Y-m-d H:i:s') . " | LOGIN FAILED | missing credentials | IP={$ip} | email={$emailLog}\n", FILE_APPEND);
            echo json_encode(['erro' => 'Email e senha são obrigatórios.']);
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
        if (!$senhaHash || !password_verify($body['senha'], $senhaHash)) {
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

        if (empty($body['nome']) || empty($body['email']) || empty($body['senha'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, email e senha são obrigatórios.']);
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
        $this->usuario->cargo = htmlspecialchars(strip_tags($body['cargo'] ?? ''));
        $this->usuario->setor = htmlspecialchars(strip_tags($body['setor'] ?? ''));

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
                'id' => $usuario['idusuario'] ?? $usuario['idUsuario'],
                'idtipoUsuario' => $usuario['idtipousuario'] ?? $usuario['idtipoUsuario'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'cargo' => $usuario['cargo'],
                'setor' => $usuario['setor'],
                'telefone' => $usuario['telefone'] ?? null,
                'fotoPerfil' => $usuario['fotoPerfil'] ?? $usuario['fotoperfil'] ?? null,
                'dataCadastro' => $usuario['dataCadastro'] ?? $usuario['datacadastro'] ?? null,
            ]);
            return;
        }

        http_response_code(404);
        echo json_encode(['erro' => 'Usuário não encontrado.']);
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
