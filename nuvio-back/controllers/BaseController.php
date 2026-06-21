<?php

require_once __DIR__ . '/../config/database.php';

abstract class BaseController
{
    protected $db;

    public function __construct()
    {
        $database = new DB();
        $this->db = $database->getConnection();
    }

    protected function body()
    {
        $body = json_decode(file_get_contents('php://input'), true);
        return is_array($body) ? $body : [];
    }

    protected function respond($data, $status = 200)
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    protected function rows($stmt)
    {
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    protected function missing(array $body, array $fields)
    {
        foreach ($fields as $field) {
            if (!isset($body[$field]) || $body[$field] === '') {
                return true;
            }
        }

        return false;
    }
}
