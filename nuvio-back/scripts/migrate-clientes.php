<?php

/**
 * Cria a estrutura de clientes e completa os perfis dos clientes antigos.
 *
 * Execute na pasta nuvio-back:
 *   php scripts/migrate-clientes.php
 *
 * A migração é idempotente: executar novamente não duplica usuários,
 * perfis ou tags.
 */

require_once __DIR__ . '/../config/database.php';

$db = (new DB())->getConnection();
$arquivo = __DIR__ . '/../database/migration_clientes.sql';

if (!is_file($arquivo)) {
    fwrite(STDERR, "Arquivo de migração não encontrado: {$arquivo}\n");
    exit(1);
}

try {
    $sql = file_get_contents($arquivo);
    if ($sql === false) {
        throw new RuntimeException('Não foi possível ler o arquivo de migração.');
    }

    // O arquivo contém somente comandos DDL/DML sem strings com ponto e
    // vírgula; executar cada comando separadamente facilita identificar qual
    // etapa falhou no banco remoto.
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    $comandos = preg_split('/;\s*(?:\r?\n|$)/', (string) $sql, -1, PREG_SPLIT_NO_EMPTY);

    foreach ($comandos as $comando) {
        $comando = trim($comando);
        if ($comando !== '') {
            $db->exec($comando);
        }
    }

    $clientes = (int) $db->query(
        "SELECT COUNT(*)
         FROM Usuario u
         INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
         WHERE tu.descricao = 'Cliente'"
    )->fetchColumn();
    $perfis = (int) $db->query('SELECT COUNT(*) FROM ClientePerfil')->fetchColumn();
    $semPerfil = (int) $db->query(
        "SELECT COUNT(*)
         FROM Usuario u
         INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
         LEFT JOIN ClientePerfil cp ON cp.idUsuario = u.idUsuario
         WHERE tu.descricao = 'Cliente' AND cp.idUsuario IS NULL"
    )->fetchColumn();

    echo "Migração de clientes concluída.\n";
    echo "Clientes em Usuario: {$clientes}\n";
    echo "Perfis em ClientePerfil: {$perfis}\n";
    echo "Clientes sem perfil: {$semPerfil}\n";

    if ($semPerfil > 0) {
        exit(2);
    }
} catch (Throwable $erro) {
    fwrite(STDERR, "Migração de clientes falhou: {$erro->getMessage()}\n");
    exit(1);
}
