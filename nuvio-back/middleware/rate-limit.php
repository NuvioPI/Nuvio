<?php

require_once __DIR__ . '/../config/env.php';

/**
 * Rate Limiting simples usando arquivo
 * Para produção, use Redis
 */
class RateLimiter
{
    private $dir = __DIR__ . '/../.rate-limit';
    
    public function __construct()
    {
        if (!is_dir($this->dir)) {
            mkdir($this->dir, 0755, true);
        }
    }
    
    /**
     * Verifica se está dentro do limite
     * Retorna true se OK, false se passou do limite
     */
    public function permite($chave, $maxRequisicoes = 10, $janelaTempo = 900)
    {
        if (env('RATE_LIMIT_ENABLED') !== 'true') {
            return true; // Desabilitado
        }
        
        $arquivo = $this->dir . '/' . md5($chave);
        $agora = time();
        
        // Ler histórico
        $dados = [];
        if (file_exists($arquivo)) {
            $dados = json_decode(file_get_contents($arquivo), true) ?? [];
        }
        
        // Limpar requisições fora da janela de tempo
        $dados = array_filter($dados, function ($timestamp) use ($agora, $janelaTempo) {
            return ($agora - $timestamp) < $janelaTempo;
        });
        
        // Verificar se passou do limite
        if (count($dados) >= $maxRequisicoes) {
            return false;
        }
        
        // Adicionar requisição atual
        $dados[] = $agora;
        file_put_contents($arquivo, json_encode($dados));
        
        return true;
    }
    
    /**
     * Limpar rate limit (admin)
     */
    public function limpar($chave)
    {
        $arquivo = $this->dir . '/' . md5($chave);
        if (file_exists($arquivo)) {
            unlink($arquivo);
        }
    }
}
