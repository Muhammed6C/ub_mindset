<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Contrôle d'accès back-office — « deny by default ».
 *
 * L'accès est refusé par défaut : seuls les utilisateurs authentifiés dont le
 * rôle donne accès au back-office ET dont le compte est actif sont autorisés.
 */
class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 401 : non authentifié.
        if ($user === null) {
            return new JsonResponse(['message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // 403 : authentifié mais pas admin/staff.
        $role = $user->role;
        if (! $role instanceof UserRole || ! $role->isAdmin()) {
            return new JsonResponse(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        // 403 : compte suspendu (l'admin prime sur le flag, mais on bloque les suspendus non-admin).
        if (! $user->is_active) {
            return new JsonResponse(['message' => 'Compte désactivé.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
