<?php

namespace App\Http\Controllers;

use App\Models\ContentBlock;
use App\Models\FormSubmission;
use App\Services\BrevoMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class FormSubmissionController extends Controller
{
    public function contact(Request $request): JsonResponse
    {
        if ($this->isHoneypot($request)) {
            return response()->json(['ok' => true]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'email' => ['required', 'email', 'max:180'],
            'subject' => ['required', 'string', 'max:240'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $this->storeAndNotify(
            $request,
            'contact',
            $data['name'],
            $data['email'],
            $data['subject'],
            $data,
            'FI2T — Contact: '.$data['subject'],
            $this->htmlTable([
                'Nom' => $data['name'],
                'Email' => $data['email'],
                'Sujet' => $data['subject'],
                'Message' => $data['message'],
            ]),
            $data['email'],
            $data['name']
        );

        return response()->json(['ok' => true]);
    }

    public function newsletter(Request $request): JsonResponse
    {
        if ($this->isHoneypot($request)) {
            return response()->json(['ok' => true]);
        }

        $data = $request->validate([
            'email' => ['required', 'email', 'max:180'],
        ]);

        $this->storeAndNotify(
            $request,
            'newsletter',
            null,
            $data['email'],
            'Inscription newsletter',
            $data,
            'FI2T — Inscription newsletter',
            $this->htmlTable([
                'Email' => $data['email'],
                'Source' => 'Pied de page / Newsletter',
            ]),
            $data['email']
        );

        return response()->json(['ok' => true]);
    }

    public function adhesion(Request $request): JsonResponse
    {
        if ($this->isHoneypot($request)) {
            return response()->json(['ok' => true]);
        }

        $data = $request->validate([
            'org' => ['required', 'string', 'max:240'],
            'contact' => ['required', 'string', 'max:180'],
            'email' => ['required', 'email', 'max:180'],
            'phone' => ['required', 'string', 'max:60'],
            'activity' => ['required', 'string', 'max:240'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $this->storeAndNotify(
            $request,
            'adhesion',
            $data['contact'],
            $data['email'],
            'Demande d’adhésion — '.$data['org'],
            $data,
            'FI2T — Demande d’adhésion: '.$data['org'],
            $this->htmlTable([
                'Raison sociale' => $data['org'],
                'Contact' => $data['contact'],
                'Email' => $data['email'],
                'Téléphone' => $data['phone'],
                'Activité / groupement' => $data['activity'],
                'Message' => $data['message'],
            ]),
            $data['email'],
            $data['contact']
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Always persist locally. Mail is best-effort (SMTP may be log until a mailbox exists).
     *
     * @param  array<string, mixed>  $payload
     */
    private function storeAndNotify(
        Request $request,
        string $type,
        ?string $name,
        string $email,
        ?string $subject,
        array $payload,
        string $mailSubject,
        string $html,
        ?string $replyTo = null,
        ?string $replyName = null
    ): FormSubmission {
        $row = FormSubmission::create([
            'type' => $type,
            'status' => 'new',
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'payload' => $payload,
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        $officialFrom = $this->resolveSender($type);
        $to = $this->resolveReceiver();
        $technicalFrom = $this->resolveBrevoSender() ?: $officialFrom;
        if ($technicalFrom === '' || $to === '') {
            $row->mail_error = 'Expéditeur ou destinataire manquant';
            $row->save();
            Log::warning("Form {$type}: missing from/to", ['from' => $technicalFrom, 'to' => $to]);

            return $row;
        }

        $fromName = match ($type) {
            'adhesion' => 'FI2T — Adhésion',
            'newsletter' => 'FI2T — Newsletter',
            default => 'FI2T — Contact',
        };
        if ($officialFrom !== '' && strcasecmp($officialFrom, $technicalFrom) !== 0) {
            $fromName .= ' ('.$officialFrom.')';
            $html = '<p style="font-family:sans-serif;font-size:13px;color:#444">Identité officielle: <strong>'
                .e($officialFrom).'</strong></p>'.$html;
        }

        try {
            if ((string) config('services.brevo.key', '') !== '') {
                app(BrevoMailer::class)->sendHtml(
                    $technicalFrom,
                    $fromName,
                    $to,
                    $mailSubject,
                    $html,
                    $replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)
                        ? ['email' => $replyTo, 'name' => $replyName ?: $replyTo]
                        : null,
                );
                $row->mailed_at = now();
                $row->mail_error = null;
            } else {
                Mail::html($html, function ($message) use ($technicalFrom, $fromName, $to, $mailSubject, $replyTo, $replyName) {
                    $message->from($technicalFrom, $fromName)
                        ->to($to)
                        ->subject($mailSubject);
                    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
                        $message->replyTo($replyTo, $replyName ?: $replyTo);
                    }
                });
                $mailer = (string) config('mail.default');
                if (in_array($mailer, ['log', 'array'], true)) {
                    $row->mail_error = 'MAIL_MAILER='.$mailer.' — enregistré dans le CMS, pas encore envoyé';
                } else {
                    $row->mailed_at = now();
                    $row->mail_error = null;
                }
            }
            $row->save();
        } catch (\Throwable $e) {
            $row->mail_error = substr($e->getMessage(), 0, 500);
            $row->save();
            Log::error('Form mail failed', ['form' => $type, 'id' => $row->id, 'message' => $e->getMessage()]);
        }

        return $row;
    }

    /** Official From: address for this form (shown as sender). */
    private function resolveSender(string $form): string
    {
        $key = match ($form) {
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

        $fallback = (string) config('forms.'.$key, '');

        return filter_var(trim($fallback), FILTER_VALIDATE_EMAIL) ? trim($fallback) : '';
    }

    /** Verified Brevo sender (required until fit-tunisie.org is authenticated). */
    private function resolveBrevoSender(): string
    {
        $from = trim((string) config('forms.brevo_sender', ''));

        return filter_var($from, FILTER_VALIDATE_EMAIL) ? $from : '';
    }

    /** Who receives the mail for now (personal inbox). */
    private function resolveReceiver(): string
    {
        $to = trim((string) config('forms.receiver', ''));

        return filter_var($to, FILTER_VALIDATE_EMAIL) ? $to : '';
    }

    private function isHoneypot(Request $request): bool
    {
        $trap = trim((string) $request->input('website', ''));

        return $trap !== '';
    }

    /** @param array<string, string> $rows */
    private function htmlTable(array $rows): string
    {
        $body = '';
        foreach ($rows as $label => $value) {
            $body .= '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #eee;vertical-align:top">'
                .e($label).'</th><td style="padding:8px;border-bottom:1px solid #eee;white-space:pre-wrap">'
                .e((string) $value).'</td></tr>';
        }

        return '<div style="font-family:sans-serif;font-size:14px;color:#222">'
            .'<p>Nouveau formulaire reçu depuis le site FI2T.</p>'
            .'<table style="border-collapse:collapse;width:100%;max-width:640px">'.$body.'</table>'
            .'<p style="color:#666;font-size:12px;margin-top:16px">Répondez à cet e-mail pour écrire directement à l’expéditeur.</p>'
            .'</div>';
    }
}
