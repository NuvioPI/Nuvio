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
        $this->dbname   = env('DB_NAME', 'postgres');
        $this->username = env('DB_USER', 'postgres');
        $this->password = env('DB_PASS', '');
        $this->port     = env('DB_PORT', '5432');
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
                'pgsql:host=%s;port=%s;dbname=%s;sslmode=require;options=--search_path=public',
                $this->host,
                $this->port,
                $this->dbname
            );

            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            $mensagem = $e->getMessage();

            if (str_contains($mensagem, 'could not translate host name')) {
                $mensagem = 'Host do banco inválido ou inacessível. Verifique DB_HOST no .env do backend.';
            }

            $this->responderErro($mensagem);
        }

        return $this->conn;
    }

    private function responderErro(string $mensagem): void
    {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'erro'    => 'Erro de conexão: ' . $mensagem,
        ]);
        exit;
    }
}
