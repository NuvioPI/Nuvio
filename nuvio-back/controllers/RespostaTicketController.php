<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/RespostaTicket.php';

class RespostaTicketController
{
    private $resposta;

    public function __construct()
    {
        $database = new DB();
        $this->resposta = new RespostaTicket($database->getConnection());
    }

    public function index()
    {
        try {
            $idTicket = isset($_GET['idTicket']) ? (int)$_GET['idTicket'] : null;
            if ($idTicket) {
                $this->resposta->idTicket = $idTicket;
                echo json_encode(['respostas' => $this->resposta->getByTicket()->fetchAll(PDO::FETCH_ASSOC)]);
                return;
            }

            echo json_encode(['respostas' => []]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar respostas.']);
        }
    }

    public function show($id)
    {
        try {
            $this->resposta->idRespostaTicket = (int)$id;
            if (!$this->resposta->getById()) {
                http_response_code(404);
                echo json_encode(['erro' => 'Resposta não encontrada.']);
                return;
            }

            echo json_encode(['resposta' => [
                'idRespostaTicket' => $this->resposta->idRespostaTicket,
                'idUsuario' => $this->resposta->idUsuario,
                'idTicket' => $this->resposta->idTicket,
                'msgTicket' => $this->resposta->msgTicket,
                'dataResposta' => $this->resposta->dataResposta,
            ]]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao buscar resposta.']);
        }
    }

    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['idUsuario']) || empty($data['idTicket']) || empty($data['msgTicket'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'idUsuario, idTicket e msgTicket são obrigatórios.']);
            return;
        }

        try {
            $this->resposta->idUsuario = (int)$data['idUsuario'];
            $this->resposta->idTicket = (int)$data['idTicket'];
            $this->resposta->msgTicket = $data['msgTicket'];

            if ($this->resposta->create()) {
                http_response_code(201);
                echo json_encode(['mensagem' => 'Resposta criada com sucesso.']);
                return;
            }

            http_response_code(400);
            echo json_encode(['erro' => 'Não foi possível criar a resposta.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar resposta.']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['msgTicket'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'msgTicket é obrigatório.']);
            return;
        }

        try {
            $this->resposta->idRespostaTicket = (int)$id;
            $this->resposta->idUsuario = (int)($data['idUsuario'] ?? 0);
            $this->resposta->msgTicket = $data['msgTicket'];

            if ($this->resposta->update()) {
                echo json_encode(['mensagem' => 'Resposta atualizada com sucesso.']);
                return;
            }

            http_response_code(404);
            echo json_encode(['erro' => 'Resposta não encontrada ou não pertence ao usuário.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar resposta.']);
        }
    }

    public function destroy($id)
    {
        try {
            $this->resposta->idRespostaTicket = (int)$id;
            if ($this->resposta->delete()) {
                echo json_encode(['mensagem' => 'Resposta removida com sucesso.']);
                return;
            }

            http_response_code(404);
            echo json_encode(['erro' => 'Resposta não encontrada.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover resposta.']);
        }
    }
}
