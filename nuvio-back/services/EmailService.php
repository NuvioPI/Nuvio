<?php

require_once __DIR__ . '/../config/env.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private function createMailer(): PHPMailer
    {
        $mail = new PHPMailer(true);

        $host = env('MAIL_HOST', '');
        $port = (int) env('MAIL_PORT', 587);
        $username = env('MAIL_USERNAME', '');
        $password = env('MAIL_PASSWORD', '');
        $from = env('MAIL_FROM', 'no-reply@nuvio.local');
        $fromName = env('MAIL_FROM_NAME', env('APP_NAME', 'Nuvio'));
        $encryption = env('MAIL_ENCRYPTION', 'tls');

        if ($host !== '') {
            // Configure SMTP
            $mail->isSMTP();
            $mail->Host = $host;
            $mail->Port = $port;
            $mail->SMTPAuth = $username !== '' && $password !== '';
            if ($mail->SMTPAuth) {
                $mail->Username = $username;
                $mail->Password = $password;
            }

            if (in_array(strtolower($encryption), ['ssl', 'tls'], true)) {
                $mail->SMTPSecure = $encryption;
            }
        }

        $mail->setFrom($from, $fromName);
        $mail->isHTML(false);
        $mail->CharSet = 'UTF-8';

        return $mail;
    }

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
        $assunto = "Atualização do ticket #{$idTicket}";

        $mensagem = "Olá, {$nomeUsuario}.\n\n" .
            "O status do seu ticket foi atualizado.\n\n" .
            "Ticket: #{$idTicket}\n" .
            "Título: {$tituloTicket}\n" .
            "Status anterior: {$statusAnterior}\n" .
            "Novo status: {$statusNovo}\n\n" .
            "Atenciosamente,\n{$appName}";

        try {
            $mail = $this->createMailer();
            $mail->addAddress($destinatario);
            $mail->Subject = $assunto;
            $mail->Body = $mensagem;
            $mail->send();

            return true;
        } catch (Exception $e) {
            // fallback to mail()
            $remetente = env('MAIL_FROM', 'no-reply@nuvio.local');
            $headers = [
                "From: {$remetente}",
                "Content-Type: text/plain; charset=UTF-8",
            ];

            return mail($destinatario, $assunto, $mensagem, implode("\r\n", $headers));
        }
    }

    public function enviarNovoTicket(
        string $destinatario,
        string $nomeUsuario,
        int $idTicket,
        string $tituloTicket
    ): bool {
        if (!filter_var($destinatario, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $appName = env('APP_NAME', 'Nuvio');
        $assunto = "Seu ticket #{$idTicket} foi criado";

        $mensagem = "Olá, {$nomeUsuario}.\n\n" .
            "Seu ticket foi criado com sucesso.\n\n" .
            "Ticket: #{$idTicket}\n" .
            "Título: {$tituloTicket}\n" .
            "Status: Aberto\n\n" .
            "Atenciosamente,\n{$appName}";

        try {
            $mail = $this->createMailer();
            $mail->addAddress($destinatario);
            $mail->Subject = $assunto;
            $mail->Body = $mensagem;
            $mail->send();

            return true;
        } catch (Exception $e) {
            $remetente = env('MAIL_FROM', 'no-reply@nuvio.local');
            $headers = [
                "From: {$remetente}",
                "Content-Type: text/plain; charset=UTF-8",
            ];

            return mail($destinatario, $assunto, $mensagem, implode("\r\n", $headers));
        }
    }

    public function enviarRespostaTicket(
        string $destinatario,
        string $nomeUsuario,
        int $idTicket,
        string $tituloTicket,
        string $mensagem,
        string $assunto = ''
    ): bool {
        if (!filter_var($destinatario, FILTER_VALIDATE_EMAIL) || trim($mensagem) === '') {
            return false;
        }

        $appName = env('APP_NAME', 'Nuvio');
        $assunto = trim($assunto) !== ''
            ? trim($assunto)
            : "Re: {$tituloTicket} (#{$idTicket})";

        $corpo = "Olá, {$nomeUsuario}.\n\n" . trim($mensagem) . "\n\n" .
            "---\n" .
            "Chamado #{$idTicket}: {$tituloTicket}\n" .
            "Atenciosamente,\n{$appName}";

        try {
            $mail = $this->createMailer();
            $mail->addAddress($destinatario, $nomeUsuario);
            $mail->Subject = $assunto;
            $mail->Body = $corpo;
            $mail->send();

            return true;
        } catch (Exception $e) {
            $remetente = env('MAIL_FROM', 'no-reply@nuvio.local');
            $headers = [
                "From: {$remetente}",
                "Content-Type: text/plain; charset=UTF-8",
            ];

            return mail($destinatario, $assunto, $corpo, implode("\r\n", $headers));
        }
    }

    public function enviarBoasVindasCliente(string $destinatario, string $nomeCliente): bool
    {
        if (!filter_var($destinatario, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $appName = env('APP_NAME', 'Nuvio');
        $mensagem = "Olá, {$nomeCliente}.\n\n" .
            "Seu cadastro foi realizado com sucesso no {$appName}.\n" .
            "Você receberá as atualizações de atendimento neste endereço.\n\n" .
            "Atenciosamente,\n{$appName}";

        try {
            $mail = $this->createMailer();
            $mail->addAddress($destinatario);
            $mail->Subject = "Bem-vindo(a) ao {$appName}";
            $mail->Body = $mensagem;
            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
