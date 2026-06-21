<?php
require_once __DIR__ . '/env.php';

class DB
{
    private $host;
    public $db_name;
    private $username;
    private $password;
    private $port;
<<<<<<< HEAD
    private $ssl;
    private $conn;

    public function __construct()
    {
        $this->host     = $_ENV['DB_HOST']   ?? getenv('DB_HOST');
        $this->db_name  = $_ENV['DB_NAME']   ?? getenv('DB_NAME');
        $this->username = $_ENV['DB_USER']   ?? getenv('DB_USER');
        $this->password = $_ENV['DB_PASS']   ?? getenv('DB_PASS');
        $this->port     = $_ENV['DB_PORT']   ?? getenv('DB_PORT');
        $this->ssl      = ($_ENV['DB_SSL']   ?? getenv('DB_SSL')) === 'true';
    }

    public function getConnection()
    {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ];

            if ($this->ssl) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = __DIR__ . '/../certs/ca.pem';
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            }

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro de conexão: ' . $e->getMessage()]);
            exit;
=======
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
>>>>>>> e2efb29203b66f8f057ad3671ee022964bc47a02
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
<<<<<<< HEAD
}
=======
    return $this->conn;
}
}
>>>>>>> e2efb29203b66f8f057ad3671ee022964bc47a02
