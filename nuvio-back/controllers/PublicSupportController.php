<?php

require_once __DIR__ . '/BaseController.php';

/** Endpoints deliberately kept separate from the authenticated help-desk API. */
class PublicSupportController extends BaseController
{
    public function createTicket()
    {
        $body = $this->body();
        $nome = trim((string) ($body['nome'] ?? ''));
        $email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $titulo = trim((string) ($body['titulo'] ?? ''));
        $descricao = trim((string) ($body['descricao'] ?? ''));
        $prioridade = in_array($body['prioridade'] ?? '', ['Baixa', 'Media', 'Alta'], true)
            ? $body['prioridade'] : 'Media';

        if (!$nome || !$email || !$titulo || !$descricao) {
            $this->respond(['erro' => 'Nome, e-mail, assunto e descrição são obrigatórios.'], 422);
            return;
        }

        try {
            $this->db->beginTransaction();
            $idUsuario = $this->cliente($nome, $email);
            [$idTecnico, $idCategoria, $idSLA] = $this->configuracaoPadrao();

            $ticket = $this->db->prepare(
                'INSERT INTO Ticket (idTecnico, idUsuario, idCategoria, idSLA, titulo, descricao, statusTicket, prioridade, dataAbertura)
                 VALUES (?, ?, ?, ?, ?, ?, "Aberto", ?, NOW())'
            );
            $ticket->execute([$idTecnico, $idUsuario, $idCategoria, $idSLA, $titulo, $descricao, $prioridade]);
            $idTicket = (int) $this->db->lastInsertId();

            $historico = $this->db->prepare(
                'INSERT INTO HistoricoTicket (idTicket, idUsuario, acao, campoAlterado, valorNovo) VALUES (?, ?, "Criacao", "statusTicket", "Aberto")'
            );
            $historico->execute([$idTicket, $idUsuario]);

            if (($body['canal'] ?? '') === 'chat') {
                $resposta = $this->db->prepare(
                    'INSERT INTO respostaTicket (idUsuario, idTicket, msgTicket, dataResposta) VALUES (?, ?, ?, NOW())'
                );
                $resposta->execute([$idUsuario, $idTicket, strip_tags($descricao)]);
            }
            $this->db->commit();

            $this->respond(['mensagem' => 'Chamado aberto com sucesso.', 'idTicket' => $idTicket], 201);
        } catch (Throwable $erro) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->respond(['erro' => 'Não foi possível abrir o chamado agora.'], 500);
        }
    }

    public function messages(int $idTicket)
    {
        $email = filter_var($_GET['email'] ?? '', FILTER_VALIDATE_EMAIL);
        if (!$email || !$this->ticketPertenceAoEmail($idTicket, $email)) {
            $this->respond(['erro' => 'Conversa não encontrada.'], 404);
            return;
        }
        $consulta = $this->db->prepare(
            'SELECT r.idRespostaTicket, r.msgTicket, r.dataResposta, u.nome AS autor
             FROM respostaTicket r INNER JOIN Usuario u ON u.idUsuario = r.idUsuario
             WHERE r.idTicket = ? ORDER BY r.dataResposta ASC, r.idRespostaTicket ASC'
        );
        $consulta->execute([$idTicket]);
        $this->respond(['mensagens' => $consulta->fetchAll()]);
    }

    public function sendMessage(int $idTicket)
    {
        $body = $this->body();
        $email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $mensagem = trim((string) ($body['mensagem'] ?? ''));
        if (!$email || !$mensagem || !$this->ticketPertenceAoEmail($idTicket, $email)) {
            $this->respond(['erro' => 'Não foi possível enviar a mensagem.'], 422);
            return;
        }
        $usuario = $this->db->prepare('SELECT idUsuario FROM Usuario WHERE email = ? LIMIT 1');
        $usuario->execute([$email]);
        $idUsuario = (int) $usuario->fetchColumn();
        $inserir = $this->db->prepare('INSERT INTO respostaTicket (idUsuario, idTicket, msgTicket, dataResposta) VALUES (?, ?, ?, NOW())');
        $inserir->execute([$idUsuario, $idTicket, strip_tags($mensagem)]);
        $this->respond(['idRespostaTicket' => (int) $this->db->lastInsertId()], 201);
    }

    private function ticketPertenceAoEmail(int $idTicket, string $email): bool
    {
        $consulta = $this->db->prepare('SELECT 1 FROM Ticket t INNER JOIN Usuario u ON u.idUsuario = t.idUsuario WHERE t.idTicket = ? AND u.email = ? LIMIT 1');
        $consulta->execute([$idTicket, $email]);
        return (bool) $consulta->fetchColumn();
    }

    private function cliente(string $nome, string $email): int
    {
        $consulta = $this->db->prepare('SELECT idUsuario FROM Usuario WHERE email = ? LIMIT 1');
        $consulta->execute([$email]);
        $existente = $consulta->fetchColumn();
        if ($existente) return (int) $existente;

        $tipo = $this->db->query("SELECT idtipoUsuario FROM tipoUsuario WHERE descricao = 'Cliente' LIMIT 1")->fetchColumn();
        if (!$tipo) throw new RuntimeException('Tipo de usuário Cliente não configurado.');
        $criar = $this->db->prepare('INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor) VALUES (?, ?, ?, ?, ?, ?)');
        $criar->execute([(int) $tipo, $nome, $email, password_hash(bin2hex(random_bytes(20)), PASSWORD_DEFAULT), 'Cliente', 'Portal público']);
        return (int) $this->db->lastInsertId();
    }

    private function configuracaoPadrao(): array
    {
        $tecnico = $this->db->query('SELECT idTecnico FROM Tecnico WHERE ativo = 1 ORDER BY idTecnico LIMIT 1')->fetchColumn();
        $categoria = $this->db->query('SELECT idCategoria FROM Categoria ORDER BY idCategoria LIMIT 1')->fetchColumn();
        $sla = $this->db->query('SELECT idSLA FROM SLA ORDER BY idSLA LIMIT 1')->fetchColumn();
        if (!$tecnico || !$categoria || !$sla) throw new RuntimeException('Configuração de atendimento incompleta.');
        return [(int) $tecnico, (int) $categoria, (int) $sla];
    }
}
