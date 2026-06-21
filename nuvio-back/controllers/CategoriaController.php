<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Categoria.php';

class CategoriaController extends BaseController
{
    private $categoria;

    public function __construct()
    {
        parent::__construct();
        $this->categoria = new Categoria($this->db);
    }

    public function index()
    {
        $this->respond(['categorias' => $this->rows($this->categoria->getAll())]);
    }

    public function show($id)
    {
        $this->categoria->idCategoria = $id;

        if (!$this->categoria->getById()) {
            $this->respond(['erro' => 'Categoria não encontrada.'], 404);
            return;
        }

        $this->respond(['categoria' => [
            'idCategoria' => (int)$this->categoria->idCategoria,
            'nomeCategoria' => $this->categoria->nomeCategoria,
            'descricao' => $this->categoria->descricao,
        ]]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['nomeCategoria', 'descricao'])) {
            $this->respond(['erro' => 'Nome da categoria e descrição são obrigatórios.'], 400);
            return;
        }

        $this->categoria->nomeCategoria = $body['nomeCategoria'];
        $this->categoria->descricao = $body['descricao'];

        if ($this->categoria->create()) {
            $this->respond([
                'mensagem' => 'Categoria criada com sucesso.',
                'idCategoria' => (int)$this->categoria->idCategoria,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar a categoria. Verifique se ela já existe.'], 409);
    }

    public function update($id)
    {
        $body = $this->body();

        if ($this->missing($body, ['nomeCategoria', 'descricao'])) {
            $this->respond(['erro' => 'Nome da categoria e descrição são obrigatórios.'], 400);
            return;
        }

        $this->categoria->idCategoria = $id;
        $this->categoria->nomeCategoria = $body['nomeCategoria'];
        $this->categoria->descricao = $body['descricao'];

        if ($this->categoria->update()) {
            $this->respond(['mensagem' => 'Categoria atualizada com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível atualizar a categoria.'], 500);
    }

    public function destroy($id)
    {
        $this->categoria->idCategoria = $id;

        if ($this->categoria->delete()) {
            $this->respond(['mensagem' => 'Categoria removida com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Categoria não encontrada ou possui tickets vinculados.'], 409);
    }
}
