<?php
class DB
{
    private $host;
    public $db_name;
    private $username;
    private $password;
    private $port;
    private $ca_cert;
    public $conn;

    public function __construct()
    {
        $this->host     = getenv('DB_HOST');
        $this->db_name  = getenv('DB_NAME');
        $this->username = getenv('DB_USER');
        $this->password = getenv('DB_PASS');
        $this->port     = getenv('DB_PORT');
        $this->ca_cert  = __DIR__ . '/../ca.pem'; // caminho do certificado SSL do Aiven
    }

    public function getConnection()
    {
        $this->conn = null;
        try {
            $dsn = 'mysql:host=' . $this->host . ';port=' . $this->port . ';dbname=' .
                $this->db_name . ';charset=utf8mb4';

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_SSL_CA => $this->ca_cert,
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            echo 'Erro de Conexão: ' . $e->getMessage();
        } catch (Exception $e) {
            echo 'Erro: ' . $e->getMessage();
        }
        return $this->conn;
    }
}