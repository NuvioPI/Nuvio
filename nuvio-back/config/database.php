<?php
require_once __DIR__ . '/env.php';

class DB
{
    private $host;
    public $db_name;
    private $username;
    private $password;
    private $port;
    private $ssl;
    private $conn;

    public function __construct()
    {
        $this->host     = env('DB_HOST', '127.0.0.1');
        $this->db_name  = env('DB_NAME', 'nuviohelpdesk');
        $this->username = env('DB_USER', 'root');
        $this->password = env('DB_PASS', env('DB_PASSWORD', ''));
        $this->port     = env('DB_PORT', '3306');
        $this->ssl      = env('DB_SSL', 'false') === 'true';
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
            echo json_encode(['sucesso' => false, 'erro' => 'Erro de conexão com o banco de dados.']);
            exit;
        }

        return $this->conn;
    }
}
