<?php

namespace App\Http\Controllers\Concerns;

trait ValidatesImageUpload
{
    protected function imageUploadRules(int $maxKb = 8192): array
    {
        return [
            'image' => [
                'required',
                'file',
                "max:{$maxKb}",
                function (string $attribute, $value, \Closure $fail) use ($maxKb): void {
                    if (! $value->isValid()) {
                        $fail('Le téléversement a échoué. Vérifiez la taille du fichier (max '.round($maxKb / 1024, 1).' Mo).');

                        return;
                    }

                    $mime = strtolower((string) ($value->getMimeType() ?: $value->getClientMimeType() ?: ''));
                    $mime = trim(explode(';', $mime)[0]);
                    $ext  = strtolower((string) (
                        $value->getClientOriginalExtension()
                        ?: pathinfo((string) $value->getClientOriginalName(), PATHINFO_EXTENSION)
                    ));

                    $aliases = [
                        'image/jpg'   => 'image/jpeg',
                        'image/pjpeg' => 'image/jpeg',
                        'image/x-png' => 'image/png',
                        'image/x-webp'=> 'image/webp',
                    ];
                    $mime = $aliases[$mime] ?? $mime;

                    $imageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/bmp'];
                    $imageExts  = ['jpg', 'jpeg', 'jpe', 'jfif', 'png', 'gif', 'webp', 'avif', 'bmp'];

                    if (in_array($ext, ['svg', 'svgz'], true) || str_contains($mime, 'svg')) {
                        $fail('Les fichiers SVG ne sont pas autorisés (sécurité).');

                        return;
                    }

                    $realImage = false;
                    $path = $value->getRealPath() ?: $value->getPathname();
                    if (is_string($path) && $path !== '') {
                        $info = @getimagesize($path);
                        $realImage = is_array($info);
                    }

                    $mimeOk = in_array($mime, $imageMimes, true);
                    $extOk  = $ext === '' || in_array($ext, $imageExts, true);

                    // Accept a known image MIME, a real raster detected by GD, or a
                    // known extension whose bytes look like an image (finfo sometimes
                    // reports application/octet-stream for JPEGs from phones).
                    if (($mimeOk && $extOk) || $realImage) {
                        return;
                    }

                    $fail('Le fichier doit être une image (JPEG, PNG, WebP, GIF…).');
                },
            ],
        ];
    }
}
