<?php

require_once __DIR__ . '/BaseController.php';

class NotificacaoController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    // Retorna as últimas notificações do usuário autenticado
    public function index()
    {
        $auth = autenticar();
        $idUsuario = (int) ($auth['idUsuario'] ?? 0);

        $stmt = $this->db->prepare(
            'SELECT idNotificacao, titulo, mensagem, tipo, lida, idTicket, dataCriacao
             FROM Notificacao
             WHERE idUsuario = ?
             ORDER BY dataCriacao DESC
             LIMIT 50'
        );

        $stmt->execute([$idUsuario]);
        $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt2 = $this->db->prepare('SELECT COUNT(*) as naoLidas FROM Notificacao WHERE idUsuario = ? AND lida = 0');
        $stmt2->execute([$idUsuario]);
        $countRow = $stmt2->fetch(PDO::FETCH_ASSOC);
        $naoLidas = (int) ($countRow['naoLidas'] ?? 0);

        $this->respond([
            'notificacoes' => $notificacoes,
            'unreadCount' => $naoLidas,
        ]);
    }
}
