<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ValidatesImageUpload;
use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\ContentBlock;
use App\Services\ContentLocaleSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContentBlockController extends Controller
{
    use ValidatesImageUpload;
    /** GET /api/content — all pages (public) */
    public function all(Request $request): JsonResponse
    {
        $locale = $request->query('locale', 'fr');
        return response()->json(ContentBlock::allGrouped($locale));
    }

    /** GET /api/content/{page} — single page (public) */
    public function show(string $page, Request $request): JsonResponse
    {
        $locale = $request->query('locale', 'fr');
        return response()->json([
            'page'   => $page,
            'locale' => $locale,
            'blocks' => ContentBlock::flatForPage($page, $locale),
        ]);
    }

    /** GET /admin/content — list all blocks (admin) */
    public function index(Request $request): JsonResponse
    {
        $query = ContentBlock::query()->orderBy('page')->orderBy('section')->orderBy('sort_order');

        if ($request->filled('page')) {
            $query->where('page', $request->page);
        }

        return response()->json($query->get());
    }

    /** GET /admin/content/matrix — grouped by section for the editor UI */
    public function matrix(Request $request): JsonResponse
    {
        $page = $request->query('page', 'home');

        $sectionMeta = CmsSection::query()
            ->where('page', $page)
            ->orderBy('sort_order')
            ->get()
            ->keyBy('slug');

        $blocks = ContentBlock::query()
            ->where('page', $page)
            ->orderBy('section')
            ->orderBy('sort_order')
            ->orderBy('key')
            ->get();

        $sections = [];
        foreach ($sectionMeta as $slug => $meta) {
            $sections[$slug] = [
                'name'    => $slug,
                'title'   => $meta->title,
                'pattern' => $meta->pattern,
                'blocks'  => [],
            ];
        }

        foreach ($blocks as $block) {
            if (! isset($sections[$block->section])) {
                $sections[$block->section] = [
                    'name'    => $block->section,
                    'title'   => ucfirst(str_replace('_', ' ', $block->section)),
                    'pattern' => null,
                    'blocks'  => [],
                ];
            }

            $bk = $block->key;
            if (! isset($sections[$block->section]['blocks'][$bk])) {
                $sections[$block->section]['blocks'][$bk] = [
                    'key'        => $block->key,
                    'type'       => $block->type,
                    'label'      => $block->label,
                    'sort_order' => $block->sort_order,
                    'locales'    => [],
                ];
            }

            $entry = &$sections[$block->section]['blocks'][$bk];
            if ($block->label && empty($entry['label'])) {
                $entry['label'] = $block->label;
            }
            $entry['locales'][$block->locale] = [
                'id'    => $block->id,
                'value' => $block->value,
            ];
        }

        $out = [];
        foreach ($sections as $section) {
            $section['blocks'] = array_values($section['blocks']);
            if (count($section['blocks']) > 0 || isset($sectionMeta[$section['name']])) {
                $out[] = $section;
            }
        }

        usort($out, function ($a, $b) use ($sectionMeta) {
            $oa = isset($sectionMeta[$a['name']]) ? $sectionMeta[$a['name']]->sort_order : 999;
            $ob = isset($sectionMeta[$b['name']]) ? $sectionMeta[$b['name']]->sort_order : 999;
            return $oa <=> $ob;
        });

        $cmsPages = CmsPage::query()->orderBy('sort_order')->get();

        return response()->json([
            'page'      => $page,
            'page_meta' => CmsPage::where('slug', $page)->first(),
            'pages'     => $cmsPages,
            'sections'  => $out,
        ]);
    }

    /** DELETE /admin/content/block — remove one locale row or whole block */
    public function destroyBlock(Request $request): JsonResponse
    {
        $data = $request->validate([
            'page'    => 'required|string|max:50',
            'section' => 'required|string|max:80',
            'key'     => 'required|string|max:100',
            'locale'  => 'nullable|string|max:10',
        ]);

        $query = ContentBlock::query()
            ->where('page', $data['page'])
            ->where('section', $data['section'])
            ->where('key', $data['key']);

        if (! empty($data['locale'])) {
            $query->where('locale', $data['locale']);
        }

        $count = $query->delete();

        return response()->json(['message' => 'Bloc supprimé', 'count' => $count]);
    }

    /** POST /admin/content/bulk — upsert multiple blocks */
    public function bulk(Request $request, ContentLocaleSync $sync): JsonResponse
    {
        $data = $request->validate([
            'blocks'              => 'required|array|min:1',
            'blocks.*.page'       => 'required|string|max:50',
            'blocks.*.section'    => 'required|string|max:80',
            'blocks.*.key'        => 'required|string|max:100',
            'blocks.*.locale'     => 'nullable|string|max:10',
            'blocks.*.type'       => 'nullable|in:text,image,json',
            'blocks.*.value'      => 'nullable|string',
            'blocks.*.label'      => 'nullable|string|max:191',
            'blocks.*.sort_order' => 'nullable|integer|min:0',
            'blocks.*.sync_locales' => 'nullable|array',
            'blocks.*.sync_locales.*' => 'string|max:10',
            'source_locale'       => 'nullable|string|max:10',
            'translate'           => 'sometimes|boolean',
        ]);

        $sourceLocale = strtolower((string) ($data['source_locale'] ?? ''));
        if (! in_array($sourceLocale, ['fr', 'en', 'ar'], true)) {
            $sourceLocale = '';
        }
        $translate = $data['translate'] ?? true;

        $previous = [];
        $saved = [];
        foreach ($data['blocks'] as $block) {
            $locale = $block['locale'] ?? '_all';
            $type = $block['type'] ?? 'text';
            $id = $block['page']."\0".$block['section']."\0".$block['key']."\0".$locale;
            if (! array_key_exists($id, $previous)) {
                $previous[$id] = ContentBlock::query()
                    ->where('page', $block['page'])
                    ->where('section', $block['section'])
                    ->where('key', $block['key'])
                    ->where('locale', $locale)
                    ->value('value');
            }

            $saved[] = ContentBlock::updateOrCreate(
                [
                    'page'    => $block['page'],
                    'section' => $block['section'],
                    'key'     => $block['key'],
                    'locale'  => $locale,
                ],
                [
                    'type'       => $type,
                    'value'      => $block['value'] ?? null,
                    'label'      => $block['label'] ?? null,
                    'sort_order' => $block['sort_order'] ?? 0,
                ]
            );

            // Shared (_all) images/positions must win — drop per-language duplicates
            // so uploads/edits are visible in FR, EN and AR.
            if ($locale === '_all') {
                ContentBlock::query()
                    ->where('page', $block['page'])
                    ->where('section', $block['section'])
                    ->where('key', $block['key'])
                    ->whereIn('locale', ['fr', 'en', 'ar'])
                    ->delete();
            }

            if (! empty($block['label'])) {
                ContentBlock::query()
                    ->where('page', $block['page'])
                    ->where('section', $block['section'])
                    ->where('key', $block['key'])
                    ->update(['label' => $block['label']]);
            }
        }

        // The saved language is canonical: add/delete/reorder/text apply to FR+EN+AR.
        $propagate = [];
        foreach ($data['blocks'] as $block) {
            $locale = $block['locale'] ?? '_all';
            if (! in_array($locale, ['fr', 'en', 'ar'], true)) {
                continue;
            }
            if ($sourceLocale !== '' && $locale !== $sourceLocale) {
                continue;
            }
            $id = $block['page'].'|'.$block['section'].'|'.$block['key'];
            $propagate[$id] = $block;
        }

        set_time_limit(180);
        foreach ($propagate as $block) {
            $locale = $block['locale'] ?? 'fr';
            $pid = $block['page']."\0".$block['section']."\0".$block['key']."\0".$locale;
            $sync->propagateSaved(
                $block['page'],
                $block['section'],
                $block['key'],
                $block['type'] ?? 'text',
                $locale,
                $previous[$pid] ?? null,
                $block['value'] ?? null,
                $block['label'] ?? null,
                (int) ($block['sort_order'] ?? 0),
                $translate,
            );
        }

        return response()->json(['message' => 'Contenu mis à jour (FR / EN / AR)', 'count' => count($saved)]);
    }

    /** POST /admin/content/sync-locales — same structure in FR / EN / AR. */
    public function syncLocales(Request $request, ContentLocaleSync $sync): JsonResponse
    {
        $data = $request->validate([
            'page' => 'nullable|string|max:80',
            'translate' => 'sometimes|boolean',
            'deep' => 'sometimes|boolean',
            'source_locale' => 'nullable|string|max:10',
        ]);
        set_time_limit(180);
        $result = $sync->sync(
            $data['page'] ?? null,
            $data['translate'] ?? true,
            $data['deep'] ?? false,
            $data['source_locale'] ?? 'fr',
        );

        return response()->json([
            'message' => 'Structure alignée FR / EN / AR',
            ...$result,
        ]);
    }

    /** POST /admin/content/upload-image */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate($this->imageUploadRules());

        $file = $request->file('image');
        $ext  = strtolower((string) ($file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'jpg'));
        if (! in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp'], true)) {
            $ext = 'jpg';
        }
        $name = Str::random(40).'.'.$ext;

        $dirs = array_values(array_unique(array_filter([
            public_path('storage/website'),
            storage_path('app/public/website'),
            '/var/www/html/backend/storage/app/public/website',
            '/var/www/html/backend/public/storage/website',
        ])));

        $primary = null;
        foreach ($dirs as $dir) {
            if (! is_dir($dir) && ! @mkdir($dir, 0755, true) && ! is_dir($dir)) {
                continue;
            }
            $primary = $dir;
            break;
        }
        if (! $primary) {
            return response()->json(['message' => 'Dossier images inaccessible.'], 500);
        }

        if (! $file->move($primary, $name)) {
            return response()->json(['message' => 'Impossible d’enregistrer l’image.'], 500);
        }

        $src = $primary.DIRECTORY_SEPARATOR.$name;
        @chmod($src, 0644);
        $bytes = @file_get_contents($src);
        if ($bytes === false || ! is_file($src)) {
            return response()->json(['message' => 'Le fichier n’a pas pu être écrit sur le serveur.'], 500);
        }

        foreach ($dirs as $dir) {
            if ($dir === $primary) {
                continue;
            }
            if (! is_dir($dir) && ! @mkdir($dir, 0755, true) && ! is_dir($dir)) {
                continue;
            }
            $copy = $dir.DIRECTORY_SEPARATOR.$name;
            if (@file_put_contents($copy, $bytes) !== false) {
                @chmod($copy, 0644);
            }
        }

        return response()->json([
            'url'  => '/storage/website/'.$name,
            'path' => 'website/'.$name,
        ]);
    }

    /** DELETE /admin/content/image */
    public function deleteImage(Request $request): JsonResponse
    {
        $request->validate(['path' => 'required|string|max:500']);
        $path = str_replace('\\', '/', ltrim($request->input('path'), '/'));

        // Only allow deletes under the website media prefix (no path traversal)
        if (
            str_contains($path, '..')
            || (! str_starts_with($path, 'website/') && ! str_starts_with($path, 'storage/website/'))
        ) {
            return response()->json(['message' => 'Chemin d’image non autorisé.'], 422);
        }

        $relative = str_starts_with($path, 'storage/') ? substr($path, strlen('storage/')) : $path;
        Storage::disk('public')->delete($relative);

        return response()->json(['message' => 'Image supprimée']);
    }
}
