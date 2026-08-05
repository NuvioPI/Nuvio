<?php

$caminho = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$arquivoPublico = __DIR__ . $caminho;

// Permite que arquivos estáticos e endpoints PHP explícitos, como health.php,
// sejam atendidos diretamente pelo servidor embutido do PHP.
if ($caminho !== '/' && is_file($arquivoPublico)) {
    return false;
}

require __DIR__ . '/index.php';
