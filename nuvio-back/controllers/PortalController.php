<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Ticket.php';

class PortalController extends BaseController
{
    private $idUsuario;
    private $ticket;

    public function __construct($idUsuario)
    {
        parent::__construct();
        $this->idUsuario = (int) $idUsuario;
        $this->ticket = new Ticket($this->db);
    }

    public function index()
    {
        $this->ticket->idUsuario = $this->idUsuario;
        $this->respond(['tickets' => $this->rows($this->ticket->getByUsuario())]);
    }

    public function show($id)
    {
        $ticket = $this->ticketOwned($id);
        if (!$ticket) {
            $this->respond(['erro' => 'Chamado não encontrado.'], 404);
            return;
        }

        $this->respond(['ticket' => $ticket]);
    }

    public function create()
    {
        $body = $this->body();
        $titulo = trim((string) ($body['titulo'] ?? ''));
        $descricao = trim((string) ($body['descricao'] ?? ''));
        $prioridade = $body['prioridade'] ?? 'Media';

        if ($titulo === '' || $descricao === '') {
            $this->respond(['erro' => 'Assunto e descrição são obrigatórios.'], 422);
            return;
        }

        if (!in_array($prioridade, ['Baixa', 'Media', 'Alta'], true)) {
            $this->respond(['erro' => 'Prioridade inválida.'], 422);
            return;
        }

        try {
            [$idTecnico, $idCategoria, $idSLA] = $this->configuracaoPadrao();
            $this->db->beginTransaction();

            $stmt = $this->db->prepare(
                'INSERT INTO Ticket (idTecnico, idUsuario, idCategoria, idSLA, titulo, descricao, statusTicket, prioridade, dataAbertura)
                 VALUES (?, ?, ?, ?, ?, ?, "Aberto", ?, NOW())'
            );
            $stmt->execute([$idTecnico, $this->idUsuario, $idCategoria, $idSLA, strip_tags($titulo), strip_tags($descricao), $prioridade]);
            $idTicket = (int) $this->db->lastInsertId();

            $historico = $this->db->prepare(
                'INSERT INTO HistoricoTicket (idTicket, idUsuario, acao, campoAlterado, valorNovo) VALUES (?, ?, "Criacao", "statusTicket", "Aberto")'
            );
            $historico->execute([$idTicket, $this->idUsuario]);
            $this->db->commit();

            $this->respond(['mensagem' => 'Chamado aberto com sucesso.', 'idTicket' => $idTicket], 201);
        } catch (Throwable $erro) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->respond(['erro' => 'Não foi possível abrir o chamado.'], 500);
        }
    }

    public function messages($id)
    {
        if (!$this->ticketOwned($id)) {
            $this->respond(['erro' => 'Chamado não encontrado.'], 404);
            return;
        }

        $stmt = $this->db->prepare(
            'SELECT r.idRespostaTicket, r.idTicket, r.msgTicket, r.dataResposta, u.nome AS nomeUsuario
             FROM respostaTicket r INNER JOIN Usuario u ON u.idUsuario = r.idUsuario
             WHERE r.idTicket = ? ORDER BY r.dataResposta ASC, r.idRespostaTicket ASC'
        );
        $stmt->execute([(int) $id]);
        $this->respond(['mensagens' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function sendMessage($id)
    {
        $ticket = $this->ticketOwned($id);
        if (!$ticket) {
            $this->respond(['erro' => 'Chamado não encontrado.'], 404);
            return;
        }

        if (in_array($ticket['statusTicket'], ['Fechado', 'Resolvido'], true)) {
            $this->respond(['erro' => 'Este chamado não aceita novas mensagens.'], 409);
            return;
        }

        $body = $this->body();
        $mensagem = trim((string) ($body['mensagem'] ?? ''));
        if ($mensagem === '') {
            $this->respond(['erro' => 'A mensagem não pode ficar vazia.'], 422);
            return;
        }

        $stmt = $this->db->prepare('INSERT INTO respostaTicket (idUsuario, idTicket, msgTicket, dataResposta) VALUES (?, ?, ?, NOW())');
        $stmt->execute([$this->idUsuario, (int) $id, strip_tags($mensagem)]);
        $this->respond(['mensagem' => 'Mensagem enviada.', 'idRespostaTicket' => (int) $this->db->lastInsertId()], 201);
    }

    private function ticketOwned($id)
    {
        if (!filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) return null;
        $stmt = $this->db->prepare(
            'SELECT t.idTicket, t.idUsuario, t.titulo, t.descricao, t.statusTicket, t.prioridade, t.dataAbertura, t.dataFechamento,
                    c.nomeCategoria, s.nomeSLA
             FROM Ticket t
             INNER JOIN Categoria c ON c.idCategoria = t.idCategoria
             INNER JOIN SLA s ON s.idSLA = t.idSLA
             WHERE t.idTicket = ? AND t.idUsuario = ? LIMIT 1'
        );
        $stmt->execute([(int) $id, $this->idUsuario]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function configuracaoPadrao()
    {
        $tecnico = $this->db->query('SELECT idTecnico FROM Tecnico WHERE ativo = 1 ORDER BY idTecnico LIMIT 1')->fetchColumn();
        $categoria = $this->db->query('SELECT idCategoria FROM Categoria ORDER BY idCategoria LIMIT 1')->fetchColumn();
        $sla = $this->db->query('SELECT idSLA FROM SLA ORDER BY idSLA LIMIT 1')->fetchColumn();
        if (!$tecnico || !$categoria || !$sla) throw new RuntimeException('Configuração de atendimento incompleta.');
        return [(int) $tecnico, (int) $categoria, (int) $sla];
    }
}
