<?php

class TipoUsuario
{
    private $conn;
    private $tabela = "tipoUsuario";

    public $idtipoUsuario;
    public $descricao;

    // Valores permitidos pelo CHECK do banco
    private $tiposPermitidos = ['Cliente', 'Técnico', 'Administrador'];

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Listar todos os tipos
    public function getAll()
    {
        $query = "
            SELECT idtipoUsuario, descricao
            FROM " . $this->tabela . "
            ORDER BY idtipoUsuario ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar tipo por ID
    public function getById()
    {
        $query = "
            SELECT idtipoUsuario, descricao
            FROM " . $this->tabela . "
            WHERE idtipoUsuario = :idtipoUsuario
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idtipoUsuario', $this->idtipoUsuario, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $this->descricao = $row['descricao'];

        return true;
    }

    // Criar tipo (respeitando o CHECK do banco)
    public function create()
    {
        if (!$this->descricaoValida()) {
            return false;
        }

        if ($this->existePorDescricao()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (descricao)
            VALUES (:descricao)
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':descricao', $this->descricao);

        if ($stmt->execute()) {
            $this->idtipoUsuario = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // TipoUsuario não deve ser editado nem deletado pois impacta toda a lógica do sistema.
    // Os três tipos (Cliente, Técnico, Administrador) são fixos e devem ser populados via seed.

    // Verifica se a descricao está entre os valores permitidos pelo CHECK
    private function descricaoValida()
    {
        return in_array($this->descricao, $this->tiposPermitidos);
    }

    // Evita duplicata (o banco já tem UNIQUE implícito pelo CHECK, mas validamos antes)
    private function existePorDescricao()
    {
        $query = "
            SELECT idtipoUsuario FROM " . $this->tabela . "
            WHERE descricao = :descricao
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':descricao', $this->descricao);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
}