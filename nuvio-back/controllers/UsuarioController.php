<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/usuario.php';

class UsuarioController extends BaseController
{
    private $usuario;

    public function __construct()
    {
        parent::__construct();
        $this->usuario = new Usuario($this->db);
    }

    public function index()
    {
        $this->respond(['usuarios' => $this->rows($this->usuario->getAll())]);
    }

    public function show($id)
    {
        $usuario = $this->usuario->find($id);

        if (!$usuario) {
            $this->respond(['erro' => 'Usuário não encontrado.'], 404);
            return;
        }

        $this->respond(['usuario' => $usuario]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['nome', 'email', 'senha'])) {
            $this->respond(['erro' => 'Nome, email e senha são obrigatórios.'], 400);
            return;
        }

        $this->usuario->nome = $body['nome'];
        $this->usuario->email = $body['email'];
        $this->usuario->senhaHash = password_hash($body['senha'], PASSWORD_BCRYPT);
        $this->usuario->idtipoUsuario = (int) ($body['idtipoUsuario'] ?? 1);
        $this->usuario->cargo = $body['cargo'] ?? '';
        $this->usuario->setor = $body['setor'] ?? '';

        if ($this->usuario->create()) {
            $this->respond([
                'mensagem' => 'Usuário criado com sucesso.',
                'idUsuario' => (int)$this->usuario->idUsuario,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar o usuário.'], 500);
    }

    public function update($id)
    {
        $body = $this->body();

        if ($this->missing($body, ['nome', 'email'])) {
            $this->respond(['erro' => 'Nome e email são obrigatórios.'], 400);
            return;
        }

        $this->usuario->idUsuario = $id;

        if (!$this->usuario->get()) {
            $this->respond(['erro' => 'Usuário não encontrado.'], 404);
            return;
        }

        $this->usuario->nome = $body['nome'];
        $this->usuario->email = $body['email'];
        $this->usuario->cargo = $body['cargo'] ?? $this->usuario->cargo;
        $this->usuario->setor = $body['setor'] ?? $this->usuario->setor;

        if ($this->usuario->update()) {
            if (!empty($body['senha'])) {
                $this->usuario->updateSenha(password_hash($body['senha'], PASSWORD_BCRYPT));
            }

            $this->respond(['mensagem' => 'Usuário atualizado com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível atualizar o usuário.'], 500);
    }

    public function destroy($id)
    {
        $this->usuario->idUsuario = $id;

        if ($this->usuario->delete()) {
            $this->respond(['mensagem' => 'Usuário removido com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Usuário não encontrado.'], 404);
    }
}
