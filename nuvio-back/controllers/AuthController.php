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

        if (empty($body['email']) || empty($body['senha'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Email e senha são obrigatórios.']);
            return;
        }

        $usuario = $this->usuario->buscarPorEmail($body['email']);

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
            'idtipoUsuario' => $usuario['idtipoUsuario'],
            'email' => $usuario['email'],
            'nome' => $usuario['nome'],
        ]);

        echo json_encode([
            'mensagem' => 'Login realizado com sucesso.',
            'token' => $token,
            'usuario' => [
                'id' => $usuario['idUsuario'],
                'idtipoUsuario' => $usuario['idtipoUsuario'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'cargo' => $usuario['cargo'],
                'setor' => $usuario['setor'],
            ]
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
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar usuário.']);
        }
    }

    public function me()
    {
        $auth = autenticar();
        $usuario = $this->usuario->buscarPorId($auth['idUsuario']);
        if ($usuario) {
            echo json_encode([
                'id' => $usuario['idUsuario'],
                'idtipoUsuario' => $usuario['idtipoUsuario'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'cargo' => $usuario['cargo'],
                'setor' => $usuario['setor'],
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['erro' => 'Usuário não encontrado.']);
        }
    }
}