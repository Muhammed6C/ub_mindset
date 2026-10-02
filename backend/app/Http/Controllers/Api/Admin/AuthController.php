<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authentification back-office (§9.2 / §9.3).
 *
 * Endpoint séparé du login client : n'émet un token QUE pour un compte
 * admin/staff actif, et renvoie un message générique dans tous les autres cas
 * (aucune fuite sur l'existence du compte).
 */
class AuthController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    private const DECAY_SECONDS = 60;

    public function __construct(private readonly AuditLogger $audit) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $throttleKey = 'admin-login|'.mb_strtolower($data['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            $this->audit->security('admin_login.throttled', ['email' => $data['email']]);

            return response()->json([
                'message' => 'Trop de tentatives de connexion. Veuillez réessayer dans une minute.',
            ], Response::HTTP_TOO_MANY_REQUESTS, [
                'Retry-After' => (string) RateLimiter::availableIn($throttleKey),
            ]);
        }

        $user = User::where('email', $data['email'])->first();

        // Message générique : on ne distingue ni compte inexistant, ni mot de passe
        // erroné, ni compte non-admin, ni compte désactivé.
        $isValid = $user !== null && Hash::check($data['password'], $user->password);
        $isAdmin = $isValid && $user->is_active && $user->role?->isAdmin() === true;

        if (! $isAdmin) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);
            $this->audit->security('admin_login.denied', ['email' => $data['email']]);

            return response()->json(['message' => 'Identifiants invalides.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        RateLimiter::clear($throttleKey);

        /** @var User $user */
        $user->tokens()->delete();

        $expiresAt = config('sanctum.expiration')
            ? now()->addMinutes((int) config('sanctum.expiration'))
            : null;

        $token = $user->createToken('admin:'.($data['device_name'] ?? 'panel'), ['admin'], $expiresAt);

        $user->forceFill(['last_login_at' => now()])->save();
        $this->audit->security('admin_login.success', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt?->toIso8601String(),
            'user' => new UserResource($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        $this->audit->security('admin_logout', ['user_id' => $request->user()?->id]);

        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
