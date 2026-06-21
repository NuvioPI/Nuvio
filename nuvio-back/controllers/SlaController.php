<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/SLA.php';

class SLAController extends BaseController
{
    private $sla;

    public function __construct()
    {
        parent::__construct();
        $this->sla = new SLA($this->db);
    }

    public function index()
    {
        $this->respond(['slas' => $this->rows($this->sla->getAll())]);
    }

    public function show($id)
    {
        $this->sla->idSLA = $id;

        if (!$this->sla->getById()) {
            $this->respond(['erro' => 'SLA não encontrado.'], 404);
            return;
        }

        $this->respond(['sla' => [
            'idSLA' => (int)$this->sla->idSLA,
            'nomeSLA' => $this->sla->nomeSLA,
            'tempoResposta' => (int)$this->sla->tempoResposta,
            'tempoResolucao' => (int)$this->sla->tempoResolucao,
            'descricao' => $this->sla->descricao,
        ]]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['nomeSLA', 'tempoResposta', 'tempoResolucao', 'descricao'])) {
            $this->respond(['erro' => 'Nome, tempo de resposta, tempo de resolução e descrição são obrigatórios.'], 400);
            return;
        }

        $this->fill($body);

        if ($this->sla->create()) {
            $this->respond([
                'mensagem' => 'SLA criado com sucesso.',
                'idSLA' => (int)$this->sla->idSLA,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar o SLA. Verifique nome duplicado e tempos informados.'], 409);
    }

    public function update($id)
    {
        $body = $this->body();

        if ($this->missing($body, ['nomeSLA', 'tempoResposta', 'tempoResolucao', 'descricao'])) {
            $this->respond(['erro' => 'Nome, tempo de resposta, tempo de resolução e descrição são obrigatórios.'], 400);
            return;
        }

        $this->sla->idSLA = $id;
        $this->fill($body);

        if ($this->sla->update()) {
            $this->respond(['mensagem' => 'SLA atualizado com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível atualizar o SLA. Verifique os tempos informados.'], 400);
    }

    public function destroy($id)
    {
        $this->sla->idSLA = $id;

        if ($this->sla->delete()) {
            $this->respond(['mensagem' => 'SLA removido com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'SLA não encontrado ou possui tickets vinculados.'], 409);
    }

    private function fill(array $body)
    {
        $this->sla->nomeSLA = $body['nomeSLA'];
        $this->sla->tempoResposta = (int)$body['tempoResposta'];
        $this->sla->tempoResolucao = (int)$body['tempoResolucao'];
        $this->sla->descricao = $body['descricao'];
    }
}
