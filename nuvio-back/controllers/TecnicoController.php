<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Tecnico.php';

class TecnicoController extends BaseController
{
    private $tecnico;

    public function __construct()
    {
        parent::__construct();
        $this->tecnico = new Tecnico($this->db);
    }

    public function index()
    {
        if (isset($_GET['ativos']) && $_GET['ativos'] === '1') {
            $this->respond(['tecnicos' => $this->rows($this->tecnico->getAtivos())]);
            return;
        }

        if (isset($_GET['idUsuario'])) {
            $this->tecnico->idUsuario = (int)$_GET['idUsuario'];

            if (!$this->tecnico->getByUsuario()) {
                $this->respond(['erro' => 'Técnico não encontrado para este usuário.'], 404);
                return;
            }

            $this->respond(['tecnico' => $this->toArray()]);
            return;
        }

        $this->respond(['tecnicos' => $this->rows($this->tecnico->getAll())]);
    }

    public function show($id)
    {
        $this->tecnico->idTecnico = $id;

        if (!$this->tecnico->getById()) {
            $this->respond(['erro' => 'Técnico não encontrado.'], 404);
            return;
        }

        $this->respond(['tecnico' => $this->toArray()]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['idUsuario', 'especialidade'])) {
            $this->respond(['erro' => 'Usuário e especialidade são obrigatórios.'], 400);
            return;
        }

        $this->tecnico->idUsuario = (int)$body['idUsuario'];
        $this->tecnico->especialidade = $body['especialidade'];

        if ($this->tecnico->create()) {
            $this->respond([
                'mensagem' => 'Técnico criado com sucesso.',
                'idTecnico' => (int)$this->tecnico->idTecnico,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar o técnico. Verifique se o usuário já está vinculado.'], 409);
    }

    public function update($id)
    {
        $body = $this->body();
        $this->tecnico->idTecnico = $id;

        if (array_key_exists('ativo', $body)) {
            if ($this->tecnico->setAtivo((bool)$body['ativo'])) {
                $this->respond(['mensagem' => 'Status do técnico atualizado com sucesso.']);
                return;
            }
        }

        if ($this->missing($body, ['especialidade'])) {
            $this->respond(['erro' => 'Especialidade é obrigatória.'], 400);
            return;
        }

        $this->tecnico->especialidade = $body['especialidade'];

        if ($this->tecnico->update()) {
            $this->respond(['mensagem' => 'Técnico atualizado com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível atualizar o técnico.'], 500);
    }

    public function destroy($id)
    {
        $this->tecnico->idTecnico = $id;

        if ($this->tecnico->setAtivo(false)) {
            $this->respond(['mensagem' => 'Técnico desativado com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível desativar o técnico.'], 500);
    }

    private function toArray()
    {
        return [
            'idTecnico' => (int)$this->tecnico->idTecnico,
            'idUsuario' => (int)$this->tecnico->idUsuario,
            'especialidade' => $this->tecnico->especialidade,
            'ativo' => (bool)$this->tecnico->ativo,
        ];
    }
}
