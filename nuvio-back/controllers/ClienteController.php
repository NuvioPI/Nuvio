<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/usuario.php';
require_once __DIR__ . '/../services/EmailService.php';

class ClienteController extends BaseController
{
    private Usuario $usuario;

    public function __construct()
    {
        parent::__construct();
        $this->usuario = new Usuario($this->db);
    }

    public function store(): void
    {
        $body = $this->body();
        $nome = $this->texto($body['nome'] ?? '', 85);
        $sobrenome = $this->texto($body['sobrenome'] ?? '', 85);
        $email = strtolower($this->texto($body['email'] ?? '', 100));

        if ($nome === '' || $email === '') {
            $this->respond(['erro' => 'Nome e e-mail são obrigatórios.'], 422);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->respond(['erro' => 'Informe um e-mail válido.'], 422);
            return;
        }

        try {
            // Permite a publicação desta funcionalidade em bancos que ainda tenham
            // somente as tabelas originais do projeto.
            $this->garantirEstruturaCliente();

            if ($this->usuario->emailExiste($email)) {
                $this->respond(['erro' => 'Já existe um cliente cadastrado com este e-mail.'], 409);
                return;
            }

            $this->db->beginTransaction();

            $tipoCliente = $this->db->query(
                "SELECT idtipoUsuario FROM tipoUsuario WHERE descricao = 'Cliente' LIMIT 1"
            )->fetchColumn();
            if (!$tipoCliente) {
                throw new RuntimeException('O tipo de usuário Cliente não foi configurado.');
            }

            $this->usuario->idtipoUsuario = (int) $tipoCliente;
            $this->usuario->nome = $this->texto(trim($nome . ' ' . $sobrenome), 85);
            $this->usuario->email = $email;
            // O contato não recebe uma senha por esta tela. Um valor aleatório impede login
            // até que um fluxo próprio de ativação/redefinição de senha seja concluído.
            $this->usuario->senhaHash = password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT);
            $this->usuario->cargo = $this->texto($body['cargo'] ?? '', 55);
            $this->usuario->setor = $this->texto($body['empresa'] ?? '', 55);
            $this->usuario->telefone = $this->texto($body['telefone'] ?? '', 25);

            if (!$this->usuario->create()) {
                throw new RuntimeException('Não foi possível criar o usuário do cliente.');
            }

            $preferencias = [
                'sobrenome' => $sobrenome,
                'empresa' => $this->texto($body['empresa'] ?? '', 120),
                'site' => $this->texto($body['site'] ?? '', 255),
                'idioma' => $this->texto($body['idioma'] ?? 'Português (BR)', 50),
                'timezone' => $this->texto($body['timezone'] ?? 'America/Sao_Paulo (UTC -3)', 80),
                'observacoes' => $this->texto($body['observacoes'] ?? '', 65535),
                'emailBoasVindas' => $this->booleano($body['emailBoasVindas'] ?? true),
                'verificado' => $this->booleano($body['verificado'] ?? false),
                'inscrito' => $this->booleano($body['inscrito'] ?? true),
            ];

            $perfil = $this->db->prepare(
                'INSERT INTO ClientePerfil
                    (idUsuario, sobrenome, empresa, site, idioma, timezone, observacoes, emailBoasVindas, verificado, inscrito)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $perfil->execute([
                $this->usuario->idUsuario,
                $preferencias['sobrenome'], $preferencias['empresa'], $preferencias['site'],
                $preferencias['idioma'], $preferencias['timezone'], $preferencias['observacoes'],
                $preferencias['emailBoasVindas'], $preferencias['verificado'], $preferencias['inscrito'],
            ]);

            $this->salvarTags($this->usuario->idUsuario, $body['tags'] ?? []);
            $this->db->commit();

            $emailEnviado = false;
            if ($preferencias['emailBoasVindas']) {
                try {
                    $emailEnviado = (new EmailService())->enviarBoasVindasCliente($email, $this->usuario->nome);
                } catch (Throwable $erroEmail) {
                    // O cadastro já foi confirmado. Falha no serviço de e-mail não pode
                    // alterar o resultado da operação nem impedir a resposta de sucesso.
                    error_log('Falha ao enviar boas-vindas para cliente: ' . $erroEmail->getMessage());
                }
            }

            $this->respond([
                'mensagem' => 'Cliente cadastrado com sucesso.',
                'idUsuario' => (int) $this->usuario->idUsuario,
                'emailBoasVindasEnviado' => $emailEnviado,
            ], 201);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('Falha ao cadastrar cliente: ' . $e->getMessage());
            $mensagem = $e instanceof PDOException
                ? 'Não foi possível preparar o banco para salvar o perfil do cliente.'
                : 'Não foi possível cadastrar o cliente.';
            $this->respond(['erro' => $mensagem], 500);
        }
    }

    private function garantirEstruturaCliente(): void
    {
        $this->db->exec(
            "INSERT INTO tipoUsuario (descricao)
             SELECT 'Cliente'
             WHERE NOT EXISTS (SELECT 1 FROM tipoUsuario WHERE descricao = 'Cliente')"
        );

        $this->db->exec(
            'CREATE TABLE IF NOT EXISTS ClientePerfil (
                idUsuario INT PRIMARY KEY,
                sobrenome VARCHAR(85) NULL,
                empresa VARCHAR(120) NULL,
                site VARCHAR(255) NULL,
                idioma VARCHAR(50) NOT NULL DEFAULT \'Português (BR)\',
                timezone VARCHAR(80) NOT NULL DEFAULT \'America/Sao_Paulo (UTC -3)\',
                observacoes TEXT NULL,
                emailBoasVindas BOOLEAN NOT NULL DEFAULT TRUE,
                verificado BOOLEAN NOT NULL DEFAULT FALSE,
                inscrito BOOLEAN NOT NULL DEFAULT TRUE,
                CONSTRAINT fk_cliente_perfil_usuario
                    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE
            )'
        );
        $this->db->exec(
            'CREATE TABLE IF NOT EXISTS ClienteTag (
                idClienteTag INT PRIMARY KEY AUTO_INCREMENT,
                nome VARCHAR(50) NOT NULL UNIQUE
            )'
        );
        $this->db->exec(
            'CREATE TABLE IF NOT EXISTS ClientePerfilTag (
                idUsuario INT NOT NULL,
                idClienteTag INT NOT NULL,
                PRIMARY KEY (idUsuario, idClienteTag),
                CONSTRAINT fk_cliente_perfil_tag_usuario
                    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
                CONSTRAINT fk_cliente_perfil_tag_tag
                    FOREIGN KEY (idClienteTag) REFERENCES ClienteTag(idClienteTag) ON DELETE CASCADE
            )'
        );
    }

    private function salvarTags(int $idUsuario, $tags): void
    {
        if (!is_array($tags)) return;

        $inserirTag = $this->db->prepare('INSERT IGNORE INTO ClienteTag (nome) VALUES (?)');
        $buscarTag = $this->db->prepare('SELECT idClienteTag FROM ClienteTag WHERE nome = ? LIMIT 1');
        $vincular = $this->db->prepare('INSERT IGNORE INTO ClientePerfilTag (idUsuario, idClienteTag) VALUES (?, ?)');

        foreach (array_unique($tags) as $tag) {
            $nome = $this->texto($tag, 50);
            if ($nome === '') continue;
            $inserirTag->execute([$nome]);
            $buscarTag->execute([$nome]);
            $idTag = $buscarTag->fetchColumn();
            if ($idTag) $vincular->execute([$idUsuario, $idTag]);
        }
    }

    private function texto($valor, int $limite): string
    {
        return mb_substr(trim(is_scalar($valor) ? (string) $valor : ''), 0, $limite);
    }

    private function booleano($valor): int
    {
        return filter_var($valor, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    }
}
