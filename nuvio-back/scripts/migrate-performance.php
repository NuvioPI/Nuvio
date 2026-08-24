<?php

require_once __DIR__ . '/../config/database.php';

$indexes = [
    ['table' => 'Ticket', 'name' => 'idx_ticket_data_abertura', 'columns' => ['dataAbertura', 'idTicket']],
    ['table' => 'Ticket', 'name' => 'idx_ticket_usuario_data', 'columns' => ['idUsuario', 'dataAbertura']],
    ['table' => 'Ticket', 'name' => 'idx_ticket_tecnico_data', 'columns' => ['idTecnico', 'dataAbertura']],
    ['table' => 'respostaTicket', 'name' => 'idx_resposta_ticket_data', 'columns' => ['idTicket', 'dataResposta', 'idRespostaTicket']],
];

try {
    $db = (new DB())->getConnection();

    foreach ($indexes as $index) {
        $check = $db->prepare(
            'SELECT COUNT(*)
             FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name = :tableName
               AND index_name = :indexName'
        );
        $check->execute([
            ':tableName' => $index['table'],
            ':indexName' => $index['name'],
        ]);

        if ((int) $check->fetchColumn() > 0) {
            continue;
        }

        $columns = implode(', ', array_map(
            static fn(string $column): string => "`{$column}`",
            $index['columns']
        ));

        $db->exec(
            "CREATE INDEX `{$index['name']}` ON `{$index['table']}` ({$columns})"
        );

        echo "Índice {$index['name']} criado.\n";
    }
} catch (Throwable $erro) {
    error_log('Migração de performance falhou: ' . $erro->getMessage());
    exit(1);
}
