<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteNavItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteNavController extends Controller
{
    public function index(): JsonResponse
    {
        $items = SiteNavItem::query()
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'parent_id'       => 'nullable|exists:site_nav_items,id',
            'label_fr'        => 'required|string|max:255',
            'label_en'        => 'nullable|string|max:255',
            'label_ar'        => 'nullable|string|max:255',
            'url'             => 'required|string|max:500',
            'sort_order'      => 'integer|min:0',
            'is_active'       => 'boolean',
            'open_in_new_tab' => 'boolean',
        ]);

        if (! isset($data['sort_order'])) {
            $data['sort_order'] = $this->nextSortOrder($data['parent_id'] ?? null);
        }

        $item = SiteNavItem::create($data);

        return response()->json($item->load('children'), 201);
    }

    public function update(Request $request, SiteNavItem $siteNavItem): JsonResponse
    {
        $data = $request->validate([
            'parent_id'       => 'nullable|exists:site_nav_items,id',
            'label_fr'        => 'sometimes|string|max:255',
            'label_en'        => 'nullable|string|max:255',
            'label_ar'        => 'nullable|string|max:255',
            'url'             => 'sometimes|string|max:500',
            'sort_order'      => 'integer|min:0',
            'is_active'       => 'boolean',
            'open_in_new_tab' => 'boolean',
        ]);

        if (isset($data['parent_id']) && $data['parent_id'] == $siteNavItem->id) {
            return response()->json(['message' => 'Un élément ne peut pas être son propre parent.'], 422);
        }

        $siteNavItem->update($data);

        return response()->json($siteNavItem->fresh()->load('children'));
    }

    public function destroy(SiteNavItem $siteNavItem): JsonResponse
    {
        $siteNavItem->delete();

        return response()->json(['message' => 'Menu item deleted.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items'              => 'required|array',
            'items.*.id'         => 'required|exists:site_nav_items,id',
            'items.*.sort_order' => 'required|integer|min:0',
            'items.*.parent_id'  => 'nullable|exists:site_nav_items,id',
        ]);

        foreach ($request->items as $row) {
            SiteNavItem::where('id', $row['id'])->update([
                'sort_order' => $row['sort_order'],
                'parent_id'  => $row['parent_id'] ?? null,
            ]);
        }

        return response()->json(['message' => 'Menu reordered.']);
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $locale = in_array($request->locale, ['fr', 'en', 'ar']) ? $request->locale : 'fr';

        return response()->json(SiteNavItem::treeForLocale($locale, true));
    }

    private function nextSortOrder(?int $parentId): int
    {
        $max = SiteNavItem::query()
            ->where('parent_id', $parentId)
            ->max('sort_order');

        return ($max ?? -1) + 1;
    }
}
