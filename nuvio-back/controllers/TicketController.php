<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Ticket.php';

class TicketController
{
    private $db;
    private $ticket;

    public function __construct()
    {
        try {
            $database = new DB();
            $this->db = $database->getConnection();
            $this->ticket = new Ticket($this->db);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Falha ao iniciar o controller de tickets.']);
            exit();
        }
    }

    public function index()
    {
        try {
            $stmt = $this->ticket->getAll();
            echo json_encode(['tickets' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar tickets.']);
        }
    }

    public function show($id)
    {
        try {
            $this->ticket->idTicket = $id;
            if (!$this->ticket->getById()) {
                http_response_code(404);
                echo json_encode(['erro' => 'Ticket não encontrado.']);
                return;
            }

            echo json_encode(['ticket' => [
                'idTicket' => $this->ticket->idTicket,
                'titulo' => $this->ticket->titulo,
                'statusTicket' => $this->ticket->statusTicket,
                'prioridade' => $this->ticket->prioridade,
                'dataAbertura' => $this->ticket->dataAbertura,
                'dataFechamento' => $this->ticket->dataFechamento,
                'idUsuario' => $this->ticket->idUsuario,
                'idTecnico' => $this->ticket->idTecnico,
                'idCategoria' => $this->ticket->idCategoria,
                'idSLA' => $this->ticket->idSLA,
            ]]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao buscar ticket.']);
        }
    }

    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['idUsuario']) || empty($data['idTecnico']) || empty($data['idCategoria']) || empty($data['idSLA']) || empty($data['titulo']) || empty($data['prioridade'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: idUsuario, idTecnico, idCategoria, idSLA, titulo e prioridade.']);
            return;
        }

        try {
            $this->ticket->idTecnico = (int)$data['idTecnico'];
            $this->ticket->idUsuario = (int)$data['idUsuario'];
            $this->ticket->idCategoria = (int)$data['idCategoria'];
            $this->ticket->idSLA = (int)$data['idSLA'];
            $this->ticket->titulo = $data['titulo'];
            $this->ticket->prioridade = $data['prioridade'];

            if ($this->ticket->create()) {
                http_response_code(201);
                echo json_encode(['mensagem' => 'Ticket criado com sucesso.', 'ticket' => ['idTicket' => $this->ticket->idTicket]]);
                return;
            }

            http_response_code(400);
            echo json_encode(['erro' => 'Não foi possível criar o ticket.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar ticket.']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $this->ticket->idTicket = (int)$id;

            if (isset($data['statusTicket'])) {
                $this->ticket->statusTicket = $data['statusTicket'];
                if ($this->ticket->updateStatus()) {
                    echo json_encode(['mensagem' => 'Status atualizado com sucesso.']);
                    return;
                }
            }

            if (isset($data['idTecnico'])) {
                $this->ticket->idTecnico = (int)$data['idTecnico'];
                if ($this->ticket->reatribuir()) {
                    echo json_encode(['mensagem' => 'Técnico reatribuído com sucesso.']);
                    return;
                }
            }

            if (isset($data['fechar']) && (bool)$data['fechar']) {
                if ($this->ticket->fechar()) {
                    echo json_encode(['mensagem' => 'Ticket fechado com sucesso.']);
                    return;
                }
            }

            http_response_code(400);
            echo json_encode(['erro' => 'Nenhuma alteração válida foi aplicada.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar ticket.']);
        }
    }

    public function destroy($id)
    {
        try {
            $this->ticket->idTicket = (int)$id;

            if ($this->ticket->delete()) {
                echo json_encode(['mensagem' => 'Ticket removido com sucesso.']);
                return;
            }

            http_response_code(404);
            echo json_encode(['erro' => 'Ticket não encontrado.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover ticket.']);
        }
    }
}
