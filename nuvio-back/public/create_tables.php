<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = $_ENV['DB_HOST'];
$port = $_ENV['DB_PORT'];
$dbname = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

$pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$sql = "
-- tipoUsuario (criar primeiro - outras tabelas dependem)
CREATE TABLE IF NOT EXISTS tipoUsuario (
    idtipoUsuario SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    CONSTRAINT ck_descricao CHECK (descricao IN ('Cliente', 'Técnico', 'Administrador'))
);

-- Categoria
CREATE TABLE IF NOT EXISTS Categoria (
    idCategoria SERIAL PRIMARY KEY,
    nomeCategoria VARCHAR(55) NOT NULL,
    descricao VARCHAR(255) NOT NULL
);

-- SLA
CREATE TABLE IF NOT EXISTS SLA (
    idSLA SERIAL PRIMARY KEY,
    nomeSLA VARCHAR(75) NOT NULL,
    tempoRespostaMinutos INTEGER,
    tempoResolucaoMinutos INTEGER,
    descricao VARCHAR(255) NOT NULL
);

-- Usuario (criar antes de Tecnico e Administrador)
CREATE TABLE IF NOT EXISTS Usuario (
    idUsuario SERIAL PRIMARY KEY,
    idtipoUsuario INTEGER NOT NULL,
    nome VARCHAR(85) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senhaHash VARCHAR(155) NOT NULL,
    cargo VARCHAR(55) NOT NULL,
    setor VARCHAR(55) NOT NULL,
    CONSTRAINT fk_usuario_tipoUsuario FOREIGN KEY (idtipoUsuario) REFERENCES tipoUsuario(idtipoUsuario)
);

-- Tecnico (depende de Usuario)
CREATE TABLE IF NOT EXISTS Tecnico (
    idTecnico SERIAL PRIMARY KEY,
    idUsuario INTEGER NOT NULL UNIQUE,
    especialidade VARCHAR(75),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_tecnico_usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Administrador (depende de Usuario)
CREATE TABLE IF NOT EXISTS Administrador (
    idAdministrador SERIAL PRIMARY KEY,
    idUsuario INTEGER NOT NULL UNIQUE,
    nivelAcesso VARCHAR(30) NOT NULL DEFAULT 'padrao',
    podeGerenciarUsuarios BOOLEAN NOT NULL DEFAULT FALSE,
    podeConfigurarSLA BOOLEAN NOT NULL DEFAULT FALSE,
    podeVerRelatorios BOOLEAN NOT NULL DEFAULT TRUE,
    ultimoAcesso TIMESTAMP NULL,
    CONSTRAINT fk_admin_usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

-- Ticket (depende de varias tabelas)
CREATE TABLE IF NOT EXISTS Ticket (
    idTicket SERIAL PRIMARY KEY,
    idTecnico INTEGER NOT NULL,
    idUsuario INTEGER NOT NULL,
    idCategoria INTEGER NOT NULL,
    idSLA INTEGER NOT NULL,
    titulo VARCHAR(75) NOT NULL,
    descricao TEXT NOT NULL,
    statusTicket VARCHAR(45) NOT NULL,
    prioridade VARCHAR(10) NOT NULL,
    dataAbertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataFechamento TIMESTAMP NULL,
    CONSTRAINT ck_prioridade CHECK (prioridade IN ('Alta', 'Media', 'Baixa')),
    CONSTRAINT ck_statusTicket CHECK (statusTicket IN ('Aberto', 'Em atendimento', 'Resolvido', 'Fechado')),
    CONSTRAINT fk_ticket_tecnico FOREIGN KEY (idTecnico) REFERENCES Tecnico(idTecnico),
    CONSTRAINT fk_ticket_usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    CONSTRAINT fk_ticket_categoria FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria),
    CONSTRAINT fk_ticket_sla FOREIGN KEY (idSLA) REFERENCES SLA(idSLA)
);

-- respostaTicket (depende de Usuario e Ticket)
CREATE TABLE IF NOT EXISTS respostaTicket (
    idRespostaTicket SERIAL PRIMARY KEY,
    idUsuario INTEGER NOT NULL,
    idTicket INTEGER NOT NULL,
    msgTicket TEXT NOT NULL,
    dataResposta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_respostaTicket_usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    CONSTRAINT fk_respostaTicket_ticket FOREIGN KEY (idTicket) REFERENCES Ticket(idTicket)
);

-- anexo (depende de Ticket)
CREATE TABLE IF NOT EXISTS anexo (
    idAnexo SERIAL PRIMARY KEY,
    idTicket INTEGER NOT NULL,
    nomeArquivo VARCHAR(100) NOT NULL,
    caminhoArquivo VARCHAR(255) NOT NULL,
    tipoArquivo VARCHAR(50),
    tamanhoArquivo BIGINT,
    dataUpload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anexo_ticket FOREIGN KEY (idTicket) REFERENCES Ticket(idTicket)
);

-- avaliacaoTicket (depende de Ticket e Usuario)
CREATE TABLE IF NOT EXISTS avaliacaoTicket (
    idAvaliacaoTicket SERIAL PRIMARY KEY,
    idTicket INTEGER NOT NULL UNIQUE,
    idUsuario INTEGER NOT NULL,
    nota SMALLINT NOT NULL,
    comentario TEXT,
    dataAvaliacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_nota CHECK (nota BETWEEN 1 AND 5),
    CONSTRAINT fk_avaliacaoTicket_ticket FOREIGN KEY (idTicket) REFERENCES Ticket(idTicket),
    CONSTRAINT fk_avaliacaoTicket_usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);
";

echo "=== Criando tabelas no Supabase ===\n";

try {
    $pdo->exec($sql);
    echo "Todas as tabelas criadas com sucesso!\n";

    // Verify tables
    $tables = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tabelas existentes: " . implode(", ", $tables) . "\n";

} catch (PDOException $e) {
    echo "Erro ao criar tabelas: " . $e->getMessage() . "\n";
}