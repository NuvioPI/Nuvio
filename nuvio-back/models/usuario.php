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
    public $telefone;
    public $fotoPerfil;
    public $dataCadastro;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function buscarPorEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM Usuario WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch();
        if ($result) {
            $this->mapUsuario($result);
        }
        return $result ?: null;
    }

    public function buscarPorId($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM Usuario WHERE idUsuario = ?");
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
            "INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor)
             VALUES (?, ?, ?, ?, ?, ?)"
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
            $this->idUsuario = (int) $this->db->lastInsertId();
        }
        return $result;
    }

    public function getAll()
    {
        $stmt = $this->db->prepare(
            'SELECT u.idUsuario, u.idtipoUsuario, u.nome, u.email, u.cargo, u.setor,
                    tu.descricao AS tipo
             FROM Usuario u
             INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
             ORDER BY u.nome ASC'
        );
        $stmt->execute();
        return $stmt;
    }

    public function find($id)
    {
        $stmt = $this->db->prepare(
            'SELECT u.idUsuario, u.idtipoUsuario, u.nome, u.email, u.cargo, u.setor,
                    tu.descricao AS tipo
             FROM Usuario u
             INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
             WHERE u.idUsuario = ?
             LIMIT 1'
        );
        $stmt->execute([(int) $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function get()
    {
        $usuario = $this->find($this->idUsuario);
        if (!$usuario) {
            return false;
        }

        $this->mapUsuario($usuario);
        return true;
    }

    public function create()
    {
        return $this->criar();
    }

    public function update()
    {
        $stmt = $this->db->prepare(
            'UPDATE Usuario
             SET nome = ?, email = ?, cargo = ?, setor = ?
             WHERE idUsuario = ?'
        );

        return $stmt->execute([
            $this->nome,
            $this->email,
            $this->cargo,
            $this->setor,
            (int) $this->idUsuario,
        ]);
    }

    public function updateSenha($senhaHash)
    {
        $stmt = $this->db->prepare('UPDATE Usuario SET senhaHash = ? WHERE idUsuario = ?');
        return $stmt->execute([$senhaHash, (int) $this->idUsuario]);
    }

    public function delete()
    {
        $stmt = $this->db->prepare('DELETE FROM Usuario WHERE idUsuario = ?');
        $stmt->execute([(int) $this->idUsuario]);
        return $stmt->rowCount() > 0;
    }

    public function emailExiste($email)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM Usuario WHERE email = ?");
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
        $this->telefone = $row['telefone'] ?? null;
        $this->fotoPerfil = $row['fotoPerfil'] ?? $row['fotoperfil'] ?? null;
        $this->dataCadastro = $row['dataCadastro'] ?? $row['datacadastro'] ?? null;
    }
}
