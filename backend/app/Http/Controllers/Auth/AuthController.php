<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const ADMIN_ROLES = ['super-admin', 'admin'];

    /** Session CMS (back-office) — 8 hours */
    private const ADMIN_TOKEN_HOURS = 8;

    /** Live editor handoff — short-lived, never reuse the long admin token in URLs */
    private const EDIT_TOKEN_MINUTES = 60;

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        /** @var User|null $user */
        $user = User::query()->where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check((string) $request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Votre compte a été désactivé.'], 403);
        }

        $user->load('roles.permissions');

        if (! $user->hasAnyRole(self::ADMIN_ROLES)) {
            return response()->json(['message' => 'Accès réservé aux administrateurs FI2T.'], 403);
        }

        // One active admin session per login — revoke previous PATs
        $user->tokens()->delete();

        $token = $user->createToken(
            'admin-token',
            ['cms-admin'],
            now()->addHours(self::ADMIN_TOKEN_HOURS),
        )->plainTextToken;

        return response()->json([
            'user'       => new UserResource($user),
            'token'      => $token,
            'expires_in' => self::ADMIN_TOKEN_HOURS * 3600,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()->load('roles.permissions')));
    }

    public function changePassword(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token && ! $token->can('cms-admin')) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'current_password' => 'required|string|current_password',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update(['password' => $request->password]);

        // Force re-auth after password change
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Mot de passe modifié. Reconnectez-vous.']);
    }

    /**
     * Issue a short-lived token for the public-site Live Editor.
     * Never put the long-lived admin PAT in a query string.
     */
    public function createEditSession(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->load('roles');

        if (! $user->hasAnyRole(self::ADMIN_ROLES)) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        // Drop only expired live-edit tokens — never invalidate an active Aperçu session.
        $user->tokens()
            ->where('name', 'cms-edit')
            ->where(function ($q) {
                $q->whereNotNull('expires_at')->where('expires_at', '<', now());
            })
            ->delete();

        $expiresAt = now()->addMinutes(self::EDIT_TOKEN_MINUTES);
        $token = $user->createToken(
            'cms-edit',
            ['cms-edit'],
            $expiresAt,
        )->plainTextToken;

        return response()->json([
            'token'      => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'expires_in' => self::EDIT_TOKEN_MINUTES * 60,
            'token_type' => 'Bearer',
        ]);
    }
}
