<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mediable_type' => 'required|string',
            'mediable_id'   => 'required|integer|min:1',
            'url'           => 'required|string|max:1000',
            'alt_text'      => 'nullable|string|max:255',
            'type'          => 'in:IMAGE,VIDEO',
            'sort_order'    => 'integer|min:0',
            'is_carousel'   => 'boolean',
            'is_cover'      => 'boolean',
        ]);

        $media = Media::create($data);

        return response()->json($media, 201);
    }

    public function update(Request $request, Media $media): JsonResponse
    {
        $data = $request->validate([
            'alt_text'    => 'nullable|string|max:255',
            'sort_order'  => 'integer|min:0',
            'is_carousel' => 'boolean',
            'is_cover'    => 'boolean',
        ]);

        $media->update($data);

        return response()->json($media);
    }

    public function destroy(Media $media): JsonResponse
    {
        $media->delete();

        return response()->json(['message' => 'Media deleted.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items'          => 'required|array',
            'items.*.id'     => 'required|exists:media,id',
            'items.*.order'  => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Media::where('id', $item['id'])->update(['sort_order' => $item['order']]);
        }

        return response()->json(['message' => 'Media reordered.']);
    }
}
