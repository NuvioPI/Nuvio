<?php

class Administrador
{
    private $conn;
    private $tabela = "Administrador";

    public $idAdministrador;
    public $idUsuario;
    public $nivelAcesso;
    public $podeGerenciarUsuarios;
    public $podeConfigurarSLA;
    public $podeVerRelatorios;
    public $ultimoAcesso;

    private $niveisPermitidos = ['padrao', 'super'];

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    // Listar todos os administradores com dados do usuário
    public function getAll()
    {
        $query = "
            SELECT
                a.idAdministrador,
                a.idUsuario,
                a.nivelAcesso,
                a.podeGerenciarUsuarios,
                a.podeConfigurarSLA,
                a.podeVerRelatorios,
                a.ultimoAcesso,
                u.nome,
                u.email,
                u.cargo,
                u.setor
            FROM " . $this->tabela . " a
            INNER JOIN Usuario u ON a.idUsuario = u.idUsuario
            ORDER BY a.nivelAcesso ASC, u.nome ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar administrador por idAdministrador
    public function getById()
    {
        $query = "
            SELECT
                a.idAdministrador,
                a.idUsuario,
                a.nivelAcesso,
                a.podeGerenciarUsuarios,
                a.podeConfigurarSLA,
                a.podeVerRelatorios,
                a.ultimoAcesso,
                u.nome,
                u.email,
                u.cargo,
                u.setor
            FROM " . $this->tabela . " a
            INNER JOIN Usuario u ON a.idUsuario = u.idUsuario
            WHERE a.idAdministrador = :idAdministrador
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idAdministrador', $this->idAdministrador, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        foreach ($row as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }

        return true;
    }

    // Buscar administrador pelo idUsuario (útil após o login)
    public function getByUsuario()
    {
        $query = "
            SELECT
                a.idAdministrador,
                a.idUsuario,
                a.nivelAcesso,
                a.podeGerenciarUsuarios,
                a.podeConfigurarSLA,
                a.podeVerRelatorios,
                a.ultimoAcesso
            FROM " . $this->tabela . " a
            WHERE a.idUsuario = :idUsuario
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        foreach ($row as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }

        return true;
    }

    // Cadastrar administrador (vincula um usuário existente)
    public function create()
    {
        if ($this->existePorUsuario()) {
            return false;
        }

        if (!$this->nivelAcessoValido()) {
            return false;
        }

        $query = "
            INSERT INTO " . $this->tabela . "
                (idUsuario, nivelAcesso, podeGerenciarUsuarios, podeConfigurarSLA, podeVerRelatorios)
            VALUES
                (:idUsuario, :nivelAcesso, :podeGerenciarUsuarios, :podeConfigurarSLA, :podeVerRelatorios)
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':idUsuario',             $this->idUsuario,             PDO::PARAM_INT);
        $stmt->bindParam(':nivelAcesso',           $this->nivelAcesso);
        $stmt->bindParam(':podeGerenciarUsuarios', $this->podeGerenciarUsuarios, PDO::PARAM_BOOL);
        $stmt->bindParam(':podeConfigurarSLA',     $this->podeConfigurarSLA,     PDO::PARAM_BOOL);
        $stmt->bindParam(':podeVerRelatorios',     $this->podeVerRelatorios,     PDO::PARAM_BOOL);

        if ($stmt->execute()) {
            $this->idAdministrador = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Atualizar permissões do administrador
    public function updatePermissoes()
    {
        if (!$this->nivelAcessoValido()) {
            return false;
        }

        $query = "
            UPDATE " . $this->tabela . "
            SET nivelAcesso           = :nivelAcesso,
                podeGerenciarUsuarios = :podeGerenciarUsuarios,
                podeConfigurarSLA     = :podeConfigurarSLA,
                podeVerRelatorios     = :podeVerRelatorios
            WHERE idAdministrador = :idAdministrador
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':nivelAcesso',           $this->nivelAcesso);
        $stmt->bindParam(':podeGerenciarUsuarios', $this->podeGerenciarUsuarios, PDO::PARAM_BOOL);
        $stmt->bindParam(':podeConfigurarSLA',     $this->podeConfigurarSLA,     PDO::PARAM_BOOL);
        $stmt->bindParam(':podeVerRelatorios',     $this->podeVerRelatorios,     PDO::PARAM_BOOL);
        $stmt->bindParam(':idAdministrador',       $this->idAdministrador,       PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Registrar último acesso (chamado no login)
    public function registrarAcesso()
    {
        $query = "
            UPDATE " . $this->tabela . "
            SET ultimoAcesso = NOW()
            WHERE idUsuario = :idUsuario
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Verificar se o admin tem uma permissão específica
    public function temPermissao(string $permissao)
    {
        $permissoesDisponiveis = [
            'gerenciarUsuarios' => 'podeGerenciarUsuarios',
            'configurarSLA'     => 'podeConfigurarSLA',
            'verRelatorios'     => 'podeVerRelatorios',
        ];

        if (!isset($permissoesDisponiveis[$permissao])) {
            return false;
        }

        $campo = $permissoesDisponiveis[$permissao];
        return (bool)$this->$campo;
    }

    // Verifica se já existe um administrador vinculado ao idUsuario
    private function existePorUsuario()
    {
        $query = "
            SELECT idAdministrador FROM " . $this->tabela . "
            WHERE idUsuario = :idUsuario
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idUsuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // Valida o nível de acesso
    private function nivelAcessoValido()
    {
        return in_array($this->nivelAcesso, $this->niveisPermitidos);
    }
}