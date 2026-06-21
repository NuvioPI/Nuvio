<?php

/**
 * BaseModel - Classe base com suporte a soft delete e auditoria
 */
abstract class BaseModel
{
    protected $conn;
    protected $tabela;
    protected $useSoftDelete = true;
    protected $id;

    public function __construct($conexao)
    {
        $this->conn = $conexao;
    }

    /**
     * Retorna cláusula WHERE para excluir registros deletados
     * @return string
     */
    protected function whereNotDeleted()
    {
        if ($this->useSoftDelete) {
            return " AND deletedAt IS NULL";
        }
        return "";
    }

    /**
     * Soft delete - marca registro como deletado sem apagar fisicamente
     * @param int $id ID do registro a deletar
     * @param int $idUsuario ID do usuário que fez a ação (para auditoria)
     * @return bool
     */
    public function softDelete($id, $idUsuario = null)
    {
        if (!$this->useSoftDelete) {
            return $this->hardDelete($id);
        }

        $query = "
            UPDATE " . $this->tabela . "
            SET deletedAt = NOW()
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        $resultado = $stmt->execute();

        // Registrar na auditoria
        if ($resultado && $idUsuario) {
            $this->auditarOperacao('DELETE', $id, $idUsuario, null, null);
        }

        return $resultado;
    }

    /**
     * Restaurar registro deletado (soft delete)
     * @param int $id ID do registro a restaurar
     * @param int $idUsuario ID do usuário que fez a ação
     * @return bool
     */
    public function restore($id, $idUsuario = null)
    {
        if (!$this->useSoftDelete) {
            return false;
        }

        $query = "
            UPDATE " . $this->tabela . "
            SET deletedAt = NULL
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        $resultado = $stmt->execute();

        if ($resultado && $idUsuario) {
            $this->auditarOperacao('RESTORE', $id, $idUsuario, null, null);
        }

        return $resultado;
    }

    /**
     * Hard delete - deleta registro permanentemente (admin only)
     * @param int $id ID do registro a deletar
     * @return bool
     */
    public function hardDelete($id)
    {
        $query = "DELETE FROM " . $this->tabela . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Listar com paginação
     * @param int $page Número da página (começa em 1)
     * @param int $limit Quantidade de registros por página
     * @param string $orderBy Campo para ordenação
     * @param string $order ASC ou DESC
     * @return array
     */
    public function paginate($page = 1, $limit = 20, $orderBy = 'id', $order = 'DESC')
    {
        $page = max(1, (int)$page);
        $limit = min(100, max(1, (int)$limit)); // Máx 100 itens por página
        $offset = ($page - 1) * $limit;

        // Sanitizar orderBy e order
        $orderBy = preg_replace('/[^a-zA-Z0-9_]/', '', $orderBy);
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';

        $totalQuery = "SELECT COUNT(*) as total FROM " . $this->tabela . " WHERE 1=1 " . $this->whereNotDeleted();
        $stmt = $this->conn->prepare($totalQuery);
        $stmt->execute();
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $dataQuery = "
            SELECT * FROM " . $this->tabela . "
            WHERE 1=1 " . $this->whereNotDeleted() . "
            ORDER BY " . $orderBy . " " . $order . "
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->conn->prepare($dataQuery);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit),
                'hasNext' => $page < ceil($total / $limit),
                'hasPrev' => $page > 1
            ]
        ];
    }

    /**
     * Busca com FULLTEXT (para campos indexados)
     * @param string $termo Termo de busca
     * @param string $campos Campos para buscar (separados por vírgula)
     * @param int $limit Limite de resultados
     * @return array
     */
    public function buscarFulltext($termo, $campos, $limit = 20)
    {
        $termo = trim($termo);
        if (strlen($termo) < 3) {
            return [];
        }

        // Escapar termos de busca FULLTEXT
        $termo = str_replace(['"', '\'', '\\'], '', $termo);

        $query = "
            SELECT * FROM " . $this->tabela . "
            WHERE MATCH(" . $campos . ") AGAINST(:termo IN BOOLEAN MODE)
            " . $this->whereNotDeleted() . "
            LIMIT :limit
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':termo', $termo);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Busca simples com LIKE (mais rápido que FULLTEXT para strings simples)
     * @param string $campo Nome do campo
     * @param string $valor Valor a buscar
     * @param int $limit Limite de resultados
     * @return array
     */
    public function buscar($campo, $valor, $limit = 20)
    {
        $campo = preg_replace('/[^a-zA-Z0-9_]/', '', $campo);
        $valor = '%' . trim($valor) . '%';

        $query = "
            SELECT * FROM " . $this->tabela . "
            WHERE " . $campo . " LIKE :valor
            " . $this->whereNotDeleted() . "
            LIMIT :limit
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':valor', $valor);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Registrar operação na auditoria
     * @param string $operacao CREATE, UPDATE, DELETE, LOGIN
     * @param int $idRegistro ID do registro afetado
     * @param int $idUsuario ID do usuário
     * @param array $dadosAnteriores Dados antes (para UPDATE)
     * @param array $dadosNovos Dados novos (para UPDATE)
     */
    protected function auditarOperacao($operacao, $idRegistro, $idUsuario, $dadosAnteriores = null, $dadosNovos = null)
    {
        try {
            $query = "
                INSERT INTO audit_log (tabela, operacao, idRegistro, idUsuario, dados_anteriores, dados_novos, ipOrigem, userAgent)
                VALUES (:tabela, :operacao, :idRegistro, :idUsuario, :dados_anteriores, :dados_novos, :ipOrigem, :userAgent)
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tabela', $this->tabela);
            $stmt->bindParam(':operacao', $operacao);
            $stmt->bindParam(':idRegistro', $idRegistro, PDO::PARAM_INT);
            $stmt->bindParam(':idUsuario', $idUsuario, PDO::PARAM_INT);
            $stmt->bindParam(':dados_anteriores', $dadosAnteriores ? json_encode($dadosAnteriores) : null);
            $stmt->bindParam(':dados_novos', $dadosNovos ? json_encode($dadosNovos) : null);
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'CLI';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $stmt->bindParam(':ipOrigem', $ip);
            $stmt->bindParam(':userAgent', $userAgent);

            $stmt->execute();
        } catch (Exception $e) {
            // Log falhou, mas não deve interromper a operação principal
            error_log('Auditoria falhou: ' . $e->getMessage());
        }
    }

    /**
     * Obter histórico de auditoria de um registro
     * @param int $idRegistro ID do registro
     * @return array
     */
    public function getAuditoria($idRegistro)
    {
        $query = "
            SELECT * FROM audit_log
            WHERE tabela = :tabela AND idRegistro = :idRegistro
            ORDER BY dataOperacao DESC
            LIMIT 50
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':tabela', $this->tabela);
        $stmt->bindParam(':idRegistro', $idRegistro, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Método para atualizar com auditoria
     * @param int $id ID do registro
     * @param array $dados Dados novos
     * @param int $idUsuario ID do usuário que faz a mudança
     * @return bool
     */
    protected function updateComAuditoria($id, $dados, $idUsuario)
    {
        // Obter dados anteriores
        $queryAnterior = "SELECT * FROM " . $this->tabela . " WHERE id = :id";
        $stmt = $this->conn->prepare($queryAnterior);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $dadosAnteriores = $stmt->fetch(PDO::FETCH_ASSOC);

        // Fazer UPDATE
        $setClauses = [];
        foreach ($dados as $campo => $valor) {
            $setClauses[] = $campo . " = :" . $campo;
        }

        $query = "UPDATE " . $this->tabela . " SET " . implode(", ", $setClauses) . ", updatedAt = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        foreach ($dados as $campo => $valor) {
            $stmt->bindParam(':' . $campo, $valor);
        }
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        $resultado = $stmt->execute();

        // Registrar auditoria se sucesso
        if ($resultado) {
            $this->auditarOperacao('UPDATE', $id, $idUsuario, $dadosAnteriores, $dados);
        }

        return $resultado;
    }
}
