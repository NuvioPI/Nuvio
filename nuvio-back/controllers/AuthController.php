<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../models/Usuario.php';

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

    // POST /auth/registro
    public function registro()
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (
            empty($body['nome']) ||
            empty($body['email']) ||
            empty($body['senha'])
        ) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, email e senha são obrigatórios.']);
            return;
        }

        // Verificar se email já existe
        if ($this->emailExiste($body['email'])) {
            http_response_code(409);
            echo json_encode(['erro' => 'Email já cadastrado.']);
            return;
        }

        $this->usuario->nome = htmlspecialchars(strip_tags($body['nome']));
        $this->usuario->email = htmlspecialchars(strip_tags($body['email']));
        $this->usuario->senhaHash = password_hash($body['senha'], PASSWORD_BCRYPT);

        if ($this->usuario->create()) {
            http_response_code(201);
            echo json_encode([
                'mensagem' => 'Usuário criado com sucesso.',
                'usuario' => [
                    'id'    => $this->usuario->idUsuario,
                    'nome'  => $this->usuario->nome,
                    'email' => $this->usuario->email,
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar usuário.']);
        }
    }

    // POST /auth/login
    public function login()
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (empty($body['email']) || empty($body['senha'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Email e senha são obrigatórios.']);
            return;
        }

        $usuario = $this->buscarPorEmail($body['email']);

        if (!$usuario) {
            http_response_code(401);
            echo json_encode(['erro' => 'Credenciais inválidas.']);
            return;
        }

        if (!password_verify($body['senha'], $usuario['senhaHash'])) {
            http_response_code(401);
            echo json_encode(['erro' => 'Credenciais inválidas.']);
            return;
        }

        $token = JWT::gerar([
            'idUsuario' => $usuario['idUsuario'],
            'email'     => $usuario['email'],
            'nome'      => $usuario['nome'],
        ]);

        http_response_code(200);
        echo json_encode([
            'mensagem' => 'Login realizado com sucesso.',
            'token'    => $token,
            'usuario'  => [
                'id'    => $usuario['idUsuario'],
                'nome'  => $usuario['nome'],
                'email' => $usuario['email'],
            ]
        ]);
    }

    // -------------------------------------------------------
    // Métodos privados auxiliares
    // -------------------------------------------------------

    private function buscarPorEmail($email)
    {
        $query = "SELECT idUsuario, nome, email, senhaHash FROM usuario WHERE email = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function emailExiste($email)
    {
        $query = "SELECT COUNT(*) FROM usuario WHERE email = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }
}