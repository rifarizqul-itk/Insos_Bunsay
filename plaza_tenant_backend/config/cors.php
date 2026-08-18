<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Enables secure Cross-Origin Resource Sharing (CORS) for dual-domain SPA
    | setup: tenant portal (bunsayhub.id) and admin console (admin.bunsayhub.id).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', implode(',', [
        'https://bunsayhub.id',
        'https://admin.bunsayhub.id',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
    ]))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'X-Requested-With', 'Authorization', 'Accept', 'Origin', 'X-XSRF-TOKEN'],

    'exposed_headers' => ['Authorization'],

    'max_age' => 86400,

    'supports_credentials' => true,

];
