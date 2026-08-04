<?php

namespace App\Http\Controllers\Concerns;

trait ValidatesImageUpload
{
    protected function imageUploadRules(int $maxKb = 2048): array
    {
        return [
            'image' => [
                'required',
                'file',
                "max:{$maxKb}",
                function (string $attribute, $value, \Closure $fail) use ($maxKb): void {
                    if (! $value->isValid()) {
                        $fail('Le téléversement a échoué. Vérifiez la taille du fichier (max '.round($maxKb / 1024).' Mo).');

                        return;
                    }

                    $mime = strtolower($value->getMimeType() ?: '');
                    $ext  = strtolower($value->getClientOriginalExtension() ?: '');

                    $imageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/bmp'];
                    $imageExts  = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp'];

                    if (in_array($ext, ['svg', 'svgz'], true) || str_contains($mime, 'svg')) {
                        $fail('Les fichiers SVG ne sont pas autorisés (sécurité).');

                        return;
                    }

                    if (str_starts_with($mime, 'image/') || in_array($mime, $imageMimes, true) || in_array($ext, $imageExts, true)) {
                        return;
                    }

                    $fail('Le fichier doit être une image (JPEG, PNG, WebP, GIF…).');
                },
            ],
        ];
    }
}
