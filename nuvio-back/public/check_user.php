<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$pdo = new PDO(
    "pgsql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}",
    $_ENV['DB_USER'],
    $_ENV['DB_PASS'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$stmt = $pdo->query("SELECT * FROM usuario WHERE email = 'admin@nuvio.com' LIMIT 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Colunas retornadas:\n";
print_r(array_keys($user));

echo "\nValores:\n";
print_r($user);