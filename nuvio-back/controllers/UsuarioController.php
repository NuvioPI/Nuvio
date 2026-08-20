<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/usuario.php';

class UsuarioController extends BaseController
{
    private Usuario $usuario;

    public function __construct()
    {
        parent::__construct();
        $this->usuario = new Usuario($this->db);
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

    public function destroy($id): void
    {
        $this->usuario->idUsuario = $id;

        if ($this->usuario->delete()) {
            $this->respond(['mensagem' => 'Usuário removido com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Usuário não encontrado.'], 404);
    }

    private function texto($valor, int $limite): string
    {
        $texto = trim(is_scalar($valor) ? (string) $valor : '');
        return function_exists('mb_substr') ? mb_substr($texto, 0, $limite) : substr($texto, 0, $limite);
    }
}
