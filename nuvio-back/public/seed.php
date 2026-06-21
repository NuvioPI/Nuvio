<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

error_reporting(E_ALL);
ini_set('display_errors', 1);

$pdo = new PDO(
    "pgsql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}",
    $_ENV['DB_USER'],
    $_ENV['DB_PASS'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

echo "=== Seed inicial do Supabase ===\n\n";

// 1. Insert tipoUsuario
echo "1. Inserindo tipos de usuário...\n";
$tipoUsuario = [
    ['descricao' => 'Cliente'],
    ['descricao' => 'Técnico'],
    ['descricao' => 'Administrador']
];

$stmt = $pdo->prepare("INSERT INTO tipousuario (descricao) VALUES (?) ON CONFLICT DO NOTHING");
foreach ($tipoUsuario as $t) {
    $stmt->execute([$t['descricao']]);
    echo "  - {$t['descricao']}\n";
}

// 2. Insert admin user
echo "\n2. Inserindo usuário admin...\n";
$senhaHash = password_hash('admin123', PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO usuario (idtipoUsuario, nome, email, senhaHash, cargo, setor)
    VALUES (3, 'Administrador', 'admin@nuvio.com', ?, 'Administrador', 'TI')
    ON CONFLICT (email) DO NOTHING");
$stmt->execute([$senhaHash]);
echo "  - Email: admin@nuvio.com\n";
echo "  - Senha: admin123\n";

// 3. Insert Administrador record
echo "\n3. Vinculando administrador...\n";
$stmt = $pdo->prepare("INSERT INTO administrador (idUsuario, nivelAcesso, podeGerenciarUsuarios, podeConfigurarSLA)
    SELECT idUsuario, 'admin', TRUE, TRUE FROM usuario WHERE email = 'admin@nuvio.com'
    ON CONFLICT DO NOTHING");
$stmt->execute();
echo "  - OK\n";

// 4. Insert some categories
echo "\n4. Inserindo categorias...\n";
$categorias = [
    ['nome' => 'Suporte Técnico', 'desc' => 'Problemas técnicos e dúvidas'],
    ['nome' => 'Commercial', 'desc' => 'Assuntos comerciais e vendas'],
    ['nome' => 'Financeiro', 'desc' => 'Faturas, pagamentos e cobranças'],
    ['nome' => 'Dúvidas Gerais', 'desc' => 'Perguntas gerais sobre o sistema']
];
$stmt = $pdo->prepare("INSERT INTO categoria (nomeCategoria, descricao) VALUES (?, ?) ON CONFLICT DO NOTHING");
foreach ($categorias as $cat) {
    $stmt->execute([$cat['nome'], $cat['desc']]);
    echo "  - {$cat['nome']}\n";
}

// 5. Insert SLA defaults
echo "\n5. Inserindo SLAs...\n";
$slas = [
    ['nome' => 'Crítico', 'resposta' => 15, 'resolucao' => 60, 'desc' => 'Resposta em 15 min, resolução em 1h'],
    ['nome' => 'Alta', 'resposta' => 60, 'resolucao' => 240, 'desc' => 'Resposta em 1h, resolução em 4h'],
    ['nome' => 'Média', 'resposta' => 240, 'resolucao' => 480, 'desc' => 'Resposta em 4h, resolução em 8h'],
    ['nome' => 'Baixa', 'resposta' => 480, 'resolucao' => 1440, 'desc' => 'Resposta em 8h, resolução em 24h']
];
$stmt = $pdo->prepare("INSERT INTO sla (nomeSLA, tempoRespostaMinutos, tempoResolucaoMinutos, descricao) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING");
foreach ($slas as $sla) {
    $stmt->execute([$sla['nome'], $sla['resposta'], $sla['resolucao'], $sla['desc']]);
    echo "  - {$sla['nome']}\n";
}

echo "\n=== Seed completo! ===\n\n";
echo "Agora você pode fazer login com:\n";
echo "  Email: admin@nuvio.com\n";
echo "  Senha: admin123\n";