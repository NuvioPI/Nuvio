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
        $stmt = $this->db->prepare("SELECT * FROM Usuario WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function buscarPorId($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM Usuario WHERE idUsuario = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function criar()
    {
        $stmt = $this->db->prepare("INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor) VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $this->idtipoUsuario,
            $this->nome,
            $this->email,
            $this->senhaHash,
            $this->cargo,
            $this->setor
        ]);
    }

    public function emailExiste($email)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM Usuario WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }
}