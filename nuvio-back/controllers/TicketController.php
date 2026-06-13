<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Ticket.php';
require_once __DIR__ . '/../models/RespostaTicket.php';

class TicketController
{
    private $db;
    private $ticket;
    private $respostaTicket;
    private $usuarioAutenticado;

    public function __construct()
    {
        header('Content-Type: application/json; charset=utf-8');

        $database = new DB();
        $this->db = $database->getConnection();
        $this->ticket = new Ticket($this->db);
        $this->respostaTicket = new RespostaTicket($this->db);

        global $usuarioAutenticado;
        $this->usuarioAutenticado = $usuarioAutenticado ?? null;
    }

    private function readBody(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);
        return is_array($body) ? $body : [];
    }

    public function index()
    {
        $stmt = $this->ticket->getAll();
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(['tickets' => $tickets], JSON_UNESCAPED_UNICODE);
    }

    public function show($id)
    {
        $this->ticket->idTicket = (int)$id;

        if (!$this->ticket->getById()) {
            http_response_code(404);
            echo json_encode(['erro' => 'Ticket não encontrado.']);
            return;
        }

        $this->respostaTicket->idTicket = $this->ticket->idTicket;
        $historicoStmt = $this->respostaTicket->getByTicket();
        $historico = $historicoStmt->fetchAll(PDO::FETCH_ASSOC);

        $ticketData = [
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
            'nomeUsuario' => isset($this->ticket->nomeUsuario) ? $this->ticket->nomeUsuario : null,
            'nomeTecnico' => isset($this->ticket->nomeTecnico) ? $this->ticket->nomeTecnico : null,
            'nomeCategoria' => isset($this->ticket->nomeCategoria) ? $this->ticket->nomeCategoria : null,
            'nomeSLA' => isset($this->ticket->nomeSLA) ? $this->ticket->nomeSLA : null,
            'tempoResposta' => isset($this->ticket->tempoResposta) ? $this->ticket->tempoResposta : null,
            'tempoResolucao' => isset($this->ticket->tempoResolucao) ? $this->ticket->tempoResolucao : null,
            'historico' => $historico,
        ];

        http_response_code(200);
        echo json_encode(['ticket' => $ticketData], JSON_UNESCAPED_UNICODE);
    }

    public function store()
    {
        $body = $this->readBody();

        if (empty($body['idCategoria']) || empty($body['idSLA']) || empty($body['titulo']) || empty($body['prioridade']) || empty($body['idTecnico'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'idCategoria, idSLA, titulo, prioridade e idTecnico são obrigatórios.']);
            return;
        }

        if (empty($this->usuarioAutenticado['idUsuario'])) {
            http_response_code(401);
            echo json_encode(['erro' => 'Usuário não autenticado.']);
            return;
        }

        $this->ticket->idUsuario = (int)$this->usuarioAutenticado['idUsuario'];
        $this->ticket->idCategoria = (int)$body['idCategoria'];
        $this->ticket->idSLA = (int)$body['idSLA'];
        $this->ticket->idTecnico = (int)$body['idTecnico'];
        $this->ticket->titulo = $body['titulo'];
        $this->ticket->prioridade = $body['prioridade'];

        if ($this->ticket->create()) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Ticket criado com sucesso.', 'ticket' => ['idTicket' => $this->ticket->idTicket, 'titulo' => $this->ticket->titulo, 'statusTicket' => $this->ticket->statusTicket, 'prioridade' => $this->ticket->prioridade, 'idUsuario' => $this->ticket->idUsuario, 'idTecnico' => $this->ticket->idTecnico, 'idCategoria' => $this->ticket->idCategoria, 'idSLA' => $this->ticket->idSLA]], JSON_UNESCAPED_UNICODE);
            return;
        }

        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao criar ticket.']);
    }

    public function update($id)
    {
        $this->ticket->idTicket = (int)$id;

        if (!$this->ticket->getById()) {
            http_response_code(404);
            echo json_encode(['erro' => 'Ticket não encontrado.']);
            return;
        }

        $body = $this->readBody();

        if (empty($body)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Corpo da requisição vazio.']);
            return;
        }

        if (isset($body['titulo'])) {
            $this->ticket->titulo = $body['titulo'];
        }
        if (isset($body['statusTicket'])) {
            $this->ticket->statusTicket = $body['statusTicket'];
        }
        if (isset($body['prioridade'])) {
            $this->ticket->prioridade = $body['prioridade'];
        }
        if (isset($body['idTecnico'])) {
            $this->ticket->idTecnico = (int)$body['idTecnico'];
        }
        if (isset($body['idCategoria'])) {
            $this->ticket->idCategoria = (int)$body['idCategoria'];
        }
        if (isset($body['idSLA'])) {
            $this->ticket->idSLA = (int)$body['idSLA'];
        }

        if (!$this->ticket->update()) {
            http_response_code(400);
            echo json_encode(['erro' => 'Falha ao atualizar ticket.']);
            return;
        }

        $this->ticket->getById();

        http_response_code(200);
        echo json_encode(['mensagem' => 'Ticket atualizado com sucesso.', 'ticket' => ['idTicket' => $this->ticket->idTicket, 'titulo' => $this->ticket->titulo, 'statusTicket' => $this->ticket->statusTicket, 'prioridade' => $this->ticket->prioridade, 'dataAbertura' => $this->ticket->dataAbertura, 'dataFechamento' => $this->ticket->dataFechamento, 'idUsuario' => $this->ticket->idUsuario, 'idTecnico' => $this->ticket->idTecnico, 'idCategoria' => $this->ticket->idCategoria, 'idSLA' => $this->ticket->idSLA]], JSON_UNESCAPED_UNICODE);
    }

    public function destroy($id)
    {
        $this->ticket->idTicket = (int)$id;

        if (!$this->ticket->getById()) {
            http_response_code(404);
            echo json_encode(['erro' => 'Ticket não encontrado.']);
            return;
        }

        if (!$this->ticket->delete()) {
            http_response_code(500);
            echo json_encode(['erro' => 'Falha ao excluir ticket.']);
            return;
        }

        http_response_code(200);
        echo json_encode(['mensagem' => 'Ticket excluído com sucesso.']);
    }
}
