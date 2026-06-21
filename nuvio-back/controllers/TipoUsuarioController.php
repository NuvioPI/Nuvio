<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/TipoUsuario.php';

class TipoUsuarioController extends BaseController
{
    private $tipoUsuario;

    public function __construct()
    {
        parent::__construct();
        $this->tipoUsuario = new TipoUsuario($this->db);
    }

    public function index()
    {
        $this->respond(['tiposUsuario' => $this->rows($this->tipoUsuario->getAll())]);
    }

    public function show($id)
    {
        $this->tipoUsuario->idtipoUsuario = $id;

        if (!$this->tipoUsuario->getById()) {
            $this->respond(['erro' => 'Tipo de usuário não encontrado.'], 404);
            return;
        }

        $this->respond(['tipoUsuario' => [
            'idtipoUsuario' => (int)$this->tipoUsuario->idtipoUsuario,
            'descricao' => $this->tipoUsuario->descricao,
        ]]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['descricao'])) {
            $this->respond(['erro' => 'Descrição é obrigatória.'], 400);
            return;
        }

        $this->tipoUsuario->descricao = $body['descricao'];

        if ($this->tipoUsuario->create()) {
            $this->respond([
                'mensagem' => 'Tipo de usuário criado com sucesso.',
                'idtipoUsuario' => (int)$this->tipoUsuario->idtipoUsuario,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Tipo inválido ou já cadastrado.'], 409);
    }

    public function update($id)
    {
        $this->respond(['erro' => 'Tipos de usuário são fixos e não podem ser editados.'], 405);
    }

    public function destroy($id)
    {
        $this->respond(['erro' => 'Tipos de usuário são fixos e não podem ser removidos.'], 405);
    }
}
