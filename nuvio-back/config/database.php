<?php
require_once __DIR__ . '/env.php';

class DB
{
    private $host;
    public $db_name;
    private $username;
    private $password;
    private $port;
    public $conn;
    
    public function __construct()
    {
        $this->host = env('DB_HOST', '127.0.0.1');
        $this->db_name = env('DB_NAME', 'nuviohelpdesk');
        $this->username = env('DB_USER', 'root');
        $this->password = env('DB_PASSWORD', 'root');
        $this->port = env('DB_PORT', '8889');
    } 
public function getConnection(){ 
    $this->conn = null;   
    try {
        
    $dsn = 'mysql:host=' . $this->host . ';port=' . $this->port . ';dbname=' .
    $this->db_name . ';charset=utf8'; 
    $this->conn = new PDO($dsn, $this->username, $this->password);   
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);   
    } catch (PDOException $e) {
        // Não expõe detalhes do erro em produção
        if (env('APP_ENV') === 'development') {
            echo 'Erro de Conexão: ' . $e->getMessage();
        } else {
            echo 'Erro de conexão com banco de dados.';
        }
        exit();
    } catch (Exception $e) {
        if (env('APP_ENV') === 'development') {
            echo 'Erro: ' . $e->getMessage();
        } else {
            echo 'Erro de conexão.';
        }
        exit();
    }
    return $this->conn;
}
}