<?php

class AvaliacaoTicket
{
    private $conn;
    private $tabela = "avaliacaoTicket";

    public $idAvaliacaoTicket;
    public $idTicket;
    public $idUsuario;
    public $nota;
    public $comentario;
    public $dataAvaliacao;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Buscar avaliação de um ticket específico
    public function getByTicket()
    {
        $query = "
            SELECT
                a.idAvaliacaoTicket,
                a.idTicket,
                a.idUsuario,
                a.nota,
                a.comentario,
                a.dataAvaliacao,
                u.nome AS nomeUsuario,
                t.titulo AS tituloTicket
            FROM " . $this->tabela . " a
            INNER JOIN Usuario u ON a.idUsuario = u.idUsuario
            INNER JOIN Ticket  t ON a.idTicket  = t.idTicket
            WHERE a.idTicket = :idTicket
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
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

    // Listar todas as avaliações (visão do administrador)
    public function getAll()
    {
        $query = "
            SELECT
                a.idAvaliacaoTicket,
                a.idTicket,
                a.nota,
                a.comentario,
                a.dataAvaliacao,
                u.nome AS nomeUsuario,
                t.titulo AS tituloTicket
            FROM " . $this->tabela . " a
            INNER JOIN Usuario u ON a.idUsuario = u.idUsuario
            INNER JOIN Ticket  t ON a.idTicket  = t.idTicket
            ORDER BY a.dataAvaliacao DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Média de notas por técnico (relatório)
    public function getMediaPorTecnico()
    {
        $query = "
            SELECT
                tc.idTecnico,
                u.nome AS nomeTecnico,
                ROUND(AVG(a.nota), 2) AS mediaNotas,
                COUNT(a.idAvaliacaoTicket) AS totalAvaliacoes
            FROM " . $this->tabela . " a
            INNER JOIN Ticket  t  ON a.idTicket   = t.idTicket
            INNER JOIN Tecnico tc ON t.idTecnico  = tc.idTecnico
            INNER JOIN Usuario u  ON tc.idUsuario = u.idUsuario
            GROUP BY tc.idTecnico, u.nome
            ORDER BY mediaNotas DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Criar avaliação (apenas para tickets resolvidos/fechados, e apenas uma vez)
    public function create()
    {
        if (!$this->notaValida()) {
            return false;
        }

        if (!$this->ticketPodeSerAvaliado()) {
            return false;
        }

        if ($this->jaAvaliado()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (idTicket, idUsuario, nota, comentario)
            VALUES (:idTicket, :idUsuario, :nota, :comentario)
        ";

        $stmt = $this->conn->prepare($query);

        $this->comentario = htmlspecialchars(strip_tags($this->comentario));

        $stmt->bindParam(':idTicket',   $this->idTicket,   PDO::PARAM_INT);
        $stmt->bindParam(':idUsuario',  $this->idUsuario,  PDO::PARAM_INT);
        $stmt->bindParam(':nota',       $this->nota,       PDO::PARAM_INT);
        $stmt->bindParam(':comentario', $this->comentario);

        if ($stmt->execute()) {
            $this->idAvaliacaoTicket = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Atualizar avaliação (permite o cliente corrigir a nota)
    public function update()
    {
        if (!$this->notaValida()) {
            return false;
        }

        $query = "
            UPDATE " . $this->tabela . "
            SET nota       = :nota,
                comentario = :comentario
            WHERE idTicket  = :idTicket
            AND   idUsuario = :idUsuario
        ";

        $stmt = $this->conn->prepare($query);

        $this->comentario = htmlspecialchars(strip_tags($this->comentario));

        $stmt->bindParam(':nota',       $this->nota,      PDO::PARAM_INT);
        $stmt->bindParam(':comentario', $this->comentario);
        $stmt->bindParam(':idTicket',   $this->idTicket,  PDO::PARAM_INT);
        $stmt->bindParam(':idUsuario',  $this->idUsuario, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Verifica se a nota está entre 1 e 5 (espelha o CHECK do banco)
    private function notaValida()
    {
        return (int)$this->nota >= 1 && (int)$this->nota <= 5;
    }

    // Verifica se o ticket está Resolvido ou Fechado para poder avaliar
    private function ticketPodeSerAvaliado()
    {
        $query = "
            SELECT statusTicket, idUsuario FROM Ticket
            WHERE idTicket = :idTicket
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        // Só o dono do ticket pode avaliar
        if ((int)$row['idUsuario'] !== (int)$this->idUsuario) {
            return false;
        }

        return in_array($row['statusTicket'], ['Resolvido', 'Fechado']);
    }

    // Verifica se o ticket já foi avaliado (idTicket é UNIQUE na tabela)
    private function jaAvaliado()
    {
        $query = "
            SELECT idAvaliacaoTicket FROM " . $this->tabela . "
            WHERE idTicket = :idTicket
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }
}