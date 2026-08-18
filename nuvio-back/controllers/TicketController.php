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
                    'dataFechamento' => $this->ticket->dataFechamento
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

            $this->respond([
                'mensagem' => 'Ticket criado com sucesso.',
                'idTicket' => (int) $this->ticket->idTicket
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

            if (!$this->ticket->delete()) {
                $this->respond([
                    'erro' => 'Não foi possível remover o ticket.'
                ], 500);

                return;
            }

            $this->respond([
                'mensagem' => 'Ticket removido com sucesso.'
            ]);
        } catch (PDOException $erro) {
            $this->respond([
                'erro' => 'O ticket possui registros vinculados e não pode ser removido.'
            ], 409);
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
