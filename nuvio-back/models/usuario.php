<?php

class Usuario
{
    private $db;
    public $idUsuario;
    public $idtipoUsuario;
    public $nome;
    public $email;
    public $senhaHash;
    public $cargo;
    public $setor;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function buscarPorEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM usuario WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch();
        if ($result) {
            $this->mapUsuario($result);
        }
        return $result ?: null;
    }

    public function buscarPorId($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM usuario WHERE idusuario = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        if ($result) {
            $this->mapUsuario($result);
        }
        return $result ?: null;
    }

    public function criar()
    {
        $stmt = $this->db->prepare(
            "INSERT INTO usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor)
             VALUES (?, ?, ?, ?, ?, ?)
             RETURNING idusuario"
        );
        $result = $stmt->execute([
            $this->idtipoUsuario,
            $this->nome,
            $this->email,
            $this->senhaHash,
            $this->cargo,
            $this->setor
        ]);
        if ($result) {
            $this->idUsuario = $stmt->fetch(PDO::FETCH_ASSOC)['idusuario'];
        }
        return $result;
    }

    public function emailExiste($email)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM usuario WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }

    private function mapUsuario($row)
    {
        $this->idUsuario = $row['idusuario'] ?? null;
        $this->idtipoUsuario = $row['idtipoUsuario'] ?? $row['idtipousuario'] ?? null;
        $this->nome = $row['nome'] ?? null;
        $this->email = $row['email'] ?? null;
        $this->senhaHash = $row['senhaHash'] ?? $row['senhahash'] ?? null;
        $this->cargo = $row['cargo'] ?? null;
        $this->setor = $row['setor'] ?? null;
    }
}