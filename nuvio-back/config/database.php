<?php

class DB
{
    private $host;
    private $dbname;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct()
    {
        $this->host     = $_ENV['DB_HOST']   ?? getenv('DB_HOST');
        $this->dbname   = $_ENV['DB_NAME']  ?? getenv('DB_NAME');
        $this->username = $_ENV['DB_USER']   ?? getenv('DB_USER');
        $this->password = $_ENV['DB_PASS']   ?? getenv('DB_PASS');
        $this->port     = $_ENV['DB_PORT']   ?? getenv('DB_PORT');
    }

    public function getConnection()
    {
        $this->conn = null;
        try {
            $dsn = sprintf(
                "pgsql:host=%s;port=%s;dbname=%s;options=--search_path=public",
                $this->host,
                $this->port,
                $this->dbname
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro de conexão: ' . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}