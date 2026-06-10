<?php

class Usuario
{
    private $conn;
    private $tabela = "usuario";

    public $idUsuario;
    public $nome;
    public $email;
    public $senhaHash;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function getAll()
    {
        $query = "SELECT idUsuario, nome, email FROM " . $this->tabela;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function get()
    {
        if (!$this->idUsuario) return false;

        $query = "SELECT idUsuario, nome, email FROM " . $this->tabela . " WHERE idUsuario = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->idUsuario]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) return false;

        $this->idUsuario = $row['idUsuario'];
        $this->nome      = $row['nome'];
        $this->email     = $row['email'];

        return true;
    }

    public function find($id)
    {
        $query = "SELECT idUsuario, nome, email FROM " . $this->tabela . " WHERE idUsuario = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create()
    {
        $query = "INSERT INTO " . $this->tabela . " (nome, email, senhaHash) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        $this->nome  = htmlspecialchars(strip_tags($this->nome));
        $this->email = htmlspecialchars(strip_tags($this->email));
        // senhaHash não passa por htmlspecialchars — já vem como hash do password_hash()

        $success = $stmt->execute([$this->nome, $this->email, $this->senhaHash]);

        if ($success) {
            $this->idUsuario = $this->conn->lastInsertId();
        }

        return $success;
    }

    public function update()
    {
        $query = "UPDATE " . $this->tabela . " SET nome = ?, email = ? WHERE idUsuario = ?";
        $stmt = $this->conn->prepare($query);

        $this->nome  = htmlspecialchars(strip_tags($this->nome));
        $this->email = htmlspecialchars(strip_tags($this->email));

        return $stmt->execute([$this->nome, $this->email, $this->idUsuario]);
    }

    public function updateSenha($novaSenhaHash)
    {
        $query = "UPDATE " . $this->tabela . " SET senhaHash = ? WHERE idUsuario = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$novaSenhaHash, $this->idUsuario]);
    }

    public function delete()
    {
        $query = "DELETE FROM " . $this->tabela . " WHERE idUsuario = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->idUsuario]);
        return $stmt->rowCount() > 0;
    }
}