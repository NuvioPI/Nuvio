<?php

class SLA
{
    private $conn;
    private $tabela = "SLA";
    public $idSLA;
    public $nomeSLA;
    public $tempoResposta;
    public $tempoResolucao;
    public $descricao;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Listar todos os SLAs
    public function getAll()
    {
        $query = "
            SELECT idSLA, nomeSLA, tempoResposta, tempoResolucao, descricao
            FROM " . $this->tabela . "
            ORDER BY tempoResolucao ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar SLA por ID
    public function getById()
    {
        $query = "
            SELECT idSLA, nomeSLA, tempoResposta, tempoResolucao, descricao
            FROM " . $this->tabela . "
            WHERE idSLA = :idSLA
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idSLA', $this->idSLA, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $this->nomeSLA       = $row['nomeSLA'];
        $this->tempoResposta = $row['tempoResposta'];
        $this->tempoResolucao= $row['tempoResolucao'];
        $this->descricao     = $row['descricao'];

        return true;
    }

    // Criar SLA
    public function create()
    {
        if ($this->existePorNome()) {
            return false;
        }

        if (!$this->temposValidos()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (nomeSLA, tempoResposta, tempoResolucao, descricao)
            VALUES (:nomeSLA, :tempoResposta, :tempoResolucao, :descricao)
        ";

        $stmt = $this->conn->prepare($query);

        $this->nomeSLA   = htmlspecialchars(strip_tags($this->nomeSLA));
        $this->descricao = htmlspecialchars(strip_tags($this->descricao));

        $stmt->bindParam(':nomeSLA',        $this->nomeSLA);
        $stmt->bindParam(':tempoResposta',  $this->tempoResposta,  PDO::PARAM_INT);
        $stmt->bindParam(':tempoResolucao', $this->tempoResolucao, PDO::PARAM_INT);
        $stmt->bindParam(':descricao',      $this->descricao);

        if ($stmt->execute()) {
            $this->idSLA = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Atualizar SLA
    public function update()
    {
        if (!$this->temposValidos()) {
            return false;
        }

        $query = "
            UPDATE " . $this->tabela . "
            SET nomeSLA        = :nomeSLA,
                tempoResposta  = :tempoResposta,
                tempoResolucao = :tempoResolucao,
                descricao      = :descricao
            WHERE idSLA = :idSLA
        ";

        $stmt = $this->conn->prepare($query);

        $this->nomeSLA   = htmlspecialchars(strip_tags($this->nomeSLA));
        $this->descricao = htmlspecialchars(strip_tags($this->descricao));

        $stmt->bindParam(':nomeSLA',        $this->nomeSLA);
        $stmt->bindParam(':tempoResposta',  $this->tempoResposta,  PDO::PARAM_INT);
        $stmt->bindParam(':tempoResolucao', $this->tempoResolucao, PDO::PARAM_INT);
        $stmt->bindParam(':descricao',      $this->descricao);
        $stmt->bindParam(':idSLA',          $this->idSLA,          PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Deletar SLA (bloqueia se houver tickets vinculados)
    public function delete()
    {
        if ($this->temTicketsVinculados()) {
            return false;
        }

        $query = "DELETE FROM " . $this->tabela . " WHERE idSLA = :idSLA";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idSLA', $this->idSLA, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Verifica se tempoResposta < tempoResolucao (regra de negócio)
    private function temposValidos()
    {
        return (int)$this->tempoResposta > 0
            && (int)$this->tempoResolucao > 0
            && (int)$this->tempoResposta < (int)$this->tempoResolucao;
    }

    // Verifica nome duplicado
    private function existePorNome()
    {
        $query = "
            SELECT idSLA FROM " . $this->tabela . "
            WHERE nomeSLA = :nomeSLA
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nomeSLA', $this->nomeSLA);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // Verifica se existem tickets usando este SLA (impede delete)
    private function temTicketsVinculados()
    {
        $query = "SELECT idTicket FROM Ticket WHERE idSLA = :idSLA LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idSLA', $this->idSLA, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
}