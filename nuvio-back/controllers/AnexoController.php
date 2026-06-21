<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Anexo.php';

class AnexoController extends BaseController
{
    private $anexo;

    public function __construct()
    {
        parent::__construct();
        $this->anexo = new Anexo($this->db);
    }

    public function index()
    {
        if (!isset($_GET['idTicket'])) {
            $this->respond(['erro' => 'Informe idTicket para listar os anexos.'], 400);
            return;
        }

        $this->anexo->idTicket = (int)$_GET['idTicket'];
        $this->respond(['anexos' => $this->rows($this->anexo->getByTicket())]);
    }

    public function show($id)
    {
        $this->anexo->idAnexo = $id;

        if (!$this->anexo->getById()) {
            $this->respond(['erro' => 'Anexo não encontrado.'], 404);
            return;
        }

        $this->respond(['anexo' => $this->toArray()]);
    }

    public function store()
    {
        if (!empty($_FILES['arquivo'])) {
            $this->storeUpload();
            return;
        }

        $body = $this->body();

        if ($this->missing($body, ['idTicket', 'nomeArquivo', 'caminhoArquivo'])) {
            $this->respond(['erro' => 'Ticket, nome do arquivo e caminho são obrigatórios.'], 400);
            return;
        }

        $this->anexo->idTicket = (int)$body['idTicket'];
        $this->anexo->nomeArquivo = $body['nomeArquivo'];
        $this->anexo->caminhoArquivo = $body['caminhoArquivo'];

        if ($this->anexo->create()) {
            $this->respond([
                'mensagem' => 'Anexo criado com sucesso.',
                'idAnexo' => (int)$this->anexo->idAnexo,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar o anexo. Verifique a extensão do arquivo.'], 400);
    }

    public function update($id)
    {
        $this->respond(['erro' => 'Atualização de anexo não está disponível no model atual.'], 405);
    }

    public function destroy($id)
    {
        $this->anexo->idAnexo = $id;

        if (!$this->anexo->getById()) {
            $this->respond(['erro' => 'Anexo não encontrado.'], 404);
            return;
        }

        $caminhoArquivo = $this->anexo->caminhoArquivo;

        if ($this->anexo->delete()) {
            if ($caminhoArquivo && is_file($caminhoArquivo)) {
                unlink($caminhoArquivo);
            }

            $this->respond(['mensagem' => 'Anexo removido com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível remover o anexo.'], 500);
    }

    private function storeUpload()
    {
        if (empty($_POST['idTicket'])) {
            $this->respond(['erro' => 'Ticket é obrigatório.'], 400);
            return;
        }

        $pastaDestino = __DIR__ . '/../uploads';

        if (!is_dir($pastaDestino)) {
            mkdir($pastaDestino, 0775, true);
        }

        $this->anexo->idTicket = (int)$_POST['idTicket'];

        if (!$this->anexo->upload($_FILES['arquivo'], $pastaDestino)) {
            $this->respond(['erro' => 'Upload inválido. Verifique tipo e tamanho do arquivo.'], 400);
            return;
        }

        if ($this->anexo->create()) {
            $this->respond([
                'mensagem' => 'Upload realizado com sucesso.',
                'idAnexo' => (int)$this->anexo->idAnexo,
                'anexo' => $this->toArray(),
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Upload realizado, mas não foi possível salvar o registro.'], 500);
    }

    private function toArray()
    {
        return [
            'idAnexo' => (int)$this->anexo->idAnexo,
            'idTicket' => (int)$this->anexo->idTicket,
            'nomeArquivo' => $this->anexo->nomeArquivo,
            'caminhoArquivo' => $this->anexo->caminhoArquivo,
        ];
    }
}
