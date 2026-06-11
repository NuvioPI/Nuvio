<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Categoria.php';

class CategoriaController
{
    private $categoria;

    public function __construct()
    {
        $database = new DB();
        $this->categoria = new Categoria($database->getConnection());
    }

    public function index()
    {
        try {
            echo json_encode(['categorias' => $this->categoria->getAll()->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar categorias.']);
        }
    }

    public function show($id)
    {
        try {
            $this->categoria->idCategoria = (int)$id;
            if (!$this->categoria->getById()) {
                http_response_code(404);
                echo json_encode(['erro' => 'Categoria não encontrada.']);
                return;
            }

            echo json_encode(['categoria' => [
                'idCategoria' => $this->categoria->idCategoria,
                'nomeCategoria' => $this->categoria->nomeCategoria,
                'descricao' => $this->categoria->descricao,
            ]]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao buscar categoria.']);
        }
    }

    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['nomeCategoria'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome da categoria é obrigatório.']);
            return;
        }

        try {
            $this->categoria->nomeCategoria = $data['nomeCategoria'];
            $this->categoria->descricao = $data['descricao'] ?? '';

            if ($this->categoria->create()) {
                http_response_code(201);
                echo json_encode(['mensagem' => 'Categoria criada com sucesso.']);
                return;
            }

            http_response_code(409);
            echo json_encode(['erro' => 'Categoria já existe ou não pôde ser criada.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar categoria.']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['nomeCategoria'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome da categoria é obrigatório.']);
            return;
        }

        try {
            $this->categoria->idCategoria = (int)$id;
            $this->categoria->nomeCategoria = $data['nomeCategoria'];
            $this->categoria->descricao = $data['descricao'] ?? '';

            if ($this->categoria->update()) {
                echo json_encode(['mensagem' => 'Categoria atualizada com sucesso.']);
                return;
            }

            http_response_code(404);
            echo json_encode(['erro' => 'Categoria não encontrada.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar categoria.']);
        }
    }

    public function destroy($id)
    {
        try {
            $this->categoria->idCategoria = (int)$id;
            if ($this->categoria->delete()) {
                echo json_encode(['mensagem' => 'Categoria removida com sucesso.']);
                return;
            }

            http_response_code(409);
            echo json_encode(['erro' => 'Categoria não pode ser removida porque está vinculada a tickets.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover categoria.']);
        }
    }
}
