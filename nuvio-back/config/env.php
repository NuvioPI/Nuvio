<?php
/**
 * Carrega variáveis de ambiente
 * Use .env.local para desenvolvimento (não commite para Git!)
 */

$envFile = __DIR__ . '/../.env.local';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignora comentários
        if (strpos($line, '#') === 0) continue;
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove aspas se houver
            if (preg_match('/^"(.*)"$/', $value)) {
                $value = substr($value, 1, -1);
            }
            
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

/**
 * Helper para obter variáveis de ambiente com valor padrão
 */
function env($key, $default = null)
{
    $value = getenv($key);
    return $value !== false ? $value : $default;
}
