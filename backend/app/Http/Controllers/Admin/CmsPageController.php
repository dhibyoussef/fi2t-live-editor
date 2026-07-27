<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\ContentBlock;
use App\Services\CmsBlockPatterns;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class CmsPageController extends Controller
{
    /** GET /api/pages/{slug} — public page with sections (published only) */
    public function publicShow(string $slug, Request $request): JsonResponse
    {
        $page = CmsPage::where('slug', $slug)->first();

        if (! $page) {
            return response()->json(['message' => 'Page introuvable'], 404);
        }

        if ($page->status !== 'published' && ! $this->isAdminPreview($request)) {
            return response()->json(['message' => 'Cette page est en brouillon', 'status' => 'draft'], 403);
        }

        $locale   = $request->query('locale', 'fr');
        $flat     = ContentBlock::flatForPage($slug, $locale);
        $sections = CmsSection::where('page', $slug)->orderBy('sort_order')->get();

        $out = [];
        foreach ($sections as $sec) {
            $blocks  = [];
            $prefix  = $sec->slug . '.';
            foreach ($flat as $compound => $value) {
                if (str_starts_with($compound, $prefix)) {
                    $blocks[substr($compound, strlen($prefix))] = $value;
                }
            }
            if (count($blocks) > 0 || $sec->pattern) {
                $out[] = [
                    'slug'    => $sec->slug,
                    'title'   => $sec->title,
                    'pattern' => $sec->pattern,
                    'blocks'  => $blocks,
                ];
            }
        }

        return response()->json([
            'page'     => $page->only(['slug', 'title', 'status', 'template', 'meta_title', 'meta_description']),
            'sections' => $out,
        ]);
    }

    private function isAdminPreview(Request $request): bool
    {
        $token = $request->bearerToken();
        if (! $token) {
            return false;
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if (! $accessToken?->tokenable) {
            return false;
        }

        return $accessToken->tokenable->hasRole(['super-admin', 'admin']);
    }

    /** GET /admin/content/pages */
    public function index(): JsonResponse
    {
        $pages = CmsPage::query()
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return response()->json($pages);
    }

    /** GET /admin/content/patterns — block library (WordPress-like) */
    public function patterns(): JsonResponse
    {
        $patterns = CmsBlockPatterns::all();
        $out = [];
        foreach ($patterns as $id => $p) {
            $out[] = [
                'id'          => $id,
                'title'       => $p['title'],
                'description' => $p['description'],
                'category'    => $p['category'],
                'block_count' => count($p['blocks']),
            ];
        }
        return response()->json($out);
    }

    /** POST /admin/content/pages */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:191',
            'slug'             => 'nullable|string|max:80|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/|unique:cms_pages,slug',
            'status'           => 'nullable|in:draft,published',
            'template'         => 'nullable|in:default,home,landing,global',
            'meta_title'       => 'nullable|string|max:191',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $slug = $data['slug'] ?? Str::slug($data['title']);
        if (CmsPage::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . time();
        }

        $page = CmsPage::create([
            'slug'             => $slug,
            'title'            => $data['title'],
            'status'           => $data['status'] ?? 'draft',
            'template'         => $data['template'] ?? 'default',
            'meta_title'       => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'sort_order'       => (CmsPage::max('sort_order') ?? 0) + 1,
        ]);

        return response()->json($page, 201);
    }

    /** PUT /admin/content/pages/{cmsPage} */
    public function update(CmsPage $cmsPage, Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'sometimes|string|max:191',
            'status'           => 'sometimes|in:draft,published',
            'template'         => 'sometimes|in:default,home,landing,global',
            'meta_title'       => 'nullable|string|max:191',
            'meta_description' => 'nullable|string|max:500',
            'sort_order'       => 'sometimes|integer|min:0',
        ]);

        $cmsPage->update($data);
        $cmsPage->refresh();

        return response()->json($cmsPage);
    }

    /** DELETE /admin/content/pages/{cmsPage} */
    public function destroy(CmsPage $cmsPage): JsonResponse
    {
        if ($cmsPage->is_system) {
            return response()->json(['message' => 'Cette page système ne peut pas être supprimée'], 422);
        }

        ContentBlock::where('page', $cmsPage->slug)->delete();
        CmsSection::where('page', $cmsPage->slug)->delete();
        $cmsPage->delete();

        return response()->json(['message' => 'Page supprimée']);
    }

    /** POST /admin/content/insert-pattern — add a section + blocks (WordPress block inserter) */
    public function insertPattern(Request $request): JsonResponse
    {
        $data = $request->validate([
            'page'          => 'required|string|max:80|exists:cms_pages,slug',
            'pattern'       => 'required|string|max:50',
            'section_title' => 'nullable|string|max:191',
            'insert_after'  => 'nullable|string|max:80',
        ]);

        $pattern = CmsBlockPatterns::get($data['pattern']);
        if (! $pattern) {
            return response()->json(['message' => 'Modèle de bloc inconnu'], 422);
        }

        $sectionTitle = $data['section_title'] ?? $pattern['title'];
        $baseSlug     = Str::slug($sectionTitle) ?: $data['pattern'];
        $sectionSlug  = $baseSlug;
        $i            = 1;
        while (CmsSection::where('page', $data['page'])->where('slug', $sectionSlug)->exists()) {
            $sectionSlug = $baseSlug . '_' . $i++;
        }

        $insertAfter = $data['insert_after'] ?? '__end__';

        if ($insertAfter === '__start__') {
            CmsSection::where('page', $data['page'])->increment('sort_order');
            $sortOrder = 0;
        } elseif ($insertAfter !== '__end__') {
            $afterSec = CmsSection::where('page', $data['page'])->where('slug', $insertAfter)->first();
            $sortOrder = $afterSec
                ? $afterSec->sort_order + 1
                : ((CmsSection::where('page', $data['page'])->max('sort_order') ?? 0) + 1);
            CmsSection::where('page', $data['page'])
                ->where('sort_order', '>=', $sortOrder)
                ->increment('sort_order');
        } else {
            $sortOrder = (CmsSection::where('page', $data['page'])->max('sort_order') ?? 0) + 1;
        }

        $section = CmsSection::create([
            'page'       => $data['page'],
            'slug'       => $sectionSlug,
            'title'      => $sectionTitle,
            'pattern'    => $data['pattern'],
            'sort_order' => $sortOrder,
        ]);

        $created = 0;
        foreach ($pattern['blocks'] as $block) {
            ContentBlock::updateOrCreate(
                [
                    'page'    => $data['page'],
                    'section' => $sectionSlug,
                    'key'     => $block['key'],
                    'locale'  => $block['locale'] ?? 'fr',
                ],
                [
                    'type'       => $block['type'],
                    'value'      => $block['value'] ?? null,
                    'label'      => $block['label'] ?? null,
                    'sort_order' => $block['sort_order'] ?? 0,
                ]
            );
            $created++;
        }

        return response()->json([
            'message' => 'Section ajoutée',
            'section' => $section,
            'blocks'  => $created,
        ], 201);
    }

    /** DELETE /admin/content/sections — remove whole section + its blocks */
    public function destroySection(Request $request): JsonResponse
    {
        $data = $request->validate([
            'page'    => 'required|string|max:80',
            'section' => 'required|string|max:80',
        ]);

        ContentBlock::where('page', $data['page'])->where('section', $data['section'])->delete();
        CmsSection::where('page', $data['page'])->where('slug', $data['section'])->delete();

        return response()->json(['message' => 'Section supprimée']);
    }
}
