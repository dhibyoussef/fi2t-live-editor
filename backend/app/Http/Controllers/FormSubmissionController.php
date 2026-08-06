<?php

namespace App\Http\Controllers;

use App\Models\ContentBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class FormSubmissionController extends Controller
{
    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'email' => ['required', 'email', 'max:180'],
            'subject' => ['required', 'string', 'max:240'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $ok = $this->notify(
            'contact',
            'FI2T — Contact: '.$data['subject'],
            $this->htmlTable([
                'Nom' => $data['name'],
                'Email' => $data['email'],
                'Sujet' => $data['subject'],
                'Message' => nl2br(e($data['message'])),
            ]),
            $data['email'],
            $data['name']
        );

        return $ok
            ? response()->json(['ok' => true])
            : response()->json(['ok' => false, 'message' => 'Envoi impossible pour le moment.'], 502);
    }

    public function newsletter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:180'],
        ]);

        $ok = $this->notify(
            'newsletter',
            'FI2T — Inscription newsletter',
            $this->htmlTable([
                'Email' => $data['email'],
                'Source' => 'Pied de page / Newsletter',
            ]),
            $data['email']
        );

        return $ok
            ? response()->json(['ok' => true])
            : response()->json(['ok' => false, 'message' => 'Envoi impossible pour le moment.'], 502);
    }

    public function adhesion(Request $request): JsonResponse
    {
        $data = $request->validate([
            'org' => ['required', 'string', 'max:240'],
            'contact' => ['required', 'string', 'max:180'],
            'email' => ['required', 'email', 'max:180'],
            'phone' => ['required', 'string', 'max:60'],
            'activity' => ['required', 'string', 'max:240'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $ok = $this->notify(
            'adhesion',
            'FI2T — Demande d’adhésion: '.$data['org'],
            $this->htmlTable([
                'Raison sociale' => $data['org'],
                'Contact' => $data['contact'],
                'Email' => $data['email'],
                'Téléphone' => $data['phone'],
                'Activité / groupement' => $data['activity'],
                'Message' => nl2br(e($data['message'])),
            ]),
            $data['email'],
            $data['contact']
        );

        return $ok
            ? response()->json(['ok' => true])
            : response()->json(['ok' => false, 'message' => 'Envoi impossible pour le moment.'], 502);
    }

    private function notify(
        string $form,
        string $subject,
        string $html,
        ?string $replyTo = null,
        ?string $replyName = null
    ): bool {
        $to = $this->resolveRecipient($form);
        if ($to === '') {
            Log::warning("Form {$form}: no notification recipient configured");

            return false;
        }

        try {
            Mail::html($html, function ($message) use ($to, $subject, $replyTo, $replyName) {
                $message->to($to)->subject($subject);
                if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
                    $message->replyTo($replyTo, $replyName ?: $replyTo);
                }
            });

            return true;
        } catch (\Throwable $e) {
            Log::error('Form mail failed', ['form' => $form, 'message' => $e->getMessage()]);

            return false;
        }
    }

    private function resolveRecipient(string $form): string
    {
        $key = match ($form) {
            'contact' => 'notify_contact',
            'newsletter' => 'notify_newsletter',
            'adhesion' => 'notify_adhesion',
            default => 'notify_contact',
        };

        $fromCms = ContentBlock::query()
            ->where('page', 'global')
            ->where('section', 'forms')
            ->where('key', $key)
            ->whereIn('locale', ['_all', 'fr'])
            ->orderByRaw("CASE WHEN locale = '_all' THEN 0 ELSE 1 END")
            ->value('value');

        if (is_string($fromCms) && filter_var(trim($fromCms), FILTER_VALIDATE_EMAIL)) {
            return trim($fromCms);
        }

        $envKey = match ($form) {
            'contact' => 'FORM_NOTIFY_CONTACT',
            'newsletter' => 'FORM_NOTIFY_NEWSLETTER',
            'adhesion' => 'FORM_NOTIFY_ADHESION',
            default => 'FORM_NOTIFY_CONTACT',
        };

        $fallback = (string) env($envKey, env('FORM_NOTIFY_TO', ''));

        return filter_var(trim($fallback), FILTER_VALIDATE_EMAIL) ? trim($fallback) : '';
    }

    /** @param array<string, string> $rows */
    private function htmlTable(array $rows): string
    {
        $body = '';
        foreach ($rows as $label => $value) {
            $body .= '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;vertical-align:top">'
                .e($label).'</th><td style="padding:8px;border-bottom:1px solid #eee">'
                .$value.'</td></tr>';
        }

        return '<div style="font-family:sans-serif;font-size:14px;color:#222">'
            .'<p>Nouveau formulaire reçu depuis le site FI2T.</p>'
            .'<table style="border-collapse:collapse;width:100%;max-width:640px">'.$body.'</table>'
            .'</div>';
    }
}
