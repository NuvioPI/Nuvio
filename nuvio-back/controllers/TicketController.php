<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Ticket.php';
require_once __DIR__ . '/../models/HistoricoTicket.php';
require_once __DIR__ . '/../services/EmailService.php';

class TicketController extends BaseController
{
    private $ticket;
    private $historico;
    private $idUsuarioAutenticado;

    private const PRIORIDADES_VALIDAS = [
        'Baixa',
        'Media',
        'Alta'
    ];

    private const STATUS_VALIDOS = [
        'Aberto',
        'Em atendimento',
        'Resolvido',
        'Fechado'
    ];

    public function __construct($idUsuarioAutenticado)
    {
        parent::__construct();
        $this->ticket = new Ticket($this->db);
        $this->historico = new HistoricoTicket($this->db);
        $this->idUsuarioAutenticado = (int) $idUsuarioAutenticado;
    }

    /**
     * GET /tickets
     */
    public function index()
    {
        try {
            $stmt = $this->ticket->getAll();

            $this->respond([
                'tickets' => $this->rows($stmt)
            ]);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'Não foi possível listar os tickets.'
            ], 500);
        }
    }

    /**
     * GET /tickets/opcoes
     * Retorna em uma única chamada os dados necessários ao formulário.
     */
    public function formOptions()
    {
        try {
            $perfil = $this->db->prepare(
                'SELECT tu.descricao
                 FROM Usuario u
                 INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
                 WHERE u.idUsuario = ? LIMIT 1'
            );
            $perfil->execute([$this->idUsuarioAutenticado]);
            $tipo = (string) $perfil->fetchColumn();

            if (in_array(normalizarRole($tipo), ['administrador', 'tecnico'], true)) {
                $usuarios = $this->db->query(
                    'SELECT idUsuario, nome, email FROM Usuario ORDER BY nome ASC'
                )->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $stmtUsuarios = $this->db->prepare(
                    'SELECT idUsuario, nome, email FROM Usuario WHERE idUsuario = ? LIMIT 1'
                );
                $stmtUsuarios->execute([$this->idUsuarioAutenticado]);
                $usuarios = $stmtUsuarios->fetchAll(PDO::FETCH_ASSOC);
            }

            $tecnicos = $this->db->query(
                'SELECT t.idTecnico, t.especialidade, u.nome, u.email
                 FROM Tecnico t
                 INNER JOIN Usuario u ON u.idUsuario = t.idUsuario
                 WHERE t.ativo = TRUE
                 ORDER BY u.nome ASC'
            )->fetchAll(PDO::FETCH_ASSOC);

            $categorias = $this->db->query(
                'SELECT idCategoria, nomeCategoria FROM Categoria ORDER BY nomeCategoria ASC'
            )->fetchAll(PDO::FETCH_ASSOC);

            $slas = $this->db->query(
                'SELECT idSLA, nomeSLA FROM SLA ORDER BY nomeSLA ASC'
            )->fetchAll(PDO::FETCH_ASSOC);

            $this->respond([
                'usuarios' => $usuarios,
                'tecnicos' => $tecnicos,
                'categorias' => $categorias,
                'slas' => $slas,
            ]);
        } catch (Throwable $erro) {
            error_log('TicketController::formOptions - ' . $erro->getMessage());
            $this->respond(['erro' => 'Não foi possível carregar as opções do chamado.'], 500);
        }
    }

    /**
     * GET /tickets/{id}
     */
    public function show($id)
    {
        if (!$this->idValido($id)) {
            $this->respond([
                'erro' => 'ID do ticket inválido.'
            ], 400);

            return;
        }

        $this->ticket->idTicket = (int) $id;

        try {
            if (!$this->ticket->getById()) {
                $this->respond([
                    'erro' => 'Ticket não encontrado.'
                ], 404);

                return;
            }

            $this->respond([
                'ticket' => [
                    'idTicket' => (int) $this->ticket->idTicket,
                    'idTecnico' => (int) $this->ticket->idTecnico,
                    'idUsuario' => (int) $this->ticket->idUsuario,
                    'idCategoria' => (int) $this->ticket->idCategoria,
                    'idSLA' => (int) $this->ticket->idSLA,
                    'titulo' => $this->ticket->titulo,
                    'descricao' => $this->ticket->descricao,
                    'statusTicket' => $this->ticket->statusTicket,
                    'prioridade' => $this->ticket->prioridade,
                    'dataAbertura' => $this->ticket->dataAbertura,
                    'dataFechamento' => $this->ticket->dataFechamento,
                    'nomeUsuario' => $this->ticket->nomeUsuario,
                    'emailUsuario' => $this->ticket->emailUsuario,
                    'nomeTecnico' => $this->ticket->nomeTecnico,
                    'nomeCategoria' => $this->ticket->nomeCategoria,
                    'nomeSLA' => $this->ticket->nomeSLA,
                ]
            ]);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'Não foi possível consultar o ticket.'
            ], 500);
        }
    }

    /**
     * GET /tickets/{id}/historico
     */
    public function historico($id)
    {
        if (!$this->idValido($id)) {
            $this->respond([
                'erro' => 'ID do ticket inválido.'
            ], 400);

            return;
        }

        $ticketExistente = new Ticket($this->db);
        $ticketExistente->idTicket = (int) $id;

        try {
            if (!$ticketExistente->getById()) {
                $this->respond([
                    'erro' => 'Ticket não encontrado.'
                ], 404);

                return;
            }

            $this->respond([
                'historico' => $this->rows(
                    $this->historico->getByTicket($id)
                )
            ]);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'Não foi possível consultar o histórico do ticket.'
            ], 500);
        }
    }

    /**
     * POST /tickets
     */
    public function store()
    {
        $body = $this->body();

        $camposObrigatorios = [
            'idTecnico',
            'idUsuario',
            'idCategoria',
            'idSLA',
            'titulo',
            'descricao',
            'prioridade'
        ];

        if ($this->missing($body, $camposObrigatorios)) {
            $this->respond([
                'erro' => 'Técnico, usuário, categoria, SLA, título, descrição e prioridade são obrigatórios.'
            ], 400);

            return;
        }

        $camposId = [
            'idTecnico',
            'idUsuario',
            'idCategoria',
            'idSLA'
        ];

        if (!$this->idsDoCorpoValidos($body, $camposId)) {
            $this->respond([
                'erro' => 'Os identificadores devem ser números inteiros maiores que zero.'
            ], 400);

            return;
        }

        if (!$this->existeRegistro('Usuario', 'idUsuario', $body['idUsuario'])) {
            $this->respond([
                'erro' => 'Usuário informado não existe.'
            ], 404);

            return;
        }

        if (!$this->existeRegistro('Tecnico', 'idTecnico', $body['idTecnico'])) {
            $this->respond([
                'erro' => 'Técnico informado não existe.'
            ], 404);

            return;
        }

        if (!$this->existeRegistro('Categoria', 'idCategoria', $body['idCategoria'])) {
            $this->respond([
                'erro' => 'Categoria informada não existe.'
            ], 404);

            return;
        }

        if (!$this->existeRegistro('SLA', 'idSLA', $body['idSLA'])) {
            $this->respond([
                'erro' => 'SLA informado não existe.'
            ], 404);

            return;
        }

        if (!$this->textoValido($body['titulo'])) {
            $this->respond([
                'erro' => 'O título não pode ficar vazio.'
            ], 400);

            return;
        }

        if (!$this->textoValido($body['descricao'])) {
            $this->respond([
                'erro' => 'A descrição não pode ficar vazia.'
            ], 400);

            return;
        }

        if (!$this->prioridadeValida($body['prioridade'])) {
            $this->respond([
                'erro' => 'Prioridade inválida. Use Baixa, Media ou Alta.'
            ], 400);

            return;
        }

        $this->ticket->idTecnico = (int) $body['idTecnico'];
        $this->ticket->idUsuario = (int) $body['idUsuario'];
        $this->ticket->idCategoria = (int) $body['idCategoria'];
        $this->ticket->idSLA = (int) $body['idSLA'];
        $this->ticket->titulo = $body['titulo'];
        $this->ticket->descricao = $body['descricao'];
        $this->ticket->prioridade = $body['prioridade'];

        try {
            $this->db->beginTransaction();

            if (!$this->ticket->create()) {
                throw new RuntimeException('Falha ao criar o ticket.');
            }

            if (!$this->historico->registrar(
                $this->ticket->idTicket,
                $this->idUsuarioAutenticado,
                'Criacao',
                'statusTicket',
                null,
                'Aberto'
            )) {
                throw new RuntimeException('Falha ao registrar o histórico.');
            }

            $this->db->commit();

            // attempt to notify the user by email about the new ticket
            $emailEnviado = false;
            try {
                $ticketCompleto = new Ticket($this->db);
                $ticketCompleto->idTicket = (int) $this->ticket->idTicket;
                if ($ticketCompleto->getById() && !empty($ticketCompleto->emailUsuario)) {
                    $emailService = new EmailService();
                    $emailEnviado = $emailService->enviarNovoTicket(
                        $ticketCompleto->emailUsuario,
                        $ticketCompleto->nomeUsuario ?? 'usuário',
                        (int) $ticketCompleto->idTicket,
                        $ticketCompleto->titulo ?? ''
                    );
                    if (!$emailEnviado) {
                        error_log("Não foi possível enviar o e-mail do ticket #{$this->ticket->idTicket}.");
                    }
                }
            } catch (Throwable $e) {
                // don't break creation flow on email errors
                error_log('Erro ao enviar email de criação de ticket: ' . $e->getMessage());
            }

            $this->respond([
                'mensagem' => 'Ticket criado com sucesso.',
                'idTicket' => (int) $this->ticket->idTicket,
                'emailEnviado' => $emailEnviado,
                'avisoEmail' => $emailEnviado
                    ? null
                    : 'O ticket foi criado, mas o e-mail de confirmação não pôde ser enviado.'
            ], 201);
        } catch (PDOException $erro) {
            $this->desfazerTransacao();

            $this->respond([
                'erro' => 'Não foi possível criar o ticket. Verifique técnico, usuário, categoria e SLA.'
            ], 409);
        } catch (Throwable $erro) {
            $this->desfazerTransacao();

            $this->respond([
                'erro' => 'Não foi possível criar o ticket.'
            ], 500);
        }
    }

    /**
     * PUT /tickets/{id}
     */
    public function update($id)
    {
        if (!$this->idValido($id)) {
            $this->respond([
                'erro' => 'ID do ticket inválido.'
            ], 400);

            return;
        }

        $body = $this->body();

        if (empty($body)) {
            $this->respond([
                'erro' => 'Nenhum dado foi enviado para atualização.'
            ], 400);

            return;
        }

        /*
         * idUsuario não está entre os campos permitidos.
         * O proprietário do ticket não deve ser alterado pelo PUT.
         */
        $camposPermitidos = [
            'titulo',
            'descricao',
            'statusTicket',
            'prioridade',
            'idTecnico',
            'idCategoria',
            'idSLA'
        ];

        $camposRecebidos = array_intersect(
            array_keys($body),
            $camposPermitidos
        );

        if (empty($camposRecebidos)) {
            $this->respond([
                'erro' => 'Nenhum campo válido foi enviado para atualização.'
            ], 400);

            return;
        }

        if (
            array_key_exists('titulo', $body) &&
            !$this->textoValido($body['titulo'])
        ) {
            $this->respond([
                'erro' => 'O título não pode ficar vazio.'
            ], 400);

            return;
        }

        if (
            array_key_exists('descricao', $body) &&
            !$this->textoValido($body['descricao'])
        ) {
            $this->respond([
                'erro' => 'A descrição não pode ficar vazia.'
            ], 400);

            return;
        }

        if (
            array_key_exists('prioridade', $body) &&
            !$this->prioridadeValida($body['prioridade'])
        ) {
            $this->respond([
                'erro' => 'Prioridade inválida. Use Baixa, Media ou Alta.'
            ], 400);

            return;
        }

        if (
            array_key_exists('statusTicket', $body) &&
            !$this->statusValido($body['statusTicket'])
        ) {
            $this->respond([
                'erro' => 'Status inválido. Use Aberto, Em atendimento, Resolvido ou Fechado.'
            ], 400);

            return;
        }

        $camposId = [
            'idTecnico',
            'idCategoria',
            'idSLA'
        ];

        foreach ($camposId as $campo) {
            if (
                array_key_exists($campo, $body) &&
                !$this->idValido($body[$campo])
            ) {
                $this->respond([
                    'erro' => "O campo {$campo} deve ser um número inteiro maior que zero."
                ], 400);

                return;
            }
        }

        try {
            $ticketExistente = new Ticket($this->db);
            $ticketExistente->idTicket = (int) $id;

            if (!$ticketExistente->getById()) {
                $this->respond([
                    'erro' => 'Ticket não encontrado.'
                ], 404);

                return;
            }

            $this->ticket->idTicket = (int) $id;

            if (array_key_exists('titulo', $body)) {
                $this->ticket->titulo = $body['titulo'];
            }

            if (array_key_exists('descricao', $body)) {
                $this->ticket->descricao = $body['descricao'];
            }

            if (array_key_exists('statusTicket', $body)) {
                $this->ticket->statusTicket = $body['statusTicket'];
            }

            if (array_key_exists('prioridade', $body)) {
                $this->ticket->prioridade = $body['prioridade'];
            }

            if (array_key_exists('idTecnico', $body)) {
                $this->ticket->idTecnico = (int) $body['idTecnico'];
            }

            if (array_key_exists('idCategoria', $body)) {
                $this->ticket->idCategoria = (int) $body['idCategoria'];
            }

            if (array_key_exists('idSLA', $body)) {
                $this->ticket->idSLA = (int) $body['idSLA'];
            }

            $alteracoes = $this->montarAlteracoes(
                $ticketExistente,
                $body
            );

            if (empty($alteracoes)) {
                $this->respond([
                    'mensagem' => 'Nenhuma alteração identificada.'
                ]);

                return;
            }

            $this->db->beginTransaction();

            if (!$this->ticket->update()) {
                throw new RuntimeException('Falha ao atualizar o ticket.');
            }

           $statusAlterado = null;

    foreach ($alteracoes as $alteracao) {
        if (!$this->historico->registrar(
            $id,
            $this->idUsuarioAutenticado,
            $this->acaoHistorico($alteracao['campo']),
            $alteracao['campo'],
            $alteracao['valorAnterior'],
            $alteracao['valorNovo']
        )) {
            throw new RuntimeException(
                'Falha ao registrar o histórico.'
            );
        }

        if ($alteracao['campo'] === 'statusTicket') {
            $statusAlterado = $alteracao;
        }
    }

    $this->db->commit();

    if ($statusAlterado !== null) {
        $this->enviarEmailAlteracaoStatus(
            $ticketExistente,
            (string) $statusAlterado['valorNovo']
        );
    }

    $this->respond([
        'mensagem' => 'Ticket atualizado com sucesso.'
    ]);
        } catch (PDOException $erro) {
            $this->desfazerTransacao();

            $this->respond([
                'erro' => 'Não foi possível atualizar o ticket. Verifique os dados relacionados.'
            ], 409);
        } catch (Throwable $erro) {
            $this->desfazerTransacao();

            $this->respond([
                'erro' => 'Não foi possível atualizar o ticket.'
            ], 500);
        }
    }

    /**
     * POST /tickets/{id}/responder-email
     */
    public function responderEmail($id)
    {
        if (!$this->idValido($id)) {
            $this->respond(['erro' => 'ID do ticket inválido.'], 400);
            return;
        }

        $body = $this->body();
        $mensagem = trim((string) ($body['mensagem'] ?? ''));
        $assunto = trim((string) ($body['assunto'] ?? ''));

        if ($mensagem === '') {
            $this->respond(['erro' => 'A mensagem da resposta é obrigatória.'], 422);
            return;
        }

        $ticket = new Ticket($this->db);
        $ticket->idTicket = (int) $id;

        try {
            if (!$ticket->getById()) {
                $this->respond(['erro' => 'Ticket não encontrado.'], 404);
                return;
            }

            if (in_array($ticket->statusTicket, ['Resolvido', 'Fechado'], true)) {
                $this->respond(['erro' => 'Este ticket não aceita novas respostas.'], 409);
                return;
            }

            if (!filter_var($ticket->emailUsuario, FILTER_VALIDATE_EMAIL)) {
                $this->respond(['erro' => 'O solicitante não possui um e-mail válido.'], 422);
                return;
            }

            $emailService = new EmailService();
            $enviado = $emailService->enviarRespostaTicket(
                (string) $ticket->emailUsuario,
                (string) ($ticket->nomeUsuario ?: 'cliente'),
                (int) $ticket->idTicket,
                (string) $ticket->titulo,
                strip_tags($mensagem),
                strip_tags($assunto)
            );

            if (!$enviado) {
                $this->respond(['erro' => 'Não foi possível enviar o e-mail. Verifique a configuração SMTP.'], 502);
                return;
            }

            $stmt = $this->db->prepare(
                'INSERT INTO respostaTicket (idUsuario, idTicket, msgTicket, dataResposta) VALUES (?, ?, ?, NOW())'
            );
            $stmt->execute([
                $this->idUsuarioAutenticado,
                (int) $id,
                strip_tags($mensagem),
            ]);

            $this->respond([
                'mensagem' => 'Resposta enviada por e-mail com sucesso.',
                'idRespostaTicket' => (int) $this->db->lastInsertId(),
                'destinatario' => $ticket->emailUsuario,
            ], 201);
        } catch (Throwable $erro) {
            error_log('TicketController::responderEmail - ' . $erro->getMessage());
            $this->respond(['erro' => 'Não foi possível concluir o envio da resposta.'], 500);
        }
    }

    /**
     * DELETE /tickets/{id}
     */
    public function destroy($id)
    {
        if (!$this->idValido($id)) {
            $this->respond([
                'erro' => 'ID do ticket inválido.'
            ], 400);

            return;
        }

        try {
            $ticketExistente = new Ticket($this->db);
            $ticketExistente->idTicket = (int) $id;

            if (!$ticketExistente->getById()) {
                $this->respond([
                    'erro' => 'Ticket não encontrado.'
                ], 404);

                return;
            }

            $this->ticket->idTicket = (int) $id;

            $this->db->beginTransaction();

            // Remove todos os registros que possuem FK para Ticket.
            // Isso tambÃ©m cobre tabelas antigas sem ON DELETE CASCADE.
            $dependencias = $this->db->query(
                "SELECT DISTINCT TABLE_NAME, COLUMN_NAME
                 FROM information_schema.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_TABLE_NAME = 'Ticket'
                   AND TABLE_NAME <> 'Ticket'"
            )->fetchAll(PDO::FETCH_ASSOC);

            foreach ($dependencias as $dependencia) {
                $tabela = str_replace('`', '``', (string) $dependencia['TABLE_NAME']);
                $coluna = str_replace('`', '``', (string) $dependencia['COLUMN_NAME']);

                if ($tabela === '' || $coluna === '') {
                    continue;
                }

                $stmt = $this->db->prepare(
                    "DELETE FROM `{$tabela}` WHERE `{$coluna}` = ?"
                );
                $stmt->execute([(int) $id]);
            }

            if (!$this->ticket->delete()) {
                $this->desfazerTransacao();

                $this->respond([
                    'erro' => 'Não foi possível remover o ticket.'
                ], 500);

                return;
            }

            $this->db->commit();

            $this->respond([
                'mensagem' => 'Ticket removido com sucesso.'
            ]);
        } catch (PDOException $erro) {
            $this->desfazerTransacao();
            $this->respond([
                'erro' => 'O ticket possui registros vinculados e não pode ser removido.'
            ], 409);
        } catch (Throwable $erro) {
            $this->desfazerTransacao();

            $this->respond([
                'erro' => 'NÃ£o foi possÃ­vel remover o ticket.'
            ], 500);
        }
    }

    private function montarAlteracoes(
        Ticket $ticketExistente,
        array $body
    ) {
        $camposNumericos = [
            'idTecnico',
            'idCategoria',
            'idSLA'
        ];

        $camposRastreados = [
            'titulo',
            'descricao',
            'statusTicket',
            'prioridade',
            'idTecnico',
            'idCategoria',
            'idSLA'
        ];

        $alteracoes = [];

        foreach ($camposRastreados as $campo) {
            if (!array_key_exists($campo, $body)) {
                continue;
            }

            $valorAnterior = $ticketExistente->$campo;
            $valorNovo = in_array($campo, $camposNumericos, true)
                ? (int) $body[$campo]
                : $this->limparTextoHistorico($body[$campo]);

            if ((string) $valorAnterior === (string) $valorNovo) {
                continue;
            }

            $alteracoes[] = [
                'campo' => $campo,
                'valorAnterior' => $valorAnterior,
                'valorNovo' => $valorNovo
            ];
        }

        return $alteracoes;
    }

    private function acaoHistorico($campo)
    {
        if ($campo === 'statusTicket') {
            return 'AlteracaoStatus';
        }

        if ($campo === 'prioridade') {
            return 'AlteracaoPrioridade';
        }

        if ($campo === 'idTecnico') {
            return 'Reatribuicao';
        }

        return 'Atualizacao';
    }

    private function limparTextoHistorico($valor)
    {
        return trim(strip_tags((string) $valor));
    }

    private function desfazerTransacao()
    {
        if ($this->db->inTransaction()) {
            $this->db->rollBack();
        }
    }

    private function idValido($id)
    {
        return filter_var(
            $id,
            FILTER_VALIDATE_INT,
            [
                'options' => [
                    'min_range' => 1
                ]
            ]
        ) !== false;
    }

    private function idsDoCorpoValidos(array $body, array $campos)
    {
        foreach ($campos as $campo) {
            if (
                !array_key_exists($campo, $body) ||
                !$this->idValido($body[$campo])
            ) {
                return false;
            }
        }

        return true;
    }

    private function textoValido($valor)
    {
        return is_string($valor) && trim($valor) !== '';
    }

    private function prioridadeValida($prioridade)
    {
        return is_string($prioridade) &&
            in_array(trim($prioridade), self::PRIORIDADES_VALIDAS, true);
    }

    private function statusValido($status)
    {
        return is_string($status) &&
            in_array(trim($status), self::STATUS_VALIDOS, true);
    }
    private function enviarEmailAlteracaoStatus(Ticket $ticketExistente, string $statusNovo): void
{
    try {
        if (empty($ticketExistente->emailUsuario)) {
            return;
        }

        $emailService = new EmailService();

        $emailService->enviarStatusTicket(
            $ticketExistente->emailUsuario,
            $ticketExistente->nomeUsuario ?? 'usuário',
            (int) $ticketExistente->idTicket,
            $ticketExistente->titulo ?? 'Sem título',
            $ticketExistente->statusTicket ?? 'Não informado',
            $statusNovo
        );
    } catch (Throwable $erro) {
        error_log('Erro ao enviar email de status do ticket: ' . $erro->getMessage());
    }
}
}
