<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/SLA.php';

class SlaController
{
    private $sla;

    public function __construct()
    {
        $database = new DB();
        $this->sla = new SLA($database->getConnection());
    }

    public function index()
    {
        try {
            echo json_encode(['sla' => $this->sla->getAll()->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar SLAs.']);
        }
    }

    public function show($id)
    {
        try {
            $this->sla->idSLA = (int)$id;
            if (!$this->sla->getById()) {
                http_response_code(404);
                echo json_encode(['erro' => 'SLA não encontrado.']);
                return;
            }

            echo json_encode(['sla' => [
                'idSLA' => $this->sla->idSLA,
                'nomeSLA' => $this->sla->nomeSLA,
                'tempoResposta' => $this->sla->tempoResposta,
                'tempoResolucao' => $this->sla->tempoResolucao,
                'descricao' => $this->sla->descricao,
            ]]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao buscar SLA.']);
        }
    }

    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['nomeSLA']) || !isset($data['tempoResposta'], $data['tempoResolucao'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, tempoResposta e tempoResolucao são obrigatórios.']);
            return;
        }

        try {
            $this->sla->nomeSLA = $data['nomeSLA'];
            $this->sla->tempoResposta = (int)$data['tempoResposta'];
            $this->sla->tempoResolucao = (int)$data['tempoResolucao'];
            $this->sla->descricao = $data['descricao'] ?? '';

            if ($this->sla->create()) {
                http_response_code(201);
                echo json_encode(['mensagem' => 'SLA criado com sucesso.']);
                return;
            }

            http_response_code(409);
            echo json_encode(['erro' => 'SLA inválido ou já existe.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar SLA.']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['nomeSLA']) || !isset($data['tempoResposta'], $data['tempoResolucao'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, tempoResposta e tempoResolucao são obrigatórios.']);
            return;
        }

        try {
            $this->sla->idSLA = (int)$id;
            $this->sla->nomeSLA = $data['nomeSLA'];
            $this->sla->tempoResposta = (int)$data['tempoResposta'];
            $this->sla->tempoResolucao = (int)$data['tempoResolucao'];
            $this->sla->descricao = $data['descricao'] ?? '';

            if ($this->sla->update()) {
                echo json_encode(['mensagem' => 'SLA atualizado com sucesso.']);
                return;
            }

            http_response_code(404);
            echo json_encode(['erro' => 'SLA não encontrado ou inválido.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar SLA.']);
        }
    }

    public function destroy($id)
    {
        try {
            $this->sla->idSLA = (int)$id;
            if ($this->sla->delete()) {
                echo json_encode(['mensagem' => 'SLA removido com sucesso.']);
                return;
            }

            http_response_code(409);
            echo json_encode(['erro' => 'SLA não pode ser removido porque está vinculado a tickets.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover SLA.']);
        }
    }
}
