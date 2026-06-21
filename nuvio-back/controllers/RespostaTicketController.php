<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/RespostaTicket.php';

class RespostaTicketController extends BaseController
{
    private $resposta;

    public function __construct()
    {
        parent::__construct();
        $this->resposta = new RespostaTicket($this->db);
    }

    public function index()
    {
        if (!isset($_GET['idTicket'])) {
            $this->respond(['erro' => 'Informe idTicket para listar as respostas.'], 400);
            return;
        }

        $this->resposta->idTicket = (int)$_GET['idTicket'];
        $this->respond(['respostas' => $this->rows($this->resposta->getByTicket())]);
    }

    public function show($id)
    {
        $this->resposta->idRespostaTicket = $id;

        if (!$this->resposta->getById()) {
            $this->respond(['erro' => 'Resposta não encontrada.'], 404);
            return;
        }

        $this->respond(['resposta' => $this->toArray()]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['idUsuario', 'idTicket', 'msgTicket'])) {
            $this->respond(['erro' => 'Usuário, ticket e mensagem são obrigatórios.'], 400);
            return;
        }

        $this->resposta->idUsuario = (int)$body['idUsuario'];
        $this->resposta->idTicket = (int)$body['idTicket'];
        $this->resposta->msgTicket = $body['msgTicket'];

        if ($this->resposta->create()) {
            $this->respond([
                'mensagem' => 'Resposta criada com sucesso.',
                'idRespostaTicket' => (int)$this->resposta->idRespostaTicket,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar a resposta. Verifique se o ticket está aberto.'], 409);
    }

    public function update($id)
    {
        $body = $this->body();

        if ($this->missing($body, ['idUsuario', 'msgTicket'])) {
            $this->respond(['erro' => 'Usuário e mensagem são obrigatórios.'], 400);
            return;
        }

        $this->resposta->idRespostaTicket = $id;
        $this->resposta->idUsuario = (int)$body['idUsuario'];
        $this->resposta->msgTicket = $body['msgTicket'];

        if ($this->resposta->update()) {
            $this->respond(['mensagem' => 'Resposta atualizada com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Resposta não encontrada ou não pertence ao usuário informado.'], 404);
    }

    public function destroy($id)
    {
        $this->resposta->idRespostaTicket = $id;

        if ($this->resposta->delete()) {
            $this->respond(['mensagem' => 'Resposta removida com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Resposta não encontrada.'], 404);
    }

    private function toArray()
    {
        return [
            'idRespostaTicket' => (int)$this->resposta->idRespostaTicket,
            'idUsuario' => (int)$this->resposta->idUsuario,
            'idTicket' => (int)$this->resposta->idTicket,
            'msgTicket' => $this->resposta->msgTicket,
            'dataResposta' => $this->resposta->dataResposta,
        ];
    }
}
