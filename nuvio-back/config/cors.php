<?php

require_once __DIR__ . '/env.php';

function origemCorsPermitida(string $origem): bool
{
    if ($origem === '') {
        return false;
    }

    $origensConfiguradas = env('CORS_ORIGINS', env('CORS_ORIGIN', ''));
    $origensPermitidas = array_filter(array_map(
        'trim',
        explode(',', $origensConfiguradas)
    ));

    $origensPadrao = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://nuvio-fawn.vercel.app',
        'https://nuvio-4n0yfm5uc-yemorgxs-projects.vercel.app',
    ];

    if (in_array($origem, array_merge($origensPermitidas, $origensPadrao), true)) {
        return true;
    }

    return preg_match(
        '#^https://nuvio-[a-z0-9-]+-yemorgxs-projects\.vercel\.app$#',
        $origem
    ) === 1;
}

function aplicarCors(): void
{
    $origemRequisicao = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (origemCorsPermitida($origemRequisicao)) {
        header('Access-Control-Allow-Origin: ' . $origemRequisicao);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}
