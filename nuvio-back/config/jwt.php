<?php
require_once __DIR__ . '/env.php';

class JWT
{
    private static $secret;
    private static $algoritmo = 'HS256';
    private static $expiracao;
    
    public static function init()
    {
        self::$secret = env('JWT_SECRET', 'nuvio_secret_key_2025_troque_isso');
        self::$expiracao = (int)env('JWT_EXPIRACAO', 28800);
    }

    public static function gerar($payload)
    {
        self::init();
        $header = self::base64url(json_encode([
            'typ' => 'JWT',
            'alg' => self::$algoritmo
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expiracao;

        $payloadEncoded = self::base64url(json_encode($payload));

        $assinatura = self::base64url(hash_hmac(
            'sha256',
            "$header.$payloadEncoded",
            self::$secret,
            true
        ));

        return "$header.$payloadEncoded.$assinatura";
    }

    public static function validar($token)
    {
        self::init();
        $partes = explode('.', $token);

        if (count($partes) !== 3) {
            return false;
        }

        [$header, $payload, $assinaturaRecebida] = $partes;

        $assinaturaEsperada = self::base64url(hash_hmac(
            'sha256',
            "$header.$payload",
            self::$secret,
            true
        ));

        if (!hash_equals($assinaturaEsperada, $assinaturaRecebida)) {
            return false;
        }

        $dados = json_decode(self::base64urlDecode($payload), true);

        if (!$dados || $dados['exp'] < time()) {
            return false;
        }

        return $dados;
    }

    private static function base64url($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}