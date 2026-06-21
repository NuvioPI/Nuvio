<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Ticket.php';

class TicketController extends BaseController
{
    private $ticket;

    public function __construct()
    {
        parent::__construct();
        $this->ticket = new Ticket($this->db);
    }

    public function index()
    {
        if (isset($_GET['idUsuario'])) {
            $this->ticket->idUsuario = (int)$_GET['idUsuario'];
            $this->respond(['tickets' => $this->rows($this->ticket->getByUsuario())]);
            return;
        }

        if (isset($_GET['idTecnico'])) {
            $this->ticket->idTecnico = (int)$_GET['idTecnico'];
            $this->respond(['tickets' => $this->rows($this->ticket->getByTecnico())]);
            return;
        }

        $this->respond(['tickets' => $this->rows($this->ticket->getAll())]);
    }

    public function show($id)
    {
        $this->ticket->idTicket = $id;

        if (!$this->ticket->getById()) {
            $this->respond(['erro' => 'Ticket não encontrado.'], 404);
            return;
        }

        $this->respond(['ticket' => [
            'idTicket' => (int)$this->ticket->idTicket,
            'idUsuario' => (int)$this->ticket->idUsuario,
            'idTecnico' => (int)$this->ticket->idTecnico,
            'idCategoria' => (int)$this->ticket->idCategoria,
            'idSLA' => (int)$this->ticket->idSLA,
            'titulo' => $this->ticket->titulo,
            'statusTicket' => $this->ticket->statusTicket,
            'prioridade' => $this->ticket->prioridade,
            'dataAbertura' => $this->ticket->dataAbertura,
            'dataFechamento' => $this->ticket->dataFechamento,
        ]]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['idTecnico', 'idUsuario', 'idCategoria', 'idSLA', 'titulo', 'prioridade'])) {
            $this->respond(['erro' => 'Técnico, usuário, categoria, SLA, título e prioridade são obrigatórios.'], 400);
            return;
        }

        $this->fillCreate($body);

        if ($this->ticket->create()) {
            $this->respond([
                'mensagem' => 'Ticket criado com sucesso.',
                'idTicket' => (int)$this->ticket->idTicket,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar o ticket.'], 500);
    }

    public function update($id)
    {
        $body = $this->body();
        $this->ticket->idTicket = $id;

        if (isset($body['statusTicket']) && $body['statusTicket'] === 'Fechado') {
            if ($this->ticket->fechar()) {
                $this->respond(['mensagem' => 'Ticket fechado com sucesso.']);
                return;
            }
        }

        if (isset($body['statusTicket'])) {
            $this->ticket->statusTicket = $body['statusTicket'];

            if ($this->ticket->updateStatus()) {
                $this->respond(['mensagem' => 'Status do ticket atualizado com sucesso.']);
                return;
            }
        }

        if (isset($body['idTecnico'])) {
            $this->ticket->idTecnico = (int)$body['idTecnico'];

            if ($this->ticket->reatribuir()) {
                $this->respond(['mensagem' => 'Ticket reatribuído com sucesso.']);
                return;
            }
        }

        $this->respond(['erro' => 'Informe statusTicket ou idTecnico para atualizar o ticket.'], 400);
    }

    public function destroy($id)
    {
        $this->ticket->idTicket = $id;

        if ($this->ticket->delete()) {
            $this->respond(['mensagem' => 'Ticket removido com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Ticket não encontrado.'], 404);
    }

    private function fillCreate(array $body)
    {
        $this->ticket->idTecnico = (int)$body['idTecnico'];
        $this->ticket->idUsuario = (int)$body['idUsuario'];
        $this->ticket->idCategoria = (int)$body['idCategoria'];
        $this->ticket->idSLA = (int)$body['idSLA'];
        $this->ticket->titulo = $body['titulo'];
        $this->ticket->prioridade = $body['prioridade'];
    }
}
