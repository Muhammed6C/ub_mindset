<?php

use App\Http\Middleware\CorrelationId;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Identifiant de corrélation sur TOUTES les requêtes (traçabilité / audit).
        $middleware->prepend(CorrelationId::class);

        // En-têtes de sécurité sur TOUTES les réponses (§9.13).
        $middleware->append(SecurityHeaders::class);

        // Rate limiting global de l'API (limiteur nommé « api »).
        $middleware->throttleApi();

        // Alias des middlewares applicatifs.
        $middleware->alias([
            'admin' => EnsureIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
