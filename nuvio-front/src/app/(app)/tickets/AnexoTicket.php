<?php

class AnexoTicket
{
    private $conn;
    private $tabela = "AnexoTicket";

    public $idAnexo;
    public $idTicket;
    public $idUsuario;
    public $nomeOriginal;
    public $caminhoArquivo;
    public $tipoMime;
    public $dataUpload;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    public function create()
    {
        $query = "INSERT INTO " . $this->tabela . " (idTicket, idUsuario, nomeOriginal, caminhoArquivo, tipoMime) 
                  VALUES (:idTicket, :idUsuario, :nomeOriginal, :caminhoArquivo, :tipoMime)";
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->bindParam(':nomeOriginal', $this->nomeOriginal);
        $stmt->bindParam(':caminhoArquivo', $this->caminhoArquivo);
        $stmt->bindParam(':tipoMime', $this->tipoMime);

        return $stmt->execute();
    }

    public function getByTicket()
    {
        $query = "SELECT * FROM " . $this->tabela . " WHERE idTicket = :idTicket ORDER BY dataUpload DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idTicket', $this->idTicket, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }
}