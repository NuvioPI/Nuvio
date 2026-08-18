<?php

require_once __DIR__ . '/../config/env.php';

class EmailService
{
    public function enviarStatusTicket(
        string $destinatario,
        string $nomeUsuario,
        int $idTicket,
        string $tituloTicket,
        string $statusAnterior,
        string $statusNovo
    ): bool {
        if (!filter_var($destinatario, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $appName = env('APP_NAME', 'Nuvio');
        $remetente = env('MAIL_FROM', 'no-reply@nuvio.local');

        $assunto = "Atualizacao do ticket #{$idTicket}";

        $mensagem = "
Olá, {$nomeUsuario}.

O status do seu ticket foi atualizado.

Ticket: #{$idTicket}
Título: {$tituloTicket}
Status anterior: {$statusAnterior}
Novo status: {$statusNovo}

Atenciosamente,
{$appName}
";

        $headers = [
            "From: {$appName} <{$remetente}>",
            "Reply-To: {$remetente}",
            "Content-Type: text/plain; charset=UTF-8",
        ];

        return mail(
            $destinatario,
            $assunto,
            $mensagem,
            implode("\r\n", $headers)
        );
    }
}