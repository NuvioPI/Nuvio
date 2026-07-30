<?php

class HistoricoTicket
{
    private $conn;
    private $tabela = 'HistoricoTicket';

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function getByTicket($idTicket)
    {
        $query = "
            SELECT
                h.idHistoricoTicket,
                h.idTicket,
                h.idUsuario,
                h.acao,
                h.campoAlterado,
                h.valorAnterior,
                h.valorNovo,
                h.dataAlteracao,
                u.nome AS nomeUsuario
            FROM {$this->tabela} h
            LEFT JOIN Usuario u
                ON h.idUsuario = u.idUsuario
            WHERE h.idTicket = :idTicket
            ORDER BY
                h.dataAlteracao DESC,
                h.idHistoricoTicket DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':idTicket', (int) $idTicket, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    public function registrar(
        $idTicket,
        $idUsuario,
        $acao,
        $campoAlterado = null,
        $valorAnterior = null,
        $valorNovo = null
    ) {
        $query = "
            INSERT INTO {$this->tabela}
            (
                idTicket,
                idUsuario,
                acao,
                campoAlterado,
                valorAnterior,
                valorNovo
            )
            VALUES
            (
                :idTicket,
                :idUsuario,
                :acao,
                :campoAlterado,
                :valorAnterior,
                :valorNovo
            )
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':idTicket', (int) $idTicket, PDO::PARAM_INT);
        $stmt->bindValue(':idUsuario', (int) $idUsuario, PDO::PARAM_INT);
        $stmt->bindValue(':acao', $acao, PDO::PARAM_STR);
        $stmt->bindValue(
            ':campoAlterado',
            $campoAlterado,
            $campoAlterado === null ? PDO::PARAM_NULL : PDO::PARAM_STR
        );
        $stmt->bindValue(
            ':valorAnterior',
            $valorAnterior,
            $valorAnterior === null ? PDO::PARAM_NULL : PDO::PARAM_STR
        );
        $stmt->bindValue(
            ':valorNovo',
            $valorNovo,
            $valorNovo === null ? PDO::PARAM_NULL : PDO::PARAM_STR
        );

        return $stmt->execute();
    }
}
