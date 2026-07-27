<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Locale;
use App\Models\Translation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    /* ── Public ───────────────────────────────────────────────────────────── */

    /**
     * GET /api/translations/{locale}
     * Returns flat key→value map for use by any frontend (public website etc.)
     */
    public function show(string $locale): JsonResponse
    {
        $flat = Translation::flatForLocale($locale);
        return response()->json($flat);
    }

    /**
     * GET /api/translations/all
     * Returns all locales grouped — used by the admin app to prime i18next
     */
    public function all(): JsonResponse
    {
        return response()->json(Translation::allGrouped());
    }

    /* ── Admin ────────────────────────────────────────────────────────────── */

    /**
     * GET /admin/translations
     * Returns locales list + all translation rows
     */
    public function index(): JsonResponse
    {
        $locales      = Locale::orderBy('sort_order')->get();
        $translations = Translation::all()
                            ->groupBy('locale')
                            ->map(fn ($rows) => $rows->keyBy('key'));

        return response()->json([
            'locales'      => $locales,
            'translations' => $translations,
        ]);
    }

    /**
     * POST /admin/translations/bulk
     * Upsert multiple key/value pairs for one or many locales at once.
     * Body: { changes: [ { locale, key, value }, … ] }
     */
    public function bulk(Request $request): JsonResponse
    {
        $request->validate([
            'changes'          => 'required|array',
            'changes.*.locale' => 'required|string|max:10',
            'changes.*.key'    => 'required|string|max:255',
            'changes.*.value'  => 'nullable|string',
        ]);

        foreach ($request->changes as $item) {
            Translation::updateOrCreate(
                ['locale' => $item['locale'], 'key' => $item['key']],
                ['value'  => $item['value'] ?? '']
            );
        }

        return response()->json(['message' => 'Traductions enregistrées', 'count' => count($request->changes)]);
    }

    /**
     * POST /admin/translations/locales
     * Add a new language and optionally pre-populate it from another locale.
     */
    public function addLocale(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'      => 'required|string|max:10|unique:locales,code',
            'name'      => 'required|string|max:80',
            'flag'      => 'nullable|string|max:10',
            'direction' => 'in:ltr,rtl',
            'copy_from' => 'nullable|string|max:10|exists:locales,code',
        ]);

        $locale = Locale::create([
            'code'       => $data['code'],
            'name'       => $data['name'],
            'flag'       => $data['flag'] ?? null,
            'direction'  => $data['direction'] ?? 'ltr',
            'is_active'  => true,
            'sort_order' => (Locale::max('sort_order') ?? -1) + 1,
        ]);

        // If copying from another locale, clone all its translations (as empty placeholders)
        if (!empty($data['copy_from'])) {
            $source = Translation::where('locale', $data['copy_from'])->get();
            foreach ($source as $t) {
                Translation::firstOrCreate(
                    ['locale' => $data['code'], 'key' => $t->key],
                    ['value'  => '']  // empty — admin will translate
                );
            }
        }

        return response()->json($locale, 201);
    }

    /**
     * DELETE /admin/translations/locales/{code}
     * Remove a locale and all its translations.
     */
    public function deleteLocale(string $code): JsonResponse
    {
        // Prevent deleting base languages
        if (in_array($code, ['fr', 'en', 'ar'])) {
            return response()->json(['message' => 'Impossible de supprimer une langue de base.'], 422);
        }
        Translation::where('locale', $code)->delete();
        Locale::where('code', $code)->delete();
        return response()->json(null, 204);
    }
}
