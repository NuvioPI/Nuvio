<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/AvaliacaoTicket.php';

class AvaliacaoTicketController extends BaseController
{
    private $avaliacao;

    public function __construct()
    {
        parent::__construct();
        $this->avaliacao = new AvaliacaoTicket($this->db);
    }

    public function index()
    {
        if (isset($_GET['mediaPorTecnico']) && $_GET['mediaPorTecnico'] === '1') {
            $this->respond(['medias' => $this->rows($this->avaliacao->getMediaPorTecnico())]);
            return;
        }

        $this->respond(['avaliacoes' => $this->rows($this->avaliacao->getAll())]);
    }

    public function show($id)
    {
        $this->avaliacao->idTicket = $id;

        if (!$this->avaliacao->getByTicket()) {
            $this->respond(['erro' => 'Avaliação não encontrada para este ticket.'], 404);
            return;
        }

        $this->respond(['avaliacao' => $this->toArray()]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['idTicket', 'idUsuario', 'nota'])) {
            $this->respond(['erro' => 'Ticket, usuário e nota são obrigatórios.'], 400);
            return;
        }

        $this->fill($body);

        if ($this->avaliacao->create()) {
            $this->respond([
                'mensagem' => 'Avaliação criada com sucesso.',
                'idAvaliacaoTicket' => (int)$this->avaliacao->idAvaliacaoTicket,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível avaliar. Verifique nota, dono do ticket, status ou avaliação duplicada.'], 409);
    }

    public function update($id)
    {
        $body = $this->body();

        if ($this->missing($body, ['idUsuario', 'nota'])) {
            $this->respond(['erro' => 'Usuário e nota são obrigatórios.'], 400);
            return;
        }

        $this->avaliacao->idTicket = $id;
        $this->avaliacao->idUsuario = (int)$body['idUsuario'];
        $this->avaliacao->nota = (int)$body['nota'];
        $this->avaliacao->comentario = $body['comentario'] ?? '';

        if ($this->avaliacao->update()) {
            $this->respond(['mensagem' => 'Avaliação atualizada com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Avaliação não encontrada para o ticket e usuário informados.'], 404);
    }

    public function destroy($id)
    {
        $this->respond(['erro' => 'Remoção de avaliação não está disponível no model atual.'], 405);
    }

    private function fill(array $body)
    {
        $this->avaliacao->idTicket = (int)$body['idTicket'];
        $this->avaliacao->idUsuario = (int)$body['idUsuario'];
        $this->avaliacao->nota = (int)$body['nota'];
        $this->avaliacao->comentario = $body['comentario'] ?? '';
    }

    private function toArray()
    {
        return [
            'idAvaliacaoTicket' => (int)$this->avaliacao->idAvaliacaoTicket,
            'idTicket' => (int)$this->avaliacao->idTicket,
            'idUsuario' => (int)$this->avaliacao->idUsuario,
            'nota' => (int)$this->avaliacao->nota,
            'comentario' => $this->avaliacao->comentario,
            'dataAvaliacao' => $this->avaliacao->dataAvaliacao,
        ];
    }
}
