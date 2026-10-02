<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) — §9.7
    |--------------------------------------------------------------------------
    |
    | Les origines autorisées sont une liste EXPLICITE (jamais `*` en
    | production, surtout avec `supports_credentials = true`). La liste est
    | pilotée par la variable `CORS_ALLOWED_ORIGINS` (séparée par des virgules).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:8000'))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'Origin',
        'X-Requested-With',
        'X-XSRF-TOKEN',
        'X-Request-ID',
    ],

    // En-têtes exposés au front (pagination) — n'exposent aucune donnée sensible.
    'exposed_headers' => ['X-Request-ID'],

    'max_age' => 3600,

    'supports_credentials' => true,

];
