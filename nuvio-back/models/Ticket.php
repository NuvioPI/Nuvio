<?php

class Ticket
{
    private $conn;
    private $tabela = 'Ticket';
    private ?array $colunasUsuarioCached = null;

    private function temColunaUsuario(string $coluna): bool
    {
        if ($this->colunasUsuarioCached === null) {
            try {
                $stmt = $this->conn->query('SHOW COLUMNS FROM Usuario');
                $this->colunasUsuarioCached = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
            } catch (PDOException $e) {
                $this->colunasUsuarioCached = [];
            }
        }
        return in_array($coluna, $this->colunasUsuarioCached, true);
    }

    public $idTicket;
    public $idTecnico;
    public $idUsuario;
    public $idCategoria;
    public $idSLA;
    public $titulo;
    public $descricao;
    public $statusTicket;
    public $prioridade;
    public $dataAbertura;
    public $dataFechamento;

    public $nomeUsuario;
    public $emailUsuario;
    public $nomeTecnico;
    public $nomeCategoria;
    public $nomeSLA;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function getAll()
    {
        $fotoSelect = $this->temColunaUsuario('fotoPerfil') ? ', u.fotoPerfil AS fotoPerfil' : ", NULL AS fotoPerfil";

        $query = "
            SELECT
                t.idTicket,
                t.idTecnico,
                t.idUsuario,
                t.idCategoria,
                t.idSLA,
                t.titulo,
                t.descricao,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                u.nome AS nomeUsuario,
                u.email AS emailUsuario
                {$fotoSelect},
                us.nome AS nomeTecnico,
                c.nomeCategoria,
                s.nomeSLA
            FROM {$this->tabela} t
            INNER JOIN Usuario u
                ON t.idUsuario = u.idUsuario
            INNER JOIN Tecnico tc
                ON t.idTecnico = tc.idTecnico
            INNER JOIN Usuario us
                ON tc.idUsuario = us.idUsuario
            INNER JOIN Categoria c
                ON t.idCategoria = c.idCategoria
            INNER JOIN SLA s
                ON t.idSLA = s.idSLA
            ORDER BY t.dataAbertura DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function getById()
    {
        $query = "
            SELECT
                t.idTicket,
                t.idTecnico,
                t.idUsuario,
                t.idCategoria,
                t.idSLA,
                t.titulo,
                t.descricao,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                u.nome AS nomeUsuario,
                u.email AS emailUsuario,
                us.nome AS nomeTecnico,
                c.nomeCategoria,
                s.nomeSLA,
                s.tempoResposta,
                s.tempoResolucao
            FROM {$this->tabela} t
            INNER JOIN Usuario u
                ON t.idUsuario = u.idUsuario
            INNER JOIN Tecnico tc
                ON t.idTecnico = tc.idTecnico
            INNER JOIN Usuario us
                ON tc.idUsuario = us.idUsuario
            INNER JOIN Categoria c
                ON t.idCategoria = c.idCategoria
            INNER JOIN SLA s
                ON t.idSLA = s.idSLA
            WHERE t.idTicket = :idTicket
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(
            ':idTicket',
            (int) $this->idTicket,
            PDO::PARAM_INT
        );
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        foreach ($row as $campo => $valor) {
            if (property_exists($this, $campo)) {
                $this->$campo = $valor;
            }
        }

        return true;
    }

    public function getByUsuario()
    {
        $query = "
            SELECT
                t.idTicket,
                t.idTecnico,
                t.idUsuario,
                t.idCategoria,
                t.idSLA,
                t.titulo,
                t.descricao,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                c.nomeCategoria,
                s.nomeSLA
            FROM {$this->tabela} t
            INNER JOIN Categoria c
                ON t.idCategoria = c.idCategoria
            INNER JOIN SLA s
                ON t.idSLA = s.idSLA
            WHERE t.idUsuario = :idUsuario
            ORDER BY t.dataAbertura DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(
            ':idUsuario',
            (int) $this->idUsuario,
            PDO::PARAM_INT
        );
        $stmt->execute();

        return $stmt;
    }

    public function getByTecnico()
    {
        $query = "
            SELECT
                t.idTicket,
                t.idTecnico,
                t.idUsuario,
                t.idCategoria,
                t.idSLA,
                t.titulo,
                t.descricao,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                u.nome AS nomeUsuario,
                c.nomeCategoria
            FROM {$this->tabela} t
            INNER JOIN Usuario u
                ON t.idUsuario = u.idUsuario
            INNER JOIN Categoria c
                ON t.idCategoria = c.idCategoria
            WHERE t.idTecnico = :idTecnico
            ORDER BY
                FIELD(t.prioridade, 'Alta', 'Media', 'Baixa'),
                t.dataAbertura ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(
            ':idTecnico',
            (int) $this->idTecnico,
            PDO::PARAM_INT
        );
        $stmt->execute();

        return $stmt;
    }

    public function create()
    {
        $query = "
            INSERT INTO {$this->tabela}
            (
                idTecnico,
                idUsuario,
                idCategoria,
                idSLA,
                titulo,
                descricao,
                statusTicket,
                prioridade,
                dataAbertura,
                dataFechamento
            )
            VALUES
            (
                :idTecnico,
                :idUsuario,
                :idCategoria,
                :idSLA,
                :titulo,
                :descricao,
                :statusTicket,
                :prioridade,
                NOW(),
                NULL
            )
        ";

        $this->titulo = $this->limparTexto($this->titulo);
        $this->descricao = $this->limparTexto($this->descricao);
        $this->prioridade = $this->limparTexto($this->prioridade);
        $this->statusTicket = 'Aberto';

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(
            ':idTecnico',
            (int) $this->idTecnico,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ':idUsuario',
            (int) $this->idUsuario,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ':idCategoria',
            (int) $this->idCategoria,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ':idSLA',
            (int) $this->idSLA,
            PDO::PARAM_INT
        );

        $stmt->bindValue(':titulo', $this->titulo, PDO::PARAM_STR);
        $stmt->bindValue(':descricao', $this->descricao, PDO::PARAM_STR);
        $stmt->bindValue(':statusTicket', $this->statusTicket, PDO::PARAM_STR);
        $stmt->bindValue(':prioridade', $this->prioridade, PDO::PARAM_STR);

        if (!$stmt->execute()) {
            return false;
        }

        $this->idTicket = (int) $this->conn->lastInsertId();

        return true;
    }

    public function update()
    {
        $campos = [];
        $parametros = [];

        if ($this->titulo !== null) {
            $this->titulo = $this->limparTexto($this->titulo);

            $campos[] = 'titulo = :titulo';
            $parametros[':titulo'] = $this->titulo;
        }

        if ($this->descricao !== null) {
            $this->descricao = $this->limparTexto($this->descricao);

            $campos[] = 'descricao = :descricao';
            $parametros[':descricao'] = $this->descricao;
        }

        if ($this->statusTicket !== null) {
            $this->statusTicket = $this->limparTexto(
                $this->statusTicket
            );

            $campos[] = 'statusTicket = :statusTicket';
            $parametros[':statusTicket'] = $this->statusTicket;

            /*
             * Ao fechar, registra a data somente se ainda não existir.
             * Ao reabrir ou alterar para outro status, remove a data.
             */
            if (strcasecmp($this->statusTicket, 'Fechado') === 0) {
                $campos[] = '
                    dataFechamento = COALESCE(
                        dataFechamento,
                        NOW()
                    )
                ';
            } else {
                $campos[] = 'dataFechamento = NULL';
            }
        }

        if ($this->prioridade !== null) {
            $this->prioridade = $this->limparTexto(
                $this->prioridade
            );

            $campos[] = 'prioridade = :prioridade';
            $parametros[':prioridade'] = $this->prioridade;
        }

        if ($this->idTecnico !== null) {
            $campos[] = 'idTecnico = :idTecnico';
            $parametros[':idTecnico'] = (int) $this->idTecnico;
        }

        if ($this->idUsuario !== null) {
            $campos[] = 'idUsuario = :idUsuario';
            $parametros[':idUsuario'] = (int) $this->idUsuario;
        }

        if ($this->idCategoria !== null) {
            $campos[] = 'idCategoria = :idCategoria';
            $parametros[':idCategoria'] = (int) $this->idCategoria;
        }

        if ($this->idSLA !== null) {
            $campos[] = 'idSLA = :idSLA';
            $parametros[':idSLA'] = (int) $this->idSLA;
        }

        if (empty($campos)) {
            return false;
        }

        $query = "
            UPDATE {$this->tabela}
            SET " . implode(', ', $campos) . "
            WHERE idTicket = :idTicket
        ";

        $stmt = $this->conn->prepare($query);

        foreach ($parametros as $nome => $valor) {
            if (is_int($valor)) {
                $stmt->bindValue(
                    $nome,
                    $valor,
                    PDO::PARAM_INT
                );
            } else {
                $stmt->bindValue(
                    $nome,
                    $valor,
                    PDO::PARAM_STR
                );
            }
        }

        $stmt->bindValue(
            ':idTicket',
            (int) $this->idTicket,
            PDO::PARAM_INT
        );

        return $stmt->execute();
    }

    public function updateStatus()
    {
        $this->statusTicket = $this->limparTexto(
            $this->statusTicket
        );

        if (strcasecmp($this->statusTicket, 'Fechado') === 0) {
            $query = "
                UPDATE {$this->tabela}
                SET
                    statusTicket = :statusTicket,
                    dataFechamento = COALESCE(
                        dataFechamento,
                        NOW()
                    )
                WHERE idTicket = :idTicket
            ";
        } else {
            $query = "
                UPDATE {$this->tabela}
                SET
                    statusTicket = :statusTicket,
                    dataFechamento = NULL
                WHERE idTicket = :idTicket
            ";
        }

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(
            ':statusTicket',
            $this->statusTicket,
            PDO::PARAM_STR
        );

        $stmt->bindValue(
            ':idTicket',
            (int) $this->idTicket,
            PDO::PARAM_INT
        );

        return $stmt->execute();
    }

    public function fechar()
    {
        $query = "
            UPDATE {$this->tabela}
            SET
                statusTicket = 'Fechado',
                dataFechamento = COALESCE(
                    dataFechamento,
                    NOW()
                )
            WHERE idTicket = :idTicket
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(
            ':idTicket',
            (int) $this->idTicket,
            PDO::PARAM_INT
        );

        return $stmt->execute();
    }

    public function reatribuir()
    {
        $query = "
            UPDATE {$this->tabela}
            SET idTecnico = :idTecnico
            WHERE idTicket = :idTicket
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(
            ':idTecnico',
            (int) $this->idTecnico,
            PDO::PARAM_INT
        );

        $stmt->bindValue(
            ':idTicket',
            (int) $this->idTicket,
            PDO::PARAM_INT
        );

        return $stmt->execute();
    }

    public function delete()
    {
        $query = "
            DELETE FROM {$this->tabela}
            WHERE idTicket = :idTicket
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(
            ':idTicket',
            (int) $this->idTicket,
            PDO::PARAM_INT
        );

        if (!$stmt->execute()) {
            return false;
        }

        return $stmt->rowCount() > 0;
    }

    private function limparTexto($valor)
    {
        return trim(strip_tags((string) $valor));
    }
}