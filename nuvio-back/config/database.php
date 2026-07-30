<?php

require_once __DIR__ . '/env.php';

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
        $this->host     = env('DB_HOST');
        $this->dbname   = env('DB_NAME', 'defaultdb');
        $this->username = env('DB_USER', 'avnadmin');
        $this->password = env('DB_PASS', '');
        $this->port     = env('DB_PORT', '27687');
    }

    public function getConnection()
    {
        if ($this->conn instanceof PDO) {
            return $this->conn;
        }

        if (!$this->host) {
            $this->responderErro('DB_HOST não configurado no .env');
        }

        try {

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $this->host,
                $this->port,
                $this->dbname
            );

            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,

                    // SSL Aiven
                    PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/../certs/ca.pem',
                ]
            );

        } catch (PDOException $e) {
            $this->responderErro($e->getMessage());
        }

        return $this->conn;
    }

    private function responderErro(string $mensagem): void
    {
        http_response_code(500);

        echo json_encode([
            'sucesso' => false,
            'erro' => 'Erro de conexão: ' . $mensagem,
        ]);

        exit;
    }
}