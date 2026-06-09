<?php
class DB
{
    private $host = 'localhost';
    public $db_name = 'helpdesk';
    private $username = 'root';
    private $password = '';
    private $port = '3306'; 
public $conn; 
public function getConnection(){ 
    $this->conn = null;   
    try {
        
    $dsn = 'mysql:host=' . $this->host . ';port=' . $this->port . ';dbname=' .
    $this->db_name . ';charset=utf8'; 
    $this->conn = new PDO($dsn, $this->username, $this->password);   
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);   
    } catch (PDOException $e) {
        
        echo 'Erro de Conexão:'. $e->getMessage();
    }  catch (Exception $e) {
        echo 'Erro:'. $e->getMessage();  
    }
    return $this->conn;
}
}