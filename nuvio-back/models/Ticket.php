<?php

class Ticket
{
    private $conn;
    private $tabela = "Ticket";

    // Campos
    public $idTicket;
    public $idTecnico;
    public $idUsuario;
    public $idCategoria;
    public $idSLA;
    public $titulo;
    public $statusTicket;
    public $prioridade;
    public $dataAbertura;
    public $dataFechamento;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function getAll()
    {
        $query = "
            SELECT
                t.idTicket,
                t.titulo,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                u.nome AS nomeUsuario,
                u.email AS emailUsuario,
                us.nome AS nomeTecnico,
                c.nomeCategoria,
                s.nomeSLA
            FROM " . $this->tabela . " t
            INNER JOIN Usuario u ON t.idUsuario = u.idUsuario
            INNER JOIN Tecnico tc ON t.idTecnico = tc.idTecnico
            INNER JOIN Usuario us ON tc.idUsuario = us.idUsuario
            INNER JOIN Categoria c ON t.idCategoria = c.idCategoria
            INNER JOIN SLA s ON t.idSLA = s.idSLA
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
                t.titulo,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                t.idUsuario,
                t.idTecnico,
                t.idCategoria,
                t.idSLA,
                u.nome AS nomeUsuario,
                us.nome AS nomeTecnico,
                c.nomeCategoria,
                s.nomeSLA,
                s.tempoResposta,
                s.tempoResolucao
            FROM " . $this->tabela . " t
            INNER JOIN Usuario u ON t.idUsuario = u.idUsuario
            INNER JOIN Tecnico tc ON t.idTecnico = tc.idTecnico
            INNER JOIN Usuario us ON tc.idUsuario = us.idUsuario
            INNER JOIN Categoria c ON t.idCategoria = c.idCategoria
            INNER JOIN SLA s ON t.idSLA = s.idSLA
            WHERE t.idTicket = :idTicket
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

    // Listar tickets por usuário (cliente vê só os seus)
    public function getByUsuario()
    {
        $query = "
            SELECT
                t.idTicket,
                t.titulo,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                t.dataFechamento,
                c.nomeCategoria,
                s.nomeSLA
            FROM " . $this->tabela . " t
            INNER JOIN Categoria c ON t.idCategoria = c.idCategoria
            INNER JOIN SLA s ON t.idSLA = s.idSLA
            WHERE t.idUsuario = :idUsuario
            ORDER BY t.dataAbertura DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // Listar tickets por técnico
    public function getByTecnico()
    {
        $query = "
            SELECT
                t.idTicket,
                t.titulo,
                t.statusTicket,
                t.prioridade,
                t.dataAbertura,
                u.nome AS nomeUsuario,
                c.nomeCategoria
            FROM " . $this->tabela . " t
            INNER JOIN Usuario u ON t.idUsuario = u.idUsuario
            INNER JOIN Categoria c ON t.idCategoria = c.idCategoria
            WHERE t.idTecnico = :idTecnico
            ORDER BY
                FIELD(t.prioridade, 'Alta', 'Media', 'Baixa'),
                t.dataAbertura ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTecnico', $this->idTecnico, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // Criar ticket
    public function create()
    {
        $query = "
            INSERT INTO " . $this->tabela . "
                (idTecnico, idUsuario, idCategoria, idSLA, titulo, statusTicket, prioridade, dataAbertura)
            VALUES
                (:idTecnico, :idUsuario, :idCategoria, :idSLA, :titulo, :statusTicket, :prioridade, NOW())
        ";

        $stmt = $this->conn->prepare($query);

        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->prioridade = htmlspecialchars(strip_tags($this->prioridade));

        // Status padrão ao abrir
        $this->statusTicket = 'Aberto';

        $stmt->bindParam(':idTecnico',   $this->idTecnico,   PDO::PARAM_INT);
        $stmt->bindParam(':idUsuario',   $this->idUsuario,   PDO::PARAM_INT);
        $stmt->bindParam(':idCategoria', $this->idCategoria, PDO::PARAM_INT);
        $stmt->bindParam(':idSLA',       $this->idSLA,       PDO::PARAM_INT);
        $stmt->bindParam(':titulo',      $this->titulo);
        $stmt->bindParam(':statusTicket',$this->statusTicket);
        $stmt->bindParam(':prioridade',  $this->prioridade);

        if ($stmt->execute()) {
            $this->idTicket = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Atualizar status do ticket
    public function updateStatus()
    {
        $query = "UPDATE " . $this->tabela . "
                  SET statusTicket = :statusTicket
                  WHERE idTicket = :idTicket";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':statusTicket', $this->statusTicket);
        $stmt->bindParam(':idTicket',     $this->idTicket, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function update()
    {
        $fields = [];

        if ($this->titulo !== null) {
            $this->titulo = htmlspecialchars(strip_tags($this->titulo));
            $fields[] = "titulo = :titulo";
        }

        if ($this->statusTicket !== null) {
            $this->statusTicket = htmlspecialchars(strip_tags($this->statusTicket));
            $fields[] = "statusTicket = :statusTicket";
        }

        if ($this->prioridade !== null) {
            $this->prioridade = htmlspecialchars(strip_tags($this->prioridade));
            $fields[] = "prioridade = :prioridade";
        }

        if ($this->idTecnico !== null) {
            $fields[] = "idTecnico = :idTecnico";
        }

        if ($this->idCategoria !== null) {
            $fields[] = "idCategoria = :idCategoria";
        }

        if ($this->idSLA !== null) {
            $fields[] = "idSLA = :idSLA";
        }

        if (empty($fields)) {
            return false;
        }

        if (strtolower($this->statusTicket) === 'fechado') {
            $fields[] = "dataFechamento = NOW()";
        }

        $query = "UPDATE " . $this->tabela . " SET " . implode(', ', $fields) . " WHERE idTicket = :idTicket";
        $stmt = $this->conn->prepare($query);

        if ($this->titulo !== null) {
            $stmt->bindParam(':titulo', $this->titulo);
        }

        if ($this->statusTicket !== null) {
            $stmt->bindParam(':statusTicket', $this->statusTicket);
        }

        if ($this->prioridade !== null) {
            $stmt->bindParam(':prioridade', $this->prioridade);
        }

        if ($this->idTecnico !== null) {
            $stmt->bindParam(':idTecnico', $this->idTecnico, PDO::PARAM_INT);
        }

        if ($this->idCategoria !== null) {
            $stmt->bindParam(':idCategoria', $this->idCategoria, PDO::PARAM_INT);
        }

        if ($this->idSLA !== null) {
            $stmt->bindParam(':idSLA', $this->idSLA, PDO::PARAM_INT);
        }

        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Fechar ticket (define dataFechamento)
    public function fechar()
    {
        $query = "UPDATE " . $this->tabela . "
                  SET statusTicket = 'Fechado', dataFechamento = NOW()
                  WHERE idTicket = :idTicket";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Reatribuir técnico
    public function reatribuir()
    {
        $query = "UPDATE " . $this->tabela . "
                  SET idTecnico = :idTecnico
                  WHERE idTicket = :idTicket";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTecnico', $this->idTecnico, PDO::PARAM_INT);
        $stmt->bindParam(':idTicket',  $this->idTicket,  PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Deletar ticket (cuidado: apaga respostas e anexos em cascata se configurado no BD)
    public function delete()
    {
        $query = "DELETE FROM " . $this->tabela . " WHERE idTicket = :idTicket";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}