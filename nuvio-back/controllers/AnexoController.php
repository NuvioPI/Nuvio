<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/AnexoTicket.php';

class AnexoController {
    private $db;
    private $anexo;

    public function __construct() {
        $database = new DB();
        $this->db = $database->getConnection();
        $this->anexo = new AnexoTicket($this->db);
    }

    public function store($ticketId) {
        global $usuarioAutenticado;

        if (!isset($_FILES['arquivo']) || $_FILES['arquivo']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nenhum arquivo enviado ou erro no upload.']);
            return;
        }

        $file = $_FILES['arquivo'];
        $folder = __DIR__ . '/../uploads/';
        
        if (!is_dir($folder)) {
            mkdir($folder, 0777, true);
        }

        $extensao = pathinfo($file['name'], PATHINFO_EXTENSION);
        $novoNome = bin2hex(random_bytes(16)) . '.' . $extensao;
        $caminhoDestino = $folder . $novoNome;

        if (move_uploaded_file($file['tmp_name'], $caminhoDestino)) {
            $this->anexo->idTicket = $ticketId;
            $this->anexo->idUsuario = $usuarioAutenticado['idUsuario'];
            $this->anexo->nomeOriginal = $file['name'];
            $this->anexo->caminhoArquivo = 'uploads/' . $novoNome;
            $this->anexo->tipoMime = $file['type'];

            if ($this->anexo->create()) {
                http_response_code(201);
                echo json_encode(['mensagem' => 'Anexo enviado com sucesso.', 'caminho' => $this->anexo->caminhoArquivo]);
            } else {
                unlink($caminhoDestino);
                http_response_code(500);
                echo json_encode(['erro' => 'Erro ao salvar anexo no banco de dados.']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao mover arquivo para a pasta de destino.']);
        }
    }
}