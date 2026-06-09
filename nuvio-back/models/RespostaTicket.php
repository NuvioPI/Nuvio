<?php

class RespostaTicket
{
    private $conn;
    private $tabela = "respostaTicket";

    public $idRespostaTicket;
    public $idUsuario;
    public $idTicket;
    public $msgTicket;
    public $dataResposta;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function getByTicket()
    {
        $query = "
            SELECT
                r.idRespostaTicket,
                r.idUsuario,
                r.idTicket,
                r.msgTicket,
                r.dataResposta,
                u.nome AS nomeUsuario,
                tp.descricao AS tipoUsuario
            FROM " . $this->tabela . " r
            INNER JOIN Usuario u  ON r.idUsuario = u.idUsuario
            INNER JOIN tipoUsuario tp ON u.idtipoUsuario = tp.idtipoUsuario
            WHERE r.idTicket = :idTicket
            ORDER BY r.dataResposta ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // Buscar resposta por ID
    public function getById()
    {
        $query = "
            SELECT
                r.idRespostaTicket,
                r.idUsuario,
                r.idTicket,
                r.msgTicket,
                r.dataResposta,
                u.nome AS nomeUsuario
            FROM " . $this->tabela . " r
            INNER JOIN Usuario u ON r.idUsuario = u.idUsuario
            WHERE r.idRespostaTicket = :idRespostaTicket
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idRespostaTicket', $this->idRespostaTicket, PDO::PARAM_INT);
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

    // Criar resposta — dataResposta preenchida pelo banco (DEFAULT CURRENT_TIMESTAMP)
    public function create()
    {
        if (!$this->ticketEstaAberto()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . " (idUsuario, idTicket, msgTicket)
            VALUES (:idUsuario, :idTicket, :msgTicket)
        ";

        $stmt = $this->conn->prepare($query);

        $this->msgTicket = htmlspecialchars(strip_tags($this->msgTicket));

        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->bindParam(':idTicket',  $this->idTicket,  PDO::PARAM_INT);
        $stmt->bindParam(':msgTicket', $this->msgTicket);

        if ($stmt->execute()) {
            $this->idRespostaTicket = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Editar mensagem (só permite editar a própria resposta)
    public function update()
    {
        $query = "
            UPDATE " . $this->tabela . "
            SET msgTicket = :msgTicket
            WHERE idRespostaTicket = :idRespostaTicket
            AND idUsuario = :idUsuario
        ";

        $stmt = $this->conn->prepare($query);

        $this->msgTicket = htmlspecialchars(strip_tags($this->msgTicket));

        $stmt->bindParam(':msgTicket',         $this->msgTicket);
        $stmt->bindParam(':idRespostaTicket',  $this->idRespostaTicket, PDO::PARAM_INT);
        $stmt->bindParam(':idUsuario',         $this->idUsuario,        PDO::PARAM_INT);

        $stmt->execute();

        // rowCount() = 0 significa que não encontrou a resposta ou não pertence ao usuário
        return $stmt->rowCount() > 0;
    }

    // Deletar resposta (admin pode deletar qualquer uma; usuário só a sua)
    public function delete()
    {
        $query = "
            DELETE FROM " . $this->tabela . "
            WHERE idRespostaTicket = :idRespostaTicket
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idRespostaTicket', $this->idRespostaTicket, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Verifica se o ticket está aberto ou em atendimento (não permite resposta em tickets fechados)
    private function ticketEstaAberto()
    {
        $query = "
            SELECT statusTicket FROM Ticket
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

        return in_array($row['statusTicket'], ['Aberto', 'Em atendimento']);
    }
}