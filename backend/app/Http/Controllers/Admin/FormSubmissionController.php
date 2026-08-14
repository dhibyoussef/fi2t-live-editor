<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FormSubmissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $type = $request->string('type')->toString();
        $status = $request->string('status')->toString();
        $search = trim($request->string('search')->toString());

        $query = FormSubmission::query()->latest();

        if (in_array($type, ['contact', 'newsletter', 'adhesion'], true)) {
            $query->where('type', $type);
        }
        if (in_array($status, ['new', 'read', 'archived'], true)) {
            $query->where('status', $status);
        }
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $perPage = min(50, max(1, $request->integer('per_page', 15)));
        $page = $query->paginate($perPage);

        return response()->json([
            'data' => $page->items(),
            'total' => $page->total(),
            'last_page' => $page->lastPage(),
            'current_page' => $page->currentPage(),
            'unread' => FormSubmission::query()->where('status', 'new')->count(),
            'counts' => [
                'all' => FormSubmission::query()->count(),
                'contact' => FormSubmission::query()->where('type', 'contact')->count(),
                'newsletter' => FormSubmission::query()->where('type', 'newsletter')->count(),
                'adhesion' => FormSubmission::query()->where('type', 'adhesion')->count(),
                'new' => FormSubmission::query()->where('status', 'new')->count(),
            ],
        ]);
    }

    public function unread(): JsonResponse
    {
        $unread = FormSubmission::query()->where('status', 'new')->count();
        $latest = FormSubmission::query()
            ->where('status', 'new')
            ->latest()
            ->limit(8)
            ->get(['id', 'type', 'name', 'email', 'subject', 'created_at']);

        return response()->json([
            'unread' => $unread,
            'latest' => $latest,
        ]);
    }

    public function show(FormSubmission $formSubmission): JsonResponse
    {
        $formSubmission->markRead();

        return response()->json($formSubmission->fresh());
    }

    public function update(Request $request, FormSubmission $formSubmission): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:new,read,archived',
        ]);

        $formSubmission->status = $data['status'];
        $formSubmission->read_at = $data['status'] === 'new' ? null : ($formSubmission->read_at ?? now());
        $formSubmission->save();

        return response()->json($formSubmission);
    }

    public function markAllRead(): JsonResponse
    {
        FormSubmission::query()
            ->where('status', 'new')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);

        return response()->json(['ok' => true]);
    }

    public function destroy(FormSubmission $formSubmission): JsonResponse
    {
        $formSubmission->delete();

        return response()->json(['ok' => true]);
    }
}
