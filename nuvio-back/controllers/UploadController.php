<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/StorageService.php';
require_once __DIR__ . '/../models/usuario.php';
require_once __DIR__ . '/../models/Anexo.php';

class UploadController extends BaseController
{
    private StorageService $storage;
    private Usuario $usuario;
    private Anexo $anexo;

    public function __construct()
    {
        parent::__construct();
        $this->storage = new StorageService();
        $this->usuario = new Usuario($this->db);
        $this->anexo = new Anexo($this->db);
    }

    /**
     * POST /upload/foto
     * Upload de foto de perfil
     */
    public function uploadFotoPerfil(int $idUsuario): void
    {
        $file = $_FILES['foto'] ?? $_FILES['arquivo'] ?? $_FILES['image'] ?? null;

        if (!$file) {
            $this->respond([
                'sucesso' => false,
                'erro' => 'Nenhum arquivo de imagem foi enviado. Envie o arquivo no campo "foto".'
            ], 400);
            return;
        }

        // Busca dados atuais do usuário para remover avatar anterior se for local
        $usuarioAtual = $this->usuario->buscarPorId($idUsuario);
        if (!$usuarioAtual) {
            $this->respond([
                'sucesso' => false,
                'erro' => 'Usuário não encontrado.'
            ], 404);
            return;
        }

        $resultado = $this->storage->salvarFotoPerfil($file, $idUsuario);

        if (!$resultado['sucesso']) {
            $this->respond([
                'sucesso' => false,
                'erro' => $resultado['erro']
            ], 400);
            return;
        }

        $caminhoNovo = $resultado['caminho'];
        $urlPublica = $resultado['url'];

        // Atualiza apenas a foto no banco de dados MySQL
        if ($this->usuario->updateFotoPerfil($idUsuario, $caminhoNovo)) {
            // Remove avatar antigo local se existir
            $fotoAntiga = $usuarioAtual['fotoPerfil'] ?? $usuarioAtual['fotoperfil'] ?? '';
            if ($fotoAntiga && str_starts_with($fotoAntiga, '/uploads/avatars/')) {
                $this->storage->removerArquivo($fotoAntiga);
            }

            $this->respond([
                'sucesso' => true,
                'mensagem' => 'Foto de perfil atualizada com sucesso no bucket!',
                'url' => $urlPublica,
                'caminho' => $caminhoNovo,
                'fotoPerfil' => $caminhoNovo,
            ], 200);
            return;
        }

        // Se falhou ao gravar no banco, remove o arquivo recém-salvo
        $this->storage->removerArquivo($caminhoNovo);

        $this->respond([
            'sucesso' => false,
            'erro' => 'Não foi possível salvar o registro da foto no banco de dados.'
        ], 500);
    }

    /**
     * POST /upload/anexo
     * Upload de anexo para ticket
     */
    public function uploadAnexoTicket(int $idUsuario): void
    {
        $file = $_FILES['arquivo'] ?? $_FILES['file'] ?? $_FILES['anexo'] ?? null;
        $idTicket = (int) ($_POST['idTicket'] ?? 0);

        if (!$file) {
            $this->respond([
                'sucesso' => false,
                'erro' => 'Nenhum arquivo enviado.'
            ], 400);
            return;
        }

        if ($idTicket <= 0) {
            $this->respond([
                'sucesso' => false,
                'erro' => 'ID do Ticket é obrigatório.'
            ], 400);
            return;
        }

        $resultado = $this->storage->salvarAnexoTicket($file, $idTicket);

        if (!$resultado['sucesso']) {
            $this->respond([
                'sucesso' => false,
                'erro' => $resultado['erro']
            ], 400);
            return;
        }

        // Grava no banco de dados na tabela anexo
        $this->anexo->idTicket = $idTicket;
        $this->anexo->nomeArquivo = $resultado['nomeOriginal'];
        $this->anexo->caminhoArquivo = $resultado['caminho'];
        $this->anexo->tipoArquivo = $resultado['tipoArquivo'];
        $this->anexo->tamanhoArquivo = $resultado['tamanho'];

        if ($this->anexo->create()) {
            $this->respond([
                'sucesso' => true,
                'mensagem' => 'Anexo enviado com sucesso!',
                'idAnexo' => (int) $this->anexo->idAnexo,
                'nomeArquivo' => $resultado['nomeOriginal'],
                'url' => $resultado['url'],
                'caminho' => $resultado['caminho'],
            ], 201);
            return;
        }

        $this->storage->removerArquivo($resultado['caminho']);

        $this->respond([
            'sucesso' => false,
            'erro' => 'Não foi possível registrar o anexo no banco de dados.'
        ], 500);
    }
}
