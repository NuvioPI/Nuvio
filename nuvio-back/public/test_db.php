<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Try direct connection (port 5432) - no pooler
$host = "db.thzmgvwmpgeiegljanah.supabase.co";
$port = "5432";
$dbname = "postgres";
$user = "postgres";
$pass = $_ENV['DB_PASS'];

echo "=== Testando conexão direta com Supabase ===\n";
echo "Host: $host\n";
echo "Port: $port\n";
echo "DB: $dbname\n";
echo "User: $user\n";

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;options=--search_path=public";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected successfully!\n";

    $tables = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(", ", $tables) . "\n";

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}