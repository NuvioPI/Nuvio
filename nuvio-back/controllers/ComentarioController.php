<?php
require_once __DIR__ . '/../models/ComentarioTicket.php';
require_once __DIR__ . '/../config/database.php';

class ComentarioController {
    private $db;
    private $model;

    public function __construct() {
        $database = new DB();
        $this->db = $database->getConnection();
        $this->model = new ComentarioTicket($this->db);
    }

    public function index($ticketId) {
        $stmt = $this->model->getTimelineByTicket($ticketId);
        $timeline = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($timeline);
    }

    public function store($ticketId) {
        global $usuarioAutenticado;
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['texto'])) {
            http_response_code(400);
            echo json_encode(["erro" => "Texto obrigatório"]);
            return;
        }

        $this->model->idTicket = $ticketId;
        $this->model->idUsuario = $usuarioAutenticado['idUsuario'];
        $this->model->texto = $data['texto'];
        $this->model->tipo = $data['tipo'] ?? 'resposta'; // resposta ou nota_interna

        if ($this->model->create()) {
            http_response_code(201);
            echo json_encode(["mensagem" => "Registrado com sucesso"]);
        } else {
            http_response_code(500);
            echo json_encode(["erro" => "Erro ao registrar no banco de dados"]);
        }
    }
}