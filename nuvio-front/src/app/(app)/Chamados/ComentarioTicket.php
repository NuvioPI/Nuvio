<?php

class ComentarioTicket
{
    private $conn;
    private $tabela = "ComentarioTicket";

    public $idComentario;
    public $idTicket;
    public $idUsuario;
    public $texto;
    public $tipo; // 'resposta', 'nota_interna', 'log_sistema'
    public $dataCriacao;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Busca a "Timeline" do ticket
    public function getTimelineByTicket()
    {
        $query = "
            SELECT 
                c.*, 
                u.nome as nomeUsuario,
                tp.descricao as tipoUsuario
            FROM " . $this->tabela . " c
            INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
            INNER JOIN tipoUsuario tp ON u.idtipoUsuario = tp.idtipoUsuario
            WHERE c.idTicket = :idTicket
            ORDER BY c.dataCriacao ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function create()
    {
        $query = "INSERT INTO " . $this->tabela . " (idTicket, idUsuario, texto, tipo) 
                  VALUES (:idTicket, :idUsuario, :texto, :tipo)";
        
        $stmt = $this->conn->prepare($query);

        $this->texto = htmlspecialchars(strip_tags($this->texto));

        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->bindParam(':texto', $this->texto);
        $stmt->bindParam(':tipo', $this->tipo);

        return $stmt->execute();
    }
}