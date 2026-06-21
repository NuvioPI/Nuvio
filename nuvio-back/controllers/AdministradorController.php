<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Administrador.php';

class AdministradorController extends BaseController
{
    private $administrador;

    public function __construct()
    {
        parent::__construct();
        $this->administrador = new Administrador($this->db);
    }

    public function index()
    {
        if (isset($_GET['idUsuario'])) {
            $this->administrador->idUsuario = (int)$_GET['idUsuario'];

            if (!$this->administrador->getByUsuario()) {
                $this->respond(['erro' => 'Administrador não encontrado para este usuário.'], 404);
                return;
            }

            $this->respond(['administrador' => $this->toArray()]);
            return;
        }

        $this->respond(['administradores' => $this->rows($this->administrador->getAll())]);
    }

    public function show($id)
    {
        $this->administrador->idAdministrador = $id;

        if (!$this->administrador->getById()) {
            $this->respond(['erro' => 'Administrador não encontrado.'], 404);
            return;
        }

        $this->respond(['administrador' => $this->toArray()]);
    }

    public function store()
    {
        $body = $this->body();

        if ($this->missing($body, ['idUsuario', 'nivelAcesso'])) {
            $this->respond(['erro' => 'Usuário e nível de acesso são obrigatórios.'], 400);
            return;
        }

        $this->fill($body);

        if ($this->administrador->create()) {
            $this->respond([
                'mensagem' => 'Administrador criado com sucesso.',
                'idAdministrador' => (int)$this->administrador->idAdministrador,
            ], 201);
            return;
        }

        $this->respond(['erro' => 'Não foi possível criar o administrador. Verifique usuário duplicado ou nível inválido.'], 409);
    }

    public function update($id)
    {
        $body = $this->body();

        if ($this->missing($body, ['nivelAcesso'])) {
            $this->respond(['erro' => 'Nível de acesso é obrigatório.'], 400);
            return;
        }

        $this->administrador->idAdministrador = $id;
        $this->fill($body, false);

        if ($this->administrador->updatePermissoes()) {
            $this->respond(['mensagem' => 'Permissões do administrador atualizadas com sucesso.']);
            return;
        }

        $this->respond(['erro' => 'Não foi possível atualizar as permissões.'], 400);
    }

    public function destroy($id)
    {
        $this->respond(['erro' => 'Remoção de administrador não está disponível no model atual.'], 405);
    }

    private function fill(array $body, $includeUsuario = true)
    {
        if ($includeUsuario) {
            $this->administrador->idUsuario = (int)$body['idUsuario'];
        }

        $this->administrador->nivelAcesso = $body['nivelAcesso'];
        $this->administrador->podeGerenciarUsuarios = !empty($body['podeGerenciarUsuarios']);
        $this->administrador->podeConfigurarSLA = !empty($body['podeConfigurarSLA']);
        $this->administrador->podeVerRelatorios = array_key_exists('podeVerRelatorios', $body)
            ? (bool)$body['podeVerRelatorios']
            : true;
    }

    private function toArray()
    {
        return [
            'idAdministrador' => (int)$this->administrador->idAdministrador,
            'idUsuario' => (int)$this->administrador->idUsuario,
            'nivelAcesso' => $this->administrador->nivelAcesso,
            'podeGerenciarUsuarios' => (bool)$this->administrador->podeGerenciarUsuarios,
            'podeConfigurarSLA' => (bool)$this->administrador->podeConfigurarSLA,
            'podeVerRelatorios' => (bool)$this->administrador->podeVerRelatorios,
            'ultimoAcesso' => $this->administrador->ultimoAcesso,
        ];
    }
}
