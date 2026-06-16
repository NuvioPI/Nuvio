<?php

class ComentarioTicket {
    private $conn;
    private $tabela = "ComentarioTicket";

    public $idComentario, $idTicket, $idUsuario, $texto, $tipo, $dataCriacao;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Retorna a Timeline: Respostas + Notas Internas + Logs
    public function getTimelineByTicket($idTicket) {
        $query = "SELECT c.*, u.nome as nomeUsuario, tu.descricao as tipoUsuario
                  FROM " . $this->tabela . " c
                  JOIN Usuario u ON c.idUsuario = u.idUsuario
                  LEFT JOIN tipoUsuario tu ON u.idtipoUsuario = tu.idtipoUsuario
                  WHERE c.idTicket = :idTicket 
                  ORDER BY c.dataCriacao ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $idTicket, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->tabela . " (idTicket, idUsuario, texto, tipo) 
                  VALUES (:idTicket, :idUsuario, :texto, :tipo)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket);
        $stmt->bindParam(':idUsuario', $this->idUsuario);
        $stmt->bindParam(':texto', $this->texto);
        $stmt->bindParam(':tipo', $this->tipo); // 'resposta' ou 'nota_interna'
        return $stmt->execute();
    }
}