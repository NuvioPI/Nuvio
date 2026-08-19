<?php

require_once __DIR__ . '/../config/database.php';

$db = (new DB())->getConnection();
$tabelas = $db->query("SHOW TABLES LIKE 'Cliente%'")->fetchAll(PDO::FETCH_COLUMN);
$tipoCliente = (int) $db->query("SELECT COUNT(*) FROM tipoUsuario WHERE descricao = 'Cliente'")->fetchColumn();

sort($tabelas);
if ($tabelas !== ['ClientePerfil', 'ClientePerfilTag', 'ClienteTag'] || $tipoCliente !== 1) {
    fwrite(STDERR, "Estrutura de clientes incompleta.\n");
    exit(1);
}

echo "Estrutura de clientes validada.\n";

// Exercita as relações usadas pelo cadastro e sempre desfaz a transação.
try {
    $db->beginTransaction();
    $idTipoCliente = (int) $db->query(
        "SELECT idtipoUsuario FROM tipoUsuario WHERE descricao = 'Cliente' LIMIT 1"
    )->fetchColumn();
    if ($idTipoCliente <= 0) {
        throw new RuntimeException('Tipo Cliente não encontrado.');
    }

    $email = 'teste-cliente-' . bin2hex(random_bytes(6)) . '@example.invalid';
    $usuario = $db->prepare(
        'INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor, telefone)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $usuario->execute([
        $idTipoCliente,
        'Teste de cadastro',
        $email,
        password_hash('senha-apenas-para-teste', PASSWORD_BCRYPT),
        'Teste',
        'Teste',
        '',
    ]);
    $idUsuario = (int) $db->lastInsertId();

    $perfil = $db->prepare(
        'INSERT INTO ClientePerfil (idUsuario, idioma, timezone, emailBoasVindas, verificado, inscrito)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $perfil->execute([$idUsuario, 'Português (BR)', 'America/Sao_Paulo (UTC -3)', 0, 0, 1]);

    $tag = 'teste-' . bin2hex(random_bytes(6));
    $db->prepare('INSERT INTO ClienteTag (nome) VALUES (?)')->execute([$tag]);
    $idTag = (int) $db->lastInsertId();
    $db->prepare('INSERT INTO ClientePerfilTag (idUsuario, idClienteTag) VALUES (?, ?)')
        ->execute([$idUsuario, $idTag]);

    $consulta = $db->prepare('SELECT COUNT(*) FROM ClientePerfilTag WHERE idUsuario = ? AND idClienteTag = ?');
    $consulta->execute([$idUsuario, $idTag]);
    if ((int) $consulta->fetchColumn() !== 1) {
        throw new RuntimeException('Vínculo da tag não foi criado.');
    }

    $db->rollBack();
    echo "Inserção de cliente validada e revertida.\n";
} catch (Throwable $erro) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    fwrite(STDERR, "Teste de inserção falhou: {$erro->getMessage()}\n");
    exit(1);
}
