<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\MediaController as AdminMediaController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProductVariantController as AdminVariantController;
use App\Http\Controllers\Api\Admin\PromotionController as AdminPromotionController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\ShippingZoneController as AdminShippingZoneController;
use App\Http\Controllers\Api\Admin\StockController as AdminStockController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ShippingZoneController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Routes publiques — §6.1
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'UB Mindset API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Catalogue (lecture seule)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show'])->whereNumber('id');

// Authentification client — rate limited (anti-bruteforce).
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Commandes : création rate limited ; suivi protégé par jeton non devinable.
Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:orders');
Route::get('/orders/{orderNumber}', [OrderController::class, 'show'])
    ->where('orderNumber', '[A-Za-z0-9\-]+');

// Médias publics : servis avec un Content-Type maîtrisé (§9.5 / §9.9).
// Les médias privés renvoient 404 aux visiteurs non authentifiés.
Route::get('/media/{media}', [AdminMediaController::class, 'show'])->whereNumber('media');

// Réglages publics (store_name, contact, shipping) — sans clé sensible.
Route::get('/settings/public', [SettingController::class, 'index']);

// Zones de livraison actives — nécessaires pour le tunnel de commande.
Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Routes authentifiées (client) — Sanctum
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => new UserResource($request->user()));
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| Routes back-office — auth:sanctum + admin (deny by default) — §6.2
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    // Connexion admin — rate limited (anti-bruteforce).
    Route::post('/auth/login', [AdminAuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware(['auth:sanctum', 'admin', 'throttle:admin'])->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);

        // --- Dashboard KPI ---
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // --- Produits (liste + CRUD) ---
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);

        // Galerie d'images — bindings scopés (anti-IDOR).
        Route::post('/products/{product}/images', [AdminProductController::class, 'storeImage']);
        Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'destroyImage'])
            ->scopeBindings();

        // --- Catégories ---
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::get('/categories/{category}', [AdminCategoryController::class, 'show']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        // --- Variantes ---
        Route::get('/products/{product}/variants', [AdminVariantController::class, 'index']);
        Route::post('/products/{product}/variants', [AdminVariantController::class, 'store']);
        Route::put('/variants/{variant}', [AdminVariantController::class, 'update']);
        Route::delete('/variants/{variant}', [AdminVariantController::class, 'destroy']);

        // --- Stock (ajustement + historique) ---
        Route::post('/stock/adjust', [AdminStockController::class, 'adjust']);
        Route::get('/stock/movements', [AdminStockController::class, 'movements']);

        // --- Médias (upload rate limited) ---
        Route::get('/media', [AdminMediaController::class, 'index']);
        Route::post('/media', [AdminMediaController::class, 'store'])->middleware('throttle:uploads');
        Route::delete('/media/{media}', [AdminMediaController::class, 'destroy']);

        // --- Commandes (liste, détail, workflow de statut, livraison/note) ---
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->whereNumber('order');
        Route::put('/orders/{order}', [AdminOrderController::class, 'update'])->whereNumber('order');
        Route::post('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->whereNumber('order');

        // --- Clients (liste paginée + recherche) ---
        Route::get('/customers', [AdminCustomerController::class, 'index']);

        // --- Réglages du site ---
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::post('/settings', [AdminSettingController::class, 'update']);

        // --- Zones de livraison ---
        Route::get('/shipping-zones', [AdminShippingZoneController::class, 'index']);
        Route::post('/shipping-zones', [AdminShippingZoneController::class, 'store']);
        Route::get('/shipping-zones/{shippingZone}', [AdminShippingZoneController::class, 'show']);
        Route::put('/shipping-zones/{shippingZone}', [AdminShippingZoneController::class, 'update']);
        Route::delete('/shipping-zones/{shippingZone}', [AdminShippingZoneController::class, 'destroy']);

        // --- Promotions / Codes promo ---
        Route::get('/promotions', [AdminPromotionController::class, 'index']);
        Route::post('/promotions', [AdminPromotionController::class, 'store']);
        Route::get('/promotions/{promotion}', [AdminPromotionController::class, 'show']);
        Route::put('/promotions/{promotion}', [AdminPromotionController::class, 'update']);
        Route::delete('/promotions/{promotion}', [AdminPromotionController::class, 'destroy']);
    });
});

