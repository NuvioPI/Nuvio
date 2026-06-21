<?php

class DB
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
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
        }
        return $this->conn;
    }
}
