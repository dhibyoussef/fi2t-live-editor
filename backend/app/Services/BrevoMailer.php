<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class BrevoMailer
{
    /**
     * @param  array{email: string, name?: string}|null  $replyTo
     */
    public function sendHtml(
        string $fromEmail,
        string $fromName,
        string $toEmail,
        string $subject,
        string $html,
        ?array $replyTo = null,
    ): void {
        $key = (string) config('services.brevo.key', '');
        if ($key === '') {
            throw new RuntimeException('BREVO_KEY manquante');
        }

        $payload = [
            'sender' => [
                'email' => $fromEmail,
                'name' => $fromName,
            ],
            'to' => [[
                'email' => $toEmail,
            ]],
            'subject' => $subject,
            'htmlContent' => $html,
        ];

        if ($replyTo && filter_var($replyTo['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
            $payload['replyTo'] = array_filter([
                'email' => $replyTo['email'],
                'name' => $replyTo['name'] ?? null,
            ]);
        }

        $response = Http::timeout(20)
            ->withHeaders([
                'api-key' => $key,
                'accept' => 'application/json',
            ])
            ->post('https://api.brevo.com/v3/smtp/email', $payload);

        $body = $response->json();
        if ($response->failed()) {
            $message = is_array($body)
                ? (string) ($body['message'] ?? json_encode($body))
                : $response->body();

            throw new RuntimeException('Brevo '.$response->status().': '.$message);
        }

        $messageId = is_array($body) ? (string) ($body['messageId'] ?? '') : '';
        if ($messageId === '') {
            throw new RuntimeException('Brevo '.$response->status().': réponse sans messageId');
        }
    }
}
