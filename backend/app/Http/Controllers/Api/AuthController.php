<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authentification API (Sanctum) — §9.2.
 *
 * - Message d'erreur générique (jamais d'énumération d'emails) ;
 * - Verrouillage progressif par email + IP ;
 * - Révocation des anciens tokens (une session par compte) ;
 * - Token à durée de vie limitée + journalisation d'audit.
 */
class AuthController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    private const DECAY_SECONDS = 60;

    public function __construct(private readonly AuditLogger $audit) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $throttleKey = 'login|'.mb_strtolower($data['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            $this->audit->security('login.throttled', ['email' => $data['email']]);

            return response()->json([
                'message' => 'Trop de tentatives de connexion. Veuillez réessayer dans une minute.',
            ], Response::HTTP_TOO_MANY_REQUESTS, [
                'Retry-After' => (string) RateLimiter::availableIn($throttleKey),
            ]);
        }

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);
            $this->audit->security('login.failed', ['email' => $data['email']]);

            throw ValidationException::withMessages(['email' => 'Identifiants invalides.']);
        }

        if (! $user->is_active) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);
            $this->audit->security('login.inactive', ['user_id' => $user->id]);

            throw ValidationException::withMessages([
                'email' => "Votre compte a été désactivé. Contactez l'administrateur.",
            ]);
        }

        RateLimiter::clear($throttleKey);

        // Une seule session active : révocation des tokens précédents.
        $user->tokens()->delete();

        $expiresAt = config('sanctum.expiration')
            ? now()->addMinutes((int) config('sanctum.expiration'))
            : null;

        $token = $user->createToken($data['device_name'] ?? 'web', ['customer'], $expiresAt);

        $user->forceFill(['last_login_at' => now()])->save();
        $this->audit->security('login.success', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt?->toIso8601String(),
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        $this->audit->security('logout', ['user_id' => $request->user()?->id]);

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }
}
