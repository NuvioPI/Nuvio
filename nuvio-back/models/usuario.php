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
        try {
            $stmt = $this->db->prepare("
                SELECT u.*, tu.descricao AS tipo
                FROM Usuario u
                LEFT JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
                WHERE u.email = ?
                LIMIT 1
            ");
            $stmt->execute([$email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result) {
                $this->mapUsuario($result);
                return $result;
            }
        } catch (PDOException $e) {
            try {
                $stmt = $this->db->prepare("SELECT * FROM Usuario WHERE email = ? LIMIT 1");
                $stmt->execute([$email]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $this->mapUsuario($result);
                    return $result;
                }
            } catch (PDOException $e2) {
                return null;
            }
        }
        return null;
    }

    public function buscarPorId($id)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT u.*, tu.descricao AS tipo
                FROM Usuario u
                LEFT JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
                WHERE u.idUsuario = ? OR u.idusuario = ?
                LIMIT 1
            ");
            $stmt->execute([(int)$id, (int)$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result) {
                $this->mapUsuario($result);
                return $result;
            }
        } catch (PDOException $e) {
            try {
                $stmt = $this->db->prepare("SELECT * FROM Usuario WHERE idUsuario = ? OR idusuario = ? LIMIT 1");
                $stmt->execute([(int)$id, (int)$id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $this->mapUsuario($result);
                    return $result;
                }
            } catch (PDOException $e2) {
                return null;
            }
        }
        return null;
    }

    public function criar()
    {
        $colunas = $this->colunasExistentes();
        $temTelefone  = in_array('telefone', $colunas);
        $temFotoPerfil = in_array('fotoPerfil', $colunas);

        if ($temTelefone && $temFotoPerfil) {
            $stmt = $this->db->prepare(
                'INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor, telefone, fotoPerfil)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $result = $stmt->execute([
                $this->idtipoUsuario, $this->nome, $this->email, $this->senhaHash,
                $this->cargo, $this->setor, $this->telefone, $this->fotoPerfil,
            ]);
        } elseif ($temTelefone) {
            $stmt = $this->db->prepare(
                'INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor, telefone)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $result = $stmt->execute([
                $this->idtipoUsuario, $this->nome, $this->email, $this->senhaHash,
                $this->cargo, $this->setor, $this->telefone,
            ]);
        } else {
            $stmt = $this->db->prepare(
                'INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $result = $stmt->execute([
                $this->idtipoUsuario, $this->nome, $this->email, $this->senhaHash,
                $this->cargo, $this->setor,
            ]);
        }

        if ($result) {
            $this->idUsuario = (int) $this->db->lastInsertId();
        }
        return $result;
    }

    public function getAll()
    {
        $colunas = $this->colunasExistentes();
        $extras  = '';
        if (in_array('telefone', $colunas))   $extras .= ', u.telefone';
        if (in_array('fotoPerfil', $colunas)) $extras .= ', u.fotoPerfil';

        $dataCadastro = in_array('dataCadastro', $colunas)
            ? 'u.dataCadastro'
            : 'NULL AS dataCadastro';

        $temAdministrador = $this->tabelaExiste('Administrador');
        $temClientePerfil = $this->tabelaExiste('ClientePerfil');
        $adminJoin = $temAdministrador
            ? 'LEFT JOIN Administrador a ON a.idUsuario = u.idUsuario'
            : '';
        $adminFields = $temAdministrador
            ? ', a.nivelAcesso, a.podeGerenciarUsuarios'
            : ', NULL AS nivelAcesso, 0 AS podeGerenciarUsuarios';
        $clienteJoin = $temClientePerfil
            ? 'LEFT JOIN ClientePerfil cp ON cp.idUsuario = u.idUsuario'
            : '';
        $verificado = $temClientePerfil
            ? 'COALESCE(cp.verificado, 0) AS verificado'
            : '0 AS verificado';

        $stmt = $this->db->prepare(
            "SELECT u.idUsuario, u.idtipoUsuario, u.nome, u.email, u.cargo, u.setor{$extras},
                    {$dataCadastro}, tu.descricao AS tipo{$adminFields}, {$verificado}
             FROM Usuario u
             LEFT JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
             {$adminJoin}
             {$clienteJoin}
             ORDER BY u.nome ASC"
        );
        $stmt->execute();
        return $stmt;
    }

    public function find($id)
    {
        return $this->buscarPorId($id);
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
        // Detecta quais colunas opcionais existem na tabela antes de atualizar.
        // Isso evita erros 500 em bancos que ainda não tenham telefone / fotoPerfil.
        $colunas = $this->colunasExistentes();

        $sets   = ['nome = ?', 'email = ?', 'cargo = ?', 'setor = ?'];
        $params = [$this->nome, $this->email, $this->cargo, $this->setor];

        if ($this->idtipoUsuario !== null) {
            $sets[] = 'idtipoUsuario = ?';
            $params[] = (int) $this->idtipoUsuario;
        }

        if (in_array('telefone', $colunas)) {
            $sets[]   = 'telefone = ?';
            $params[] = $this->telefone;
        }
        if (in_array('fotoPerfil', $colunas)) {
            $sets[]   = 'fotoPerfil = ?';
            $params[] = $this->fotoPerfil;
        }

        $params[] = (int) $this->idUsuario;

        $sql  = 'UPDATE Usuario SET ' . implode(', ', $sets) . ' WHERE idUsuario = ?';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /** Retorna lista dos nomes de colunas da tabela Usuario (cache por request). */
    private ?array $colunasCached = null;
    private function colunasExistentes(): array
    {
        if ($this->colunasCached !== null) {
            return $this->colunasCached;
        }
        try {
            $stmt = $this->db->query('SHOW COLUMNS FROM Usuario');
            $this->colunasCached = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
        } catch (PDOException $e) {
            $this->colunasCached = ['nome', 'email', 'cargo', 'setor'];
        }
        return $this->colunasCached;
    }

    private function tabelaExiste(string $tabela): bool
    {
        try {
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?'
            );
            $stmt->execute([$tabela]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            return false;
        }
    }

    public function updateSenha($senhaHash)
    {
        $stmt = $this->db->prepare('UPDATE Usuario SET senhaHash = ? WHERE idUsuario = ?');
        return $stmt->execute([$senhaHash, (int) $this->idUsuario]);
    }

    public function updateFotoPerfil(int $idUsuario, string $caminho): bool
    {
        $colunas = $this->colunasExistentes();
        if (!in_array('fotoPerfil', $colunas)) {
            // Coluna ainda não existe no banco — não há o que atualizar
            return false;
        }
        try {
            $stmt = $this->db->prepare('UPDATE Usuario SET fotoPerfil = ? WHERE idUsuario = ?');
            $stmt->execute([$caminho, $idUsuario]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            return false;
        }
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
        $this->idUsuario = $row['idusuario'] ?? $row['idUsuario'] ?? null;
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
