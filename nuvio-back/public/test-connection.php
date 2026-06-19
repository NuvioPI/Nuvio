<?php
require_once __DIR__ . '/../config/database.php';

$db = new DB();
$conn = $db->getConnection();

if ($conn) {
    echo "✅ Conectado com sucesso ao banco: " . $db->db_name;

    // testa se consegue listar as tabelas
    try {
        $stmt = $conn->query("SHOW TABLES");
        $tabelas = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "<br><br>Tabelas encontradas:<br>";
        foreach ($tabelas as $tabela) {
            echo "- $tabela<br>";
        }
    } catch (PDOException $e) {
        echo "Erro ao listar tabelas: " . $e->getMessage();
    }
} else {
    echo "❌ Falha na conexão.";
}