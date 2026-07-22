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
        $this->respond([
            'tickets' => $this->rows($this->ticket->getAll())
        ]);
    }

    public function show($id)
    {
        if (!$this->idValido($id)) {
            $this->respond(['erro' => 'ID do ticket inválido.'], 400);
            return;
        }

        $this->ticket->idTicket = (int) $id;

        if (!$this->ticket->getById()) {
            $this->respond(['erro' => 'Ticket não encontrado.'], 404);
            return;
        }

        $this->respond([
            'ticket' => [
                'idTicket' => (int) $this->ticket->idTicket,
                'idTecnico' => (int) $this->ticket->idTecnico,
                'idUsuario' => (int) $this->ticket->idUsuario,
                'idCategoria' => (int) $this->ticket->idCategoria,
                'idSLA' => (int) $this->ticket->idSLA,
                'titulo' => $this->ticket->titulo,
                'descricao' => $this->ticket->descricao,
                'statusTicket' => $this->ticket->statusTicket,
                'prioridade' => $this->ticket->prioridade,
                'dataAbertura' => $this->ticket->dataAbertura,
                'dataFechamento' => $this->ticket->dataFechamento
            ]
        ]);
    }

    public function store()
    {
        $body = $this->body();

        $camposObrigatorios = [
            'idTecnico',
            'idUsuario',
            'idCategoria',
            'idSLA',
            'titulo',
            'descricao',
            'prioridade'
        ];

        if ($this->missing($body, $camposObrigatorios)) {
            $this->respond([
                'erro' => 'Técnico, usuário, categoria, SLA, título, descrição e prioridade são obrigatórios.'
            ], 400);

            return;
        }

        if (!$this->idsDoCorpoValidos($body, [
            'idTecnico',
            'idUsuario',
            'idCategoria',
            'idSLA'
        ])) {
            $this->respond([
                'erro' => 'Os identificadores informados devem ser números inteiros maiores que zero.'
            ], 400);

            return;
        }

        if (
            trim((string) $body['titulo']) === '' ||
            trim((string) $body['descricao']) === '' ||
            trim((string) $body['prioridade']) === ''
        ) {
            $this->respond([
                'erro' => 'Título, descrição e prioridade não podem ficar vazios.'
            ], 400);

            return;
        }

        $this->ticket->idTecnico = (int) $body['idTecnico'];
        $this->ticket->idUsuario = (int) $body['idUsuario'];
        $this->ticket->idCategoria = (int) $body['idCategoria'];
        $this->ticket->idSLA = (int) $body['idSLA'];
        $this->ticket->titulo = $body['titulo'];
        $this->ticket->descricao = $body['descricao'];
        $this->ticket->prioridade = $body['prioridade'];

        try {
            if ($this->ticket->create()) {
                $this->respond([
                    'mensagem' => 'Ticket criado com sucesso.',
                    'idTicket' => (int) $this->ticket->idTicket
                ], 201);

                return;
            }

            $this->respond([
                'erro' => 'Não foi possível criar o ticket.'
            ], 500);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'Não foi possível criar o ticket. Verifique os dados relacionados.'
            ], 409);
        }
    }

    public function update($id)
    {
        if (!$this->idValido($id)) {
            $this->respond(['erro' => 'ID do ticket inválido.'], 400);
            return;
        }

        $body = $this->body();

        if (empty($body)) {
            $this->respond([
                'erro' => 'Nenhum dado foi enviado para atualização.'
            ], 400);

            return;
        }

        $camposPermitidos = [
            'titulo',
            'descricao',
            'statusTicket',
            'prioridade',
            'idTecnico',
            'idUsuario',
            'idCategoria',
            'idSLA'
        ];

        $camposRecebidos = array_intersect(
            array_keys($body),
            $camposPermitidos
        );

        if (empty($camposRecebidos)) {
            $this->respond([
                'erro' => 'Nenhum campo válido foi enviado para atualização.'
            ], 400);

            return;
        }

        $camposTexto = [
            'titulo',
            'descricao',
            'statusTicket',
            'prioridade'
        ];

        foreach ($camposTexto as $campo) {
            if (
                array_key_exists($campo, $body) &&
                trim((string) $body[$campo]) === ''
            ) {
                $this->respond([
                    'erro' => "O campo {$campo} não pode ficar vazio."
                ], 400);

                return;
            }
        }

        $camposId = [
            'idTecnico',
            'idUsuario',
            'idCategoria',
            'idSLA'
        ];

        foreach ($camposId as $campo) {
            if (
                array_key_exists($campo, $body) &&
                !$this->idValido($body[$campo])
            ) {
                $this->respond([
                    'erro' => "O campo {$campo} deve ser um número inteiro maior que zero."
                ], 400);

                return;
            }
        }

        $ticketExistente = new Ticket($this->db);
        $ticketExistente->idTicket = (int) $id;

        if (!$ticketExistente->getById()) {
            $this->respond(['erro' => 'Ticket não encontrado.'], 404);
            return;
        }

        $this->ticket->idTicket = (int) $id;

        if (array_key_exists('titulo', $body)) {
            $this->ticket->titulo = $body['titulo'];
        }

        if (array_key_exists('descricao', $body)) {
            $this->ticket->descricao = $body['descricao'];
        }

        if (array_key_exists('statusTicket', $body)) {
            $this->ticket->statusTicket = $body['statusTicket'];
        }

        if (array_key_exists('prioridade', $body)) {
            $this->ticket->prioridade = $body['prioridade'];
        }

        if (array_key_exists('idTecnico', $body)) {
            $this->ticket->idTecnico = (int) $body['idTecnico'];
        }

        if (array_key_exists('idUsuario', $body)) {
            $this->ticket->idUsuario = (int) $body['idUsuario'];
        }

        if (array_key_exists('idCategoria', $body)) {
            $this->ticket->idCategoria = (int) $body['idCategoria'];
        }

        if (array_key_exists('idSLA', $body)) {
            $this->ticket->idSLA = (int) $body['idSLA'];
        }

        try {
            if ($this->ticket->update()) {
                $this->respond([
                    'mensagem' => 'Ticket atualizado com sucesso.'
                ]);

                return;
            }

            $this->respond([
                'erro' => 'Não foi possível atualizar o ticket.'
            ], 500);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'Não foi possível atualizar o ticket. Verifique os dados relacionados.'
            ], 409);
        }
    }

    public function destroy($id)
    {
        if (!$this->idValido($id)) {
            $this->respond(['erro' => 'ID do ticket inválido.'], 400);
            return;
        }

        $ticketExistente = new Ticket($this->db);
        $ticketExistente->idTicket = (int) $id;

        if (!$ticketExistente->getById()) {
            $this->respond(['erro' => 'Ticket não encontrado.'], 404);
            return;
        }

        $this->ticket->idTicket = (int) $id;

        try {
            if ($this->ticket->delete()) {
                $this->respond([
                    'mensagem' => 'Ticket removido com sucesso.'
                ]);

                return;
            }

            $this->respond([
                'erro' => 'Não foi possível remover o ticket.'
            ], 500);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'O ticket possui registros vinculados e não pode ser removido.'
            ], 409);
        }
    }

    private function idValido($id)
    {
        return filter_var(
            $id,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        ) !== false;
    }

    private function idsDoCorpoValidos(array $body, array $campos)
    {
        foreach ($campos as $campo) {
            if (
                !array_key_exists($campo, $body) ||
                !$this->idValido($body[$campo])
            ) {
                return false;
            }
        }

        return true;
    }
}