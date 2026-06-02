<?php

class Usuario
{
    private $conn;
    private $tabela = "usuario";
    public $idUsuario;
    public $nome;
    public $email;
    public $senha;
    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }
    private function getIdValue()
    {
        return ($this->idUsuario !== null) ? $this->idUsuario : $this->idUsuario;
    }

    public function getall()
    {
        $query = "SELECT idUsuario AS idUsuario, nome, email, senha FROM " . $this->tabela;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function get()
    {
        $id = $this->getIdValue();
        if (!$id) {
            return false;
        }

        $query = "SELECT idUsuario AS idUsuario, nome, email, senha FROM " . $this->tabela . " WHERE idUsuario = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(1, $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $this->idUsuario = $row['idUsuario'];
        $this->nome = $row['nome'];
        $this->email = $row['email'];
        $this->senha = $row['senha'];

        return true;
    }

    public function find($id)
    {
        $query = "SELECT idUsuario AS idUsuario, nome, email, senha FROM " . $this->tabela . " WHERE idUsuario = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(1, $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create()
    {
        $query = "INSERT INTO " . $this->tabela . " (nome, email, senha) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $success = $stmt->execute(array($this->nome, $this->email, $this->senha));

        if ($success) {
            $this->idUsuario = $this->conn->lastInsertId();
            $this->idUsuario = $this->idUsuario;
        }

        return $success;
    }


    public function update()
    {
        // Query de atualização
        $query = 'UPDATE ' . $this->tabela . ' SET nome=:nome, email=:email, senha=:senha WHERE idUsuario=:id';

        // Preparar a query
        $stmt = $this->conn->prepare($query);

        // Limpar os dados
        $this->nome = htmlspecialchars(strip_tags($this->nome));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->senha = htmlspecialchars(strip_tags($this->senha));
        $this->idUsuario = htmlspecialchars(strip_tags($this->idUsuario));

        // Vincular os parâmetros
        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':senha', $this->senha);
        $stmt->bindParam(':id', $this->idUsuario);

        // Executar a query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

 public function delete() {

    $query = 'DELETE FROM ' . $this->tabela . ' WHERE idUsuario = :id';

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':id', $this->idUsuario);

    $stmt->execute();

    // Verifica se alguma linha foi afetada
    if($stmt->rowCount() > 0) {
        return true;
    }

    return false;
}


    public function add()
    {
        $query = "INSERT INTO " . $this->tabela . "
              SET
                nome = :nome,
                email = :email,
                senha = :senha";

        $stmt = $this->conn->prepare($query);

        $this->nome = htmlspecialchars(strip_tags($this->nome));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->senha = htmlspecialchars(strip_tags($this->senha));

        $stmt->bindParam(':nome', $this->nome);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':senha', $this->senha);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}