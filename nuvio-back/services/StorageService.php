<?php

require_once __DIR__ . '/../config/env.php';

class StorageService
{
    private string $uploadDir;
    private string $avatarsDir;
    private string $anexosDir;
    private string $baseUrl;

    private array $extensoesImagem = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    private array $mimesImagem = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    private array $extensoesAnexo = [
        'jpg', 'jpeg', 'png', 'webp', 'gif',
        'pdf', 'doc', 'docx', 'xls', 'xlsx',
        'txt', 'csv', 'zip', 'rar'
    ];

    public function __construct()
    {
        $this->uploadDir = __DIR__ . '/../public/uploads';
        $this->avatarsDir = $this->uploadDir . '/avatars';
        $this->anexosDir = $this->uploadDir . '/anexos';

        // Garante que as pastas do bucket existam
        $this->garantirDiretorios();

        $this->baseUrl = $this->obterBaseUrl();
    }

    /**
     * Salva uma foto de perfil no bucket de avatares
     *
     * @param array $file $_FILES['foto']
     * @param int|null $idUsuario
     * @return array [sucesso => bool, url => string, caminho => string, erro => string]
     */
    public function salvarFotoPerfil(array $file, ?int $idUsuario = null): array
    {
        if (empty($file) || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return [
                'sucesso' => false,
                'erro' => $this->obterMensagemErroUpload($file['error'] ?? UPLOAD_ERR_NO_FILE)
            ];
        }

        // Limite de 10MB para imagens
        $maxTamanho = 10 * 1024 * 1024;
        if ($file['size'] > $maxTamanho) {
            return [
                'sucesso' => false,
                'erro' => 'A imagem excede o tamanho máximo permitido de 10MB.'
            ];
        }

        $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extensao, $this->extensoesImagem, true)) {
            return [
                'sucesso' => false,
                'erro' => 'Formato de imagem inválido. Formatos suportados: JPG, PNG, WEBP e GIF.'
            ];
        }

        // Validação rigorosa de MIME Type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $this->mimesImagem, true)) {
            return [
                'sucesso' => false,
                'erro' => 'O arquivo enviado não é uma imagem válida.'
            ];
        }

        // Nome único e seguro para o bucket
        $sufixo = bin2hex(random_bytes(6));
        $prefixo = $idUsuario ? "usr_{$idUsuario}_" : "avatar_";
        $nomeArquivo = $prefixo . time() . "_{$sufixo}." . $extensao;

        $destinoLocal = $this->avatarsDir . '/' . $nomeArquivo;

        if (!move_uploaded_file($file['tmp_name'], $destinoLocal)) {
            return [
                'sucesso' => false,
                'erro' => 'Falha ao salvar a imagem no bucket local.'
            ];
        }

        // Caminho relativo a partir de public
        $caminhoRelativo = '/uploads/avatars/' . $nomeArquivo;
        $urlPublica = $this->baseUrl . $caminhoRelativo;

        return [
            'sucesso' => true,
            'url' => $urlPublica,
            'caminho' => $caminhoRelativo,
            'nomeArquivo' => $nomeArquivo,
            'tamanho' => $file['size'],
            'mime' => $mime,
        ];
    }

    /**
     * Salva um anexo de ticket no bucket de anexos
     *
     * @param array $file $_FILES['arquivo']
     * @param int $idTicket
     * @return array [sucesso => bool, url => string, caminho => string, erro => string]
     */
    public function salvarAnexoTicket(array $file, int $idTicket): array
    {
        if (empty($file) || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return [
                'sucesso' => false,
                'erro' => $this->obterMensagemErroUpload($file['error'] ?? UPLOAD_ERR_NO_FILE)
            ];
        }

        // Limite de 25MB para anexos
        $maxTamanho = 25 * 1024 * 1024;
        if ($file['size'] > $maxTamanho) {
            return [
                'sucesso' => false,
                'erro' => 'O arquivo excede o limite máximo permitido de 25MB.'
            ];
        }

        $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extensao, $this->extensoesAnexo, true)) {
            return [
                'sucesso' => false,
                'erro' => 'Extensão de arquivo não permitida para anexo.'
            ];
        }

        $sufixo = bin2hex(random_bytes(6));
        $nomeLimpoOriginal = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
        $nomeArquivo = "tkt_{$idTicket}_" . time() . "_{$nomeLimpoOriginal}_{$sufixo}." . $extensao;

        $destinoLocal = $this->anexosDir . '/' . $nomeArquivo;

        if (!move_uploaded_file($file['tmp_name'], $destinoLocal)) {
            return [
                'sucesso' => false,
                'erro' => 'Falha ao salvar o anexo no bucket.'
            ];
        }

        $caminhoRelativo = '/uploads/anexos/' . $nomeArquivo;
        $urlPublica = $this->baseUrl . $caminhoRelativo;

        return [
            'sucesso' => true,
            'url' => $urlPublica,
            'caminho' => $caminhoRelativo,
            'nomeOriginal' => $file['name'],
            'nomeArquivo' => $nomeArquivo,
            'tamanho' => $file['size'],
            'tipoArquivo' => $file['type'] ?? $extensao,
        ];
    }

    /**
     * Remove um arquivo do bucket
     */
    public function removerArquivo(string $caminhoRelativo): bool
    {
        $caminhoLimpo = ltrim($caminhoRelativo, '/');
        // Previne Directory Traversal
        if (str_contains($caminhoLimpo, '..')) {
            return false;
        }

        $caminhoAbsoluto = __DIR__ . '/../public/' . $caminhoLimpo;
        if (file_exists($caminhoAbsoluto) && is_file($caminhoAbsoluto)) {
            return unlink($caminhoAbsoluto);
        }

        return false;
    }

    private function garantirDiretorios(): void
    {
        if (!is_dir($this->uploadDir)) {
            @mkdir($this->uploadDir, 0755, true);
        }
        if (!is_dir($this->avatarsDir)) {
            @mkdir($this->avatarsDir, 0755, true);
        }
        if (!is_dir($this->anexosDir)) {
            @mkdir($this->anexosDir, 0755, true);
        }
    }

    private function obterBaseUrl(): string
    {
        $appUrl = env('APP_URL');
        if ($appUrl) {
            return rtrim($appUrl, '/');
        }

        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443 ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        return rtrim($protocol . $host, '/');
    }

    private function obterMensagemErroUpload(int $codigoErro): string
    {
        return match ($codigoErro) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'O arquivo é maior do que o permitido pelo servidor.',
            UPLOAD_ERR_PARTIAL => 'O upload do arquivo foi feito apenas parcialmente.',
            UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado.',
            UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária ausente no servidor.',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao gravar arquivo em disco.',
            UPLOAD_ERR_EXTENSION => 'Upload interrompido por extensão do PHP.',
            default => 'Erro desconhecido durante o upload do arquivo.'
        };
    }
}
