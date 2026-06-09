<?php

class Categoria
{
    private $conn;
    private $tabela = "Categoria";

    public $idCategoria;
    public $nomeCategoria;
    public $descricao;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Listar todas as categorias
    public function getAll()
    {
        $query = "
            SELECT idCategoria, nomeCategoria, descricao
            FROM " . $this->tabela . "
            ORDER BY nomeCategoria ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar categoria por ID
    public function getById()
    {
        $query = "
            SELECT idCategoria, nomeCategoria, descricao
            FROM " . $this->tabela . "
            WHERE idCategoria = :idCategoria
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idCategoria', $this->idCategoria, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $this->nomeCategoria = $row['nomeCategoria'];
        $this->descricao     = $row['descricao'];

        return true;
    }

    // Criar categoria
    public function create()
    {
        if ($this->existePorNome()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (nomeCategoria, descricao)
            VALUES (:nomeCategoria, :descricao)
        ";

        $stmt = $this->conn->prepare($query);

        $this->nomeCategoria = htmlspecialchars(strip_tags($this->nomeCategoria));
        $this->descricao     = htmlspecialchars(strip_tags($this->descricao));

        $stmt->bindParam(':nomeCategoria', $this->nomeCategoria);
        $stmt->bindParam(':descricao',     $this->descricao);

        if ($stmt->execute()) {
            $this->idCategoria = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Atualizar categoria
    public function update()
    {
        $query = "
            UPDATE " . $this->tabela . "
            SET nomeCategoria = :nomeCategoria,
                descricao     = :descricao
            WHERE idCategoria = :idCategoria
        ";

        $stmt = $this->conn->prepare($query);

        $this->nomeCategoria = htmlspecialchars(strip_tags($this->nomeCategoria));
        $this->descricao     = htmlspecialchars(strip_tags($this->descricao));

        $stmt->bindParam(':nomeCategoria', $this->nomeCategoria);
        $stmt->bindParam(':descricao',     $this->descricao);
        $stmt->bindParam(':idCategoria',   $this->idCategoria, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Deletar categoria (só permite se não houver tickets vinculados)
    public function delete()
    {
        if ($this->temTicketsVinculados()) {
            return false;
        }

        $query = "DELETE FROM " . $this->tabela . " WHERE idCategoria = :idCategoria";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idCategoria', $this->idCategoria, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Verifica se já existe uma categoria com o mesmo nome
    private function existePorNome()
    {
        $query = "
            SELECT idCategoria FROM " . $this->tabela . "
            WHERE nomeCategoria = :nomeCategoria
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nomeCategoria', $this->nomeCategoria);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // Verifica se existem tickets usando esta categoria (impede delete)
    private function temTicketsVinculados()
    {
        $query = "SELECT idTicket FROM Ticket WHERE idCategoria = :idCategoria LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idCategoria', $this->idCategoria, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
}