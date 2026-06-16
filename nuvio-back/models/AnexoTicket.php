<?php

class AnexoTicket {
    private $conn;
    private $tabela = "AnexoTicket";

    public $idAnexo, $idTicket, $idUsuario, $nomeOriginal, $caminhoArquivo, $tipoMime;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->tabela . " 
                  (idTicket, idUsuario, nomeOriginal, caminhoArquivo, tipoMime) 
                  VALUES (:idTicket, :idUsuario, :nomeOriginal, :caminhoArquivo, :tipoMime)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket);
        $stmt->bindParam(':idUsuario', $this->idUsuario);
        $stmt->bindParam(':nomeOriginal', $this->nomeOriginal);
        $stmt->bindParam(':caminhoArquivo', $this->caminhoArquivo);
        $stmt->bindParam(':tipoMime', $this->tipoMime);
        
        return $stmt->execute();
    }
}