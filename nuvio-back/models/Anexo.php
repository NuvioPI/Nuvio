<?php

class Anexo
{
    private $conn;
    private $tabela = "anexo";

    public $idAnexo;
    public $idTicket;
    public $nomeArquivo;
    public $caminhoArquivo;

    // Extensões permitidas para upload
    private $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'];

    // Tamanho máximo em bytes (5MB)
    private $tamanhoMaximo = 5242880;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Listar todos os anexos de um ticket
    public function getByTicket()
    {
        $query = "
            SELECT idAnexo, idTicket, nomeArquivo, caminhoArquivo
            FROM " . $this->tabela . "
            WHERE idTicket = :idTicket
            ORDER BY idAnexo ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // Buscar anexo por ID
    public function getById()
    {
        $query = "
            SELECT idAnexo, idTicket, nomeArquivo, caminhoArquivo
            FROM " . $this->tabela . "
            WHERE idAnexo = :idAnexo
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idAnexo', $this->idAnexo, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $this->idTicket       = $row['idTicket'];
        $this->nomeArquivo    = $row['nomeArquivo'];
        $this->caminhoArquivo = $row['caminhoArquivo'];

        return true;
    }

    // Salvar registro do anexo no banco após o upload do arquivo
    public function create()
    {
        if (!$this->nomeArquivo || !$this->caminhoArquivo) {
            return false;
        }

        if (!$this->extensaoPermitida()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (idTicket, nomeArquivo, caminhoArquivo)
            VALUES (:idTicket, :nomeArquivo, :caminhoArquivo)
        ";

        $stmt = $this->conn->prepare($query);

        $this->nomeArquivo    = htmlspecialchars(strip_tags($this->nomeArquivo));
        $this->caminhoArquivo = htmlspecialchars(strip_tags($this->caminhoArquivo));

        $stmt->bindParam(':idTicket',       $this->idTicket,       PDO::PARAM_INT);
        $stmt->bindParam(':nomeArquivo',    $this->nomeArquivo);
        $stmt->bindParam(':caminhoArquivo', $this->caminhoArquivo);

        if ($stmt->execute()) {
            $this->idAnexo = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Deletar registro do banco (o controller deve apagar o arquivo físico também)
    public function delete()
    {
        $query = "DELETE FROM " . $this->tabela . " WHERE idAnexo = :idAnexo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idAnexo', $this->idAnexo, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Deletar todos os anexos de um ticket (usado ao deletar o ticket)
    public function deleteByTicket()
    {
        $query = "DELETE FROM " . $this->tabela . " WHERE idTicket = :idTicket";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Processar upload do arquivo e retornar caminho salvo
    public function upload(array $arquivo, string $pastaDestino)
    {
        if ($arquivo['error'] !== UPLOAD_ERR_OK) {
            return false;
        }

        if ($arquivo['size'] > $this->tamanhoMaximo) {
            return false;
        }

        $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));

        if (!in_array($extensao, $this->extensoesPermitidas)) {
            return false;
        }

        // Gera nome único para evitar colisões no servidor
        $nomeUnico = uniqid('anexo_', true) . '.' . $extensao;
        $caminho   = rtrim($pastaDestino, '/') . '/' . $nomeUnico;

        if (!move_uploaded_file($arquivo['tmp_name'], $caminho)) {
            return false;
        }

        $this->nomeArquivo    = basename($arquivo['name']);
        $this->caminhoArquivo = $caminho;

        return true;
    }

    // Verifica se a extensão do arquivo está na lista permitida
    private function extensaoPermitida()
    {
        $extensao = strtolower(pathinfo($this->nomeArquivo, PATHINFO_EXTENSION));
        return in_array($extensao, $this->extensoesPermitidas);
    }
}