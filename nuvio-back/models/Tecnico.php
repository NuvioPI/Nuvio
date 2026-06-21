<?php

class Tecnico
{
    private $conn;
    private $tabela = "Tecnico";

    public $idTecnico;
    public $idUsuario;
    public $especialidade;
    public $ativo;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function getAll()
    {
        $query = "
            SELECT
                t.idTecnico,
                t.idUsuario,
                t.especialidade,
                t.ativo,
                u.nome,
                u.email,
                u.cargo,
                u.setor
            FROM " . $this->tabela . " t
            INNER JOIN Usuario u ON t.idUsuario = u.idUsuario
            ORDER BY u.nome ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getAtivos()
    {
        $query = "
            SELECT
                t.idTecnico,
                t.especialidade,
                u.nome,
                u.email
            FROM " . $this->tabela . " t
            INNER JOIN Usuario u ON t.idUsuario = u.idUsuario
            WHERE t.ativo = TRUE
            ORDER BY u.nome ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById()
    {
        $query = "
            SELECT
                t.idTecnico,
                t.idUsuario,
                t.especialidade,
                t.ativo,
                u.nome,
                u.email,
                u.cargo,
                u.setor
            FROM " . $this->tabela . " t
            INNER JOIN Usuario u ON t.idUsuario = u.idUsuario
            WHERE t.idTecnico = :idTecnico
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTecnico', $this->idTecnico, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        foreach ($row as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }

        return true;
    }

    public function getByUsuario()
    {
        $query = "
            SELECT
                t.idTecnico,
                t.idUsuario,
                t.especialidade,
                t.ativo
            FROM " . $this->tabela . " t
            WHERE t.idUsuario = :idUsuario
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        foreach ($row as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }

        return true;
    }

    public function create()
    {
        if ($this->existePorUsuario()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (idUsuario, especialidade, ativo)
            VALUES (:idUsuario, :especialidade, TRUE)
        ";

        $stmt = $this->conn->prepare($query);

        $this->especialidade = htmlspecialchars(strip_tags($this->especialidade));

        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->bindParam(':especialidade', $this->especialidade);

        if ($stmt->execute()) {
            $this->idTecnico = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    public function update()
    {
        $query = "
            UPDATE " . $this->tabela . "
            SET especialidade = :especialidade
            WHERE idTecnico = :idTecnico
        ";

        $stmt = $this->conn->prepare($query);

        $this->especialidade = htmlspecialchars(strip_tags($this->especialidade));

        $stmt->bindParam(':especialidade', $this->especialidade);
        $stmt->bindParam(':idTecnico', $this->idTecnico, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function setAtivo(bool $status)
    {
        $query = "
            UPDATE " . $this->tabela . "
            SET ativo = :ativo
            WHERE idTecnico = :idTecnico
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ativo', $status, PDO::PARAM_BOOL);
        $stmt->bindParam(':idTecnico', $this->idTecnico, PDO::PARAM_INT);

        return $stmt->execute();
    }

    private function existePorUsuario()
    {
        $query = "SELECT idTecnico FROM " . $this->tabela . " WHERE idUsuario = :idUsuario LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
}