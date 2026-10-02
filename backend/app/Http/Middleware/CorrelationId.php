<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Associe un identifiant de corrélation à chaque requête.
 *
 * - Réutilise `X-Request-ID` entrant uniquement s'il est valide (anti-injection d'en-tête) ;
 * - Sinon, en génère un UUID v4 ;
 * - Le renvoie dans la réponse pour faciliter le support et l'audit.
 */
class CorrelationId
{
    public function handle(Request $request, Closure $next): Response
    {
        $incoming = $request->header('X-Request-ID');

        $requestId = is_string($incoming) && Str::isUuid($incoming)
            ? $incoming
            : (string) Str::uuid();

        $request->attributes->set('request_id', $requestId);

        $response = $next($request);

        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
