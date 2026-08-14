<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AutoTranslator
{
    public function translate(string $text, string $from, string $to): string
    {
        $text = trim($text);
        if ($text === '' || $from === $to) {
            return $text;
        }
        if (preg_match('#^(https?:|/storage/|/images/|/fi2t/)#i', $text)) {
            return $text;
        }

        $chunks = $this->split($text, 450);
        $out = [];
        foreach ($chunks as $chunk) {
            $out[] = $this->request($chunk, $from, $to);
        }

        return trim(implode(' ', $out)) ?: $text;
    }

    /**
     * @param  array<int|string, string>  $texts
     * @return array<int|string, string>
     */
    public function translateMany(array $texts, string $from, string $to): array
    {
        $result = [];
        foreach ($texts as $key => $value) {
            $result[$key] = $this->translate((string) $value, $from, $to);
        }

        return $result;
    }

    private function request(string $text, string $from, string $to): string
    {
        try {
            $query = [
                'q' => $text,
                'langpair' => $from.'|'.$to,
            ];
            $email = (string) config('services.mymemory.email', '');
            if ($email !== '') {
                $query['de'] = $email;
            }

            $res = Http::timeout(20)->acceptJson()->get('https://api.mymemory.translated.net/get', $query);
            $translated = $res->json('responseData.translatedText');
            if (! is_string($translated) || $translated === '') {
                return $text;
            }

            $translated = html_entity_decode($translated, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if (str_contains(strtolower($translated), 'my memory')) {
                return $text;
            }

            return $translated;
        } catch (\Throwable) {
            return $text;
        }
    }

    /** @return list<string> */
    private function split(string $text, int $max): array
    {
        if (mb_strlen($text) <= $max) {
            return [$text];
        }
        $parts = preg_split('/(?<=\.|\n|!|\?)\s+/u', $text) ?: [$text];
        $chunks = [];
        $buf = '';
        foreach ($parts as $part) {
            if ($buf !== '' && mb_strlen($buf.' '.$part) > $max) {
                $chunks[] = $buf;
                $buf = $part;
            } else {
                $buf = $buf === '' ? $part : $buf.' '.$part;
            }
        }
        if ($buf !== '') {
            $chunks[] = $buf;
        }

        return $chunks ?: [$text];
    }
}
