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

                    $imageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/bmp', 'image/x-icon', 'image/vnd.microsoft.icon'];
                    $imageExts  = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'];

                    if (str_starts_with($mime, 'image/') || in_array($mime, $imageMimes, true) || in_array($ext, $imageExts, true)) {
                        return;
                    }

                    $fail('Le fichier doit être une image (JPEG, PNG, WebP, GIF, SVG…).');
                },
            ],
        ];
    }
}
