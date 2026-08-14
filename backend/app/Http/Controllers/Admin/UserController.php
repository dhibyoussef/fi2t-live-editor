<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $search = trim((string) $request->input('search', ''));
        $users = User::with('roles')
            ->when($search !== '', function ($q) use ($search) {
                $like = '%'.$search.'%';
                $q->where(function ($inner) use ($like) {
                    $inner->where('first_name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('email', 'like', $like);
                });
            })
            ->when($request->role, fn ($q) => $q->role($request->role))
            ->latest()
            ->paginate(min(50, max(1, (int) ($request->per_page ?? 15))));

        return UserResource::collection($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|string|min:8|confirmed',
            'is_active'  => 'boolean',
            'roles'      => 'array',
            'roles.*'    => 'string|exists:roles,name',
        ]);

        $user = User::create($data);

        if (! empty($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return response()->json(new UserResource($user->load('roles')), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(new UserResource($user->load('roles.permissions')));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
            'email'      => "sometimes|email|unique:users,email,{$user->id}",
            'password'   => 'sometimes|string|min:8|confirmed',
            'is_active'  => 'boolean',
            'roles'      => 'array',
            'roles.*'    => 'string|exists:roles,name',
        ]);

        $user->update($data);

        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return response()->json(new UserResource($user->load('roles')));
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function toggleStatus(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 403);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json(new UserResource($user->load('roles')));
    }
}
