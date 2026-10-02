<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ajoute des en-têtes de sécurité HTTP (voir §9.13 du plan backend).
 *
 * - CSP stricte (aucun inline non maîtrisé) ;
 * - anti-clickjacking (X-Frame-Options / frame-ancestors) ;
 * - anti-sniffing MIME ;
 * - politique de référent ;
 * - restrictions navigateur (caméra/micro/géoloc) ;
 * - HSTS uniquement sur connexion sécurisée ;
 * - suppression des en-têtes révélateurs (X-Powered-By).
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // CSP stricte pour l'API/JSON ; CSP raisonnable pour les pages web.
        // On n'écrase JAMAIS une CSP déjà posée par le contrôleur (ex. médias).
        if (! $response->headers->has('Content-Security-Policy')) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $response->headers->set(
                    'Content-Security-Policy',
                    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
                );
            } else {
                $response->headers->set(
                    'Content-Security-Policy',
                    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; "
                    ."script-src 'self'; font-src 'self' data:; connect-src 'self'; "
                    ."frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
                );
            }
        }

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
        );

        // CORP : « same-origin » par défaut, mais un contrôleur peut l'ouvrir
        // (ex. médias publics consommés par le front sur une autre origine).
        if (! $response->headers->has('Cross-Origin-Resource-Policy')) {
            $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');
        }

        // HSTS : uniquement lorsque la requête est réellement en HTTPS (jamais en clair).
        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // Retrait des en-têtes révélateurs (PHP / framework).
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
