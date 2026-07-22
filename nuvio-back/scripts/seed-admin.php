<?php
/**
 * Seed do primeiro administrador.
 *
 * Uso:
 *   php scripts/seed-admin.php
 *   php scripts/seed-admin.php --email=admin@nuvio.com --senha=MinhaSenha123
 */

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/database.php';

$opcoes = getopt('', ['email:', 'senha:', 'nome:', 'help']);

if (isset($opcoes['help'])) {
    echo "Uso: php scripts/seed-admin.php [--email=admin@nuvio.com] [--senha=admin123] [--nome=Administrador]\n";
    exit(0);
}

$email = trim($opcoes['email'] ?? env('ADMIN_SEED_EMAIL', 'admin@nuvio.com'));
$senha = $opcoes['senha'] ?? env('ADMIN_SEED_PASSWORD', 'admin123');
$nome  = trim($opcoes['nome'] ?? env('ADMIN_SEED_NOME', 'Administrador'));

if ($email === '' || $senha === '') {
    fwrite(STDERR, "Email e senha são obrigatórios.\n");
    exit(1);
}

$db = (new DB())->getConnection();

function garantirTiposUsuario(PDO $db): int
{
    $tipos = ['Cliente', 'Técnico', 'Administrador'];

    foreach ($tipos as $tipo) {
        $stmt = $db->prepare('SELECT idtipoUsuario FROM tipoUsuario WHERE descricao = ? LIMIT 1');
        $stmt->execute([$tipo]);
        if (!$stmt->fetch()) {
            $insert = $db->prepare('INSERT INTO tipoUsuario (descricao) VALUES (?)');
            $insert->execute([$tipo]);
        }
    }

    $stmt = $db->prepare('SELECT idtipoUsuario FROM tipoUsuario WHERE descricao = ? LIMIT 1');
    $stmt->execute(['Administrador']);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        throw new RuntimeException('Não foi possível obter o tipo Administrador.');
    }

    return (int) $row['idtipoUsuario'];
}

function garantirRegistroAdministrador(PDO $db, int $idUsuario): void
{
    $stmt = $db->prepare('SELECT idAdministrador FROM Administrador WHERE idUsuario = ? LIMIT 1');
    $stmt->execute([$idUsuario]);

    if ($stmt->fetch()) {
        return;
    }

    $insert = $db->prepare("
        INSERT INTO Administrador (idUsuario, nivelAcesso, podeGerenciarUsuarios, podeConfigurarSLA, podeVerRelatorios)
        VALUES (?, 'super', 1, 1, 1)
    ");
    $insert->execute([$idUsuario]);
}

try {
    $db->beginTransaction();

    $idTipoAdmin = garantirTiposUsuario($db);
    $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

    $stmt = $db->prepare('SELECT idUsuario, idtipoUsuario FROM Usuario WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        $idUsuario = (int) $usuario['idUsuario'];

        $update = $db->prepare('
            UPDATE Usuario
            SET idtipoUsuario = ?, nome = ?, senhaHash = ?, cargo = ?, setor = ?
            WHERE idUsuario = ?
        ');
        $update->execute([$idTipoAdmin, $nome, $senhaHash, 'Administrador', 'TI', $idUsuario]);

        garantirRegistroAdministrador($db, $idUsuario);

        $db->commit();

        echo "Administrador atualizado com sucesso.\n";
        echo "Email: {$email}\n";
        echo "Senha: {$senha}\n";
        exit(0);
    }

    $insert = $db->prepare('
        INSERT INTO Usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $insert->execute([$idTipoAdmin, $nome, $email, $senhaHash, 'Administrador', 'TI']);
    $idUsuario = (int) $db->lastInsertId();

    garantirRegistroAdministrador($db, $idUsuario);

    $db->commit();

    echo "Administrador criado com sucesso.\n";
    echo "Email: {$email}\n";
    echo "Senha: {$senha}\n";
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    fwrite(STDERR, 'Erro ao criar administrador: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}
