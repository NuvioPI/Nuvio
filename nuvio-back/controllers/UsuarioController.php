<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/usuario.php';

class UsuarioController extends BaseController
{
    private Usuario $usuario;
    private ?int $idUsuarioAutenticado;

    public function __construct(?int $idUsuarioAutenticado = null)
    {
        parent::__construct();
        $this->usuario = new Usuario($this->db);
        $this->idUsuarioAutenticado = $idUsuarioAutenticado;
    }

    public function index(): void
    {
        $this->respond(['usuarios' => $this->rows($this->usuario->getAll())]);
    }

    public function show($id): void
    {
        $usuario = $this->usuario->find($id);

        if (!$usuario) {
            $this->respond(['erro' => 'Usuário não encontrado.'], 404);
            return;
        }

        $this->respond(['usuario' => $usuario]);
    }

    public function store(): void
    {
        $body = $this->body();
        $nome = $this->texto($body['nome'] ?? '', 85);
        $email = strtolower($this->texto($body['email'] ?? '', 100));
        $senha = is_scalar($body['senha'] ?? null) ? (string) $body['senha'] : '';
        $idTipo = filter_var($body['idtipoUsuario'] ?? null, FILTER_VALIDATE_INT);

        if ($nome === '' || $email === '' || $senha === '' || !$idTipo) {
            $this->respond(['erro' => 'Nome, e-mail, senha e perfil são obrigatórios.'], 422);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->respond(['erro' => 'Informe um e-mail válido.'], 422);
            return;
        }
        if (strlen($senha) < 8) {
            $this->respond(['erro' => 'A senha deve ter pelo menos 8 caracteres.'], 422);
            return;
        }

        try {
            if ($this->usuario->emailExiste($email)) {
                $this->respond(['erro' => 'Já existe um usuário cadastrado com este e-mail.'], 409);
                return;
            }

            $tipo = $this->db->prepare('SELECT idtipoUsuario, descricao FROM tipoUsuario WHERE idtipoUsuario = ? LIMIT 1');
            $tipo->execute([(int) $idTipo]);
            $tipoRegistro = $tipo->fetch(PDO::FETCH_ASSOC);
            if (!$tipoRegistro) {
                $this->respond(['erro' => 'O perfil selecionado não existe.'], 422);
                return;
            }

            $this->db->beginTransaction();
            $this->usuario->idtipoUsuario = (int) $idTipo;
            $this->usuario->nome = $nome;
            $this->usuario->email = $email;
            $this->usuario->senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            $this->usuario->cargo = $this->texto($body['cargo'] ?? '', 55);
            $this->usuario->setor = $this->texto($body['setor'] ?? '', 55);
            $this->usuario->telefone = $this->texto($body['telefone'] ?? '', 25);

            if (!$this->usuario->create()) {
                throw new RuntimeException('O modelo não conseguiu inserir o usuário.');
            }

            // Usuários técnicos e administradores precisam do registro auxiliar
            // correspondente para aparecerem nas telas e regras do sistema.
            if ($tipoRegistro['descricao'] === 'Técnico') {
                $tecnico = $this->db->prepare(
                    'INSERT INTO Tecnico (idUsuario, especialidade, ativo) VALUES (?, ?, TRUE)'
                );
                $tecnico->execute([$this->usuario->idUsuario, $this->usuario->cargo ?: 'Atendimento geral']);
            } elseif ($tipoRegistro['descricao'] === 'Administrador') {
                $administrador = $this->db->prepare(
                    'INSERT INTO Administrador (idUsuario, nivelAcesso, podeGerenciarUsuarios, podeConfigurarSLA, podeVerRelatorios)
                     VALUES (?, ?, FALSE, FALSE, TRUE)'
                );
                $administrador->execute([$this->usuario->idUsuario, 'padrao']);
            }

            $this->db->commit();

            $this->respond([
                'mensagem' => 'Usuário criado com sucesso.',
                'idUsuario' => (int) $this->usuario->idUsuario,
            ], 201);
        } catch (PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log(sprintf('Erro ao cadastrar usuário "%s": %s em %s:%d', $email, $e->getMessage(), $e->getFile(), $e->getLine()));
            if ((string) $e->getCode() === '23000') {
                $this->respond(['erro' => 'Já existe um usuário cadastrado com este e-mail.'], 409);
                return;
            }
            $this->respond(['erro' => 'Não foi possível salvar o usuário no banco de dados.'], 500);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log(sprintf('Erro ao cadastrar usuário "%s": %s em %s:%d', $email, $e->getMessage(), $e->getFile(), $e->getLine()));
            $this->respond(['erro' => 'Não foi possível cadastrar o usuário.'], 500);
        }
    }

    public function update($id): void
    {
        $body = $this->body();

        if ($this->missing($body, ['nome', 'email'])) {
            $this->respond(['erro' => 'Nome e e-mail são obrigatórios.'], 400);
            return;
        }

        $this->usuario->idUsuario = $id;

        if (!$this->usuario->get()) {
            $this->respond(['erro' => 'Usuário não encontrado.'], 404);
            return;
        }

        $this->usuario->nome = $this->texto($body['nome'], 85);
        $this->usuario->email = strtolower($this->texto($body['email'], 100));
        $this->usuario->cargo = $this->texto($body['cargo'] ?? $this->usuario->cargo, 55);
        $this->usuario->setor = $this->texto($body['setor'] ?? $this->usuario->setor, 55);

        if ($this->usuario->update()) {
            if (!empty($body['senha'])) {
                $this->usuario->updateSenha(password_hash($body['senha'], PASSWORD_DEFAULT));
            }

            $this->respond(['mensagem' => 'Usuário atualizado com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível atualizar o usuário.'], 500);
    }

    public function manage($id): void
    {
        $id = (int) $id;
        $body = $this->body();

        if ($id <= 0) {
            $this->respond(['erro' => 'ID do usuário inválido.'], 400);
            return;
        }

        $this->usuario->idUsuario = $id;
        if (!$this->usuario->get()) {
            $this->respond(['erro' => 'Usuário não encontrado.'], 404);
            return;
        }

        $perfilAtual = $this->buscarPerfilAtual($id);
        $perfil = $this->normalizarPerfil($body['perfil'] ?? ($perfilAtual['perfil'] ?? 'Cliente'));

        if ($perfil === null) {
            $this->respond(['erro' => 'Perfil inválido. Use Cliente, Técnico, Gerente ou Administrador.'], 422);
            return;
        }

        if (
            $id === $this->idUsuarioAutenticado &&
            ($perfilAtual['perfil'] ?? '') !== $perfil
        ) {
            $this->respond(['erro' => 'Você não pode alterar o próprio perfil administrativo.'], 409);
            return;
        }

        $nome = $this->texto($body['nome'] ?? $this->usuario->nome, 85);
        $email = strtolower($this->texto($body['email'] ?? $this->usuario->email, 100));

        if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->respond(['erro' => 'Informe nome e e-mail válidos.'], 422);
            return;
        }

        $emailStmt = $this->db->prepare(
            'SELECT 1 FROM Usuario WHERE email = ? AND idUsuario <> ? LIMIT 1'
        );
        $emailStmt->execute([$email, $id]);
        if ($emailStmt->fetchColumn()) {
            $this->respond(['erro' => 'Este e-mail já está em uso por outro usuário.'], 409);
            return;
        }

        $nomeTipo = $perfil === 'Gerente' ? 'Administrador' : $perfil;
        $idTipo = $this->buscarIdTipo($nomeTipo);
        if (!$idTipo) {
            $this->respond(['erro' => 'O tipo de usuário selecionado não está configurado.'], 409);
            return;
        }

        try {
            $this->db->beginTransaction();

            $this->usuario->idtipoUsuario = $idTipo;
            $this->usuario->nome = $nome;
            $this->usuario->email = $email;
            $this->usuario->cargo = $this->texto($body['cargo'] ?? $this->usuario->cargo, 55);
            $this->usuario->setor = $this->texto($body['setor'] ?? $this->usuario->setor, 55);

            if (!$this->usuario->update()) {
                throw new RuntimeException('Não foi possível atualizar os dados do usuário.');
            }

            $this->sincronizarPerfil($id, $perfil);

            if (array_key_exists('verificado', $body)) {
                $this->atualizarVerificado($id, $this->booleano($body['verificado']));
            }

            if (!empty($body['senha'])) {
                $senha = (string) $body['senha'];
                if (strlen($senha) < 8) {
                    throw new InvalidArgumentException('A senha deve ter pelo menos 8 caracteres.');
                }
                $this->usuario->updateSenha(password_hash($senha, PASSWORD_DEFAULT));
            }

            $this->db->commit();
            $this->respond(['mensagem' => 'Usuário atualizado com sucesso.']);
        } catch (PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('Erro ao gerenciar usuário: ' . $e->getMessage());
            $this->respond(['erro' => 'Não foi possível salvar as alterações do usuário.'], 409);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('Erro ao gerenciar usuário: ' . $e->getMessage());
            $this->respond(['erro' => 'Não foi possível concluir o gerenciamento do usuário.'], 422);
        }
    }

    public function destroy($id): void
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->respond(['erro' => 'ID do usuário inválido.'], 400);
            return;
        }

        if ($id === $this->idUsuarioAutenticado) {
            $this->respond(['erro' => 'Você não pode excluir o próprio usuário administrador.'], 409);
            return;
        }

        $this->usuario->idUsuario = $id;

        if (!$this->usuario->get()) {
            $this->respond(['erro' => 'Usuário não encontrado.'], 404);
            return;
        }

        try {
            $this->db->beginTransaction();
            $this->removerTicketsDoUsuario($id);

            if ($this->tabelaExiste('ClientePerfilTag')) {
                $this->db->prepare('DELETE FROM ClientePerfilTag WHERE idUsuario = ?')->execute([$id]);
            }
            if ($this->tabelaExiste('ClientePerfil')) {
                $this->db->prepare('DELETE FROM ClientePerfil WHERE idUsuario = ?')->execute([$id]);
            }

            $this->db->prepare('DELETE FROM Administrador WHERE idUsuario = ?')->execute([$id]);
            $this->db->prepare('DELETE FROM Tecnico WHERE idUsuario = ?')->execute([$id]);

            if (!$this->usuario->delete()) {
                throw new RuntimeException('Não foi possível remover o usuário.');
            }

            $this->db->commit();
            $this->respond(['mensagem' => 'Usuário removido com sucesso.']);
            return;
        } catch (PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('Erro ao remover usuário: ' . $e->getMessage());
            $this->respond(['erro' => 'Não foi possível remover o usuário porque existem registros vinculados.'], 409);
            return;
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $this->respond(['erro' => 'Não foi possível remover o usuário.'], 500);
            return;
        }
    }

    private function buscarPerfilAtual(int $id): array
    {
        $stmt = $this->db->prepare(
            "SELECT tu.descricao AS tipo, COALESCE(a.nivelAcesso, '') AS nivelAcesso
             FROM Usuario u
             LEFT JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
             LEFT JOIN Administrador a ON a.idUsuario = u.idUsuario
             WHERE u.idUsuario = ?
             LIMIT 1"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $tipo = (string) ($row['tipo'] ?? 'Cliente');
        $perfil = $tipo === 'Administrador' && ($row['nivelAcesso'] ?? '') === 'gerente'
            ? 'Gerente'
            : $tipo;

        return ['perfil' => $perfil, 'tipo' => $tipo, 'nivelAcesso' => $row['nivelAcesso'] ?? null];
    }

    private function normalizarPerfil($valor): ?string
    {
        $perfil = normalizarRole((string) $valor);

        return match ($perfil) {
            'cliente' => 'Cliente',
            'tecnico' => 'Técnico',
            'gerente' => 'Gerente',
            'administrador', 'admin' => 'Administrador',
            default => null,
        };
    }

    private function buscarIdTipo(string $tipo): ?int
    {
        $stmt = $this->db->prepare(
            'SELECT idtipoUsuario FROM tipoUsuario WHERE descricao = ? LIMIT 1'
        );
        $stmt->execute([$tipo]);
        $id = $stmt->fetchColumn();
        return $id === false ? null : (int) $id;
    }

    private function sincronizarPerfil(int $idUsuario, string $perfil): void
    {
        $ehAdmin = in_array($perfil, ['Administrador', 'Gerente'], true);

        if ($ehAdmin) {
            $nivel = $perfil === 'Gerente' ? 'gerente' : 'super';
            $admin = $this->db->prepare(
                'SELECT idAdministrador FROM Administrador WHERE idUsuario = ? LIMIT 1'
            );
            $admin->execute([$idUsuario]);
            $idAdmin = $admin->fetchColumn();

            if ($idAdmin) {
                $stmt = $this->db->prepare(
                    'UPDATE Administrador
                     SET nivelAcesso = ?, podeGerenciarUsuarios = TRUE,
                         podeConfigurarSLA = ?, podeVerRelatorios = TRUE
                     WHERE idUsuario = ?'
                );
                $stmt->execute([$nivel, $perfil === 'Administrador' ? 1 : 0, $idUsuario]);
            } else {
                $stmt = $this->db->prepare(
                    'INSERT INTO Administrador
                        (idUsuario, nivelAcesso, podeGerenciarUsuarios, podeConfigurarSLA, podeVerRelatorios)
                     VALUES (?, ?, TRUE, ?, TRUE)'
                );
                $stmt->execute([$idUsuario, $nivel, $perfil === 'Administrador' ? 1 : 0]);
            }
        } else {
            $this->db->prepare('DELETE FROM Administrador WHERE idUsuario = ?')->execute([$idUsuario]);
        }

        if ($perfil === 'Técnico') {
            $tecnico = $this->db->prepare(
                'SELECT idTecnico FROM Tecnico WHERE idUsuario = ? LIMIT 1'
            );
            $tecnico->execute([$idUsuario]);
            $idTecnico = $tecnico->fetchColumn();

            if ($idTecnico) {
                $this->db->prepare('UPDATE Tecnico SET ativo = TRUE WHERE idUsuario = ?')->execute([$idUsuario]);
            } else {
                $this->db->prepare(
                    'INSERT INTO Tecnico (idUsuario, especialidade, ativo) VALUES (?, ?, TRUE)'
                )->execute([$idUsuario, 'Atendimento geral']);
            }
        } else {
            // Mantém a linha para não quebrar tickets antigos, mas impede novos atendimentos.
            $this->db->prepare('UPDATE Tecnico SET ativo = FALSE WHERE idUsuario = ?')->execute([$idUsuario]);
        }
    }

    private function atualizarVerificado(int $idUsuario, bool $verificado): void
    {
        if (!$this->tabelaExiste('ClientePerfil')) {
            return;
        }

        $existe = $this->db->prepare('SELECT 1 FROM ClientePerfil WHERE idUsuario = ? LIMIT 1');
        $existe->execute([$idUsuario]);

        if ($existe->fetchColumn()) {
            $this->db->prepare('UPDATE ClientePerfil SET verificado = ? WHERE idUsuario = ?')
                ->execute([$verificado ? 1 : 0, $idUsuario]);
            return;
        }

        $this->db->prepare(
            'INSERT INTO ClientePerfil (idUsuario, verificado) VALUES (?, ?)'
        )->execute([$idUsuario, $verificado ? 1 : 0]);
    }

    private function removerTicketsDoUsuario(int $idUsuario): void
    {
        $tecnicos = $this->db->prepare('SELECT idTecnico FROM Tecnico WHERE idUsuario = ?');
        $tecnicos->execute([$idUsuario]);
        $idsTecnicos = array_map('intval', $tecnicos->fetchAll(PDO::FETCH_COLUMN));

        $condicoes = ['idUsuario = ?'];
        $parametros = [$idUsuario];
        if ($idsTecnicos !== []) {
            $marcadores = implode(',', array_fill(0, count($idsTecnicos), '?'));
            $condicoes[] = "idTecnico IN ({$marcadores})";
            $parametros = array_merge($parametros, $idsTecnicos);
        }

        $stmt = $this->db->prepare(
            'SELECT idTicket FROM Ticket WHERE ' . implode(' OR ', $condicoes)
        );
        $stmt->execute($parametros);
        $idsTickets = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));

        if ($idsTickets !== []) {
            $this->removerPorLista('respostaTicket', 'idTicket', $idsTickets);
            $this->removerPorLista('anexo', 'idTicket', $idsTickets);
            $this->removerPorLista('avaliacaoTicket', 'idTicket', $idsTickets);
            if ($this->tabelaExiste('HistoricoTicket')) {
                $this->removerPorLista('HistoricoTicket', 'idTicket', $idsTickets);
            }
            $this->removerPorLista('Ticket', 'idTicket', $idsTickets);
        }

        $this->db->prepare('DELETE FROM respostaTicket WHERE idUsuario = ?')->execute([$idUsuario]);
        $this->db->prepare('DELETE FROM avaliacaoTicket WHERE idUsuario = ?')->execute([$idUsuario]);
        if ($this->tabelaExiste('HistoricoTicket')) {
            $this->db->prepare('DELETE FROM HistoricoTicket WHERE idUsuario = ?')->execute([$idUsuario]);
        }
    }

    private function removerPorLista(string $tabela, string $coluna, array $ids): void
    {
        if ($ids === []) {
            return;
        }

        $marcadores = implode(',', array_fill(0, count($ids), '?'));
        $this->db->prepare(
            "DELETE FROM `{$tabela}` WHERE `{$coluna}` IN ({$marcadores})"
        )->execute($ids);
    }

    private function tabelaExiste(string $tabela): bool
    {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?'
        );
        $stmt->execute([$tabela]);
        return (int) $stmt->fetchColumn() > 0;
    }

    private function booleano($valor): bool
    {
        $resultado = filter_var($valor, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        return $resultado === null ? (bool) $valor : $resultado;
    }

    private function texto($valor, int $limite): string
    {
        $texto = trim(is_scalar($valor) ? (string) $valor : '');
        return function_exists('mb_substr') ? mb_substr($texto, 0, $limite) : substr($texto, 0, $limite);
    }
}
