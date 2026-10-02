<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Media;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\ShippingZone;
use App\Models\StockMovement;
use App\Policies\CategoryPolicy;
use App\Policies\MediaPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ProductVariantPolicy;
use App\Policies\PromotionPolicy;
use App\Policies\SettingPolicy;
use App\Policies\ShippingZonePolicy;
use App\Policies\StockMovementPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        $this->registerRateLimiters();
    }

    /**
     * Policies explicites — « deny by default » (§9.3).
     */
    private function registerPolicies(): void
    {
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Category::class, CategoryPolicy::class);
        Gate::policy(ProductVariant::class, ProductVariantPolicy::class);
        Gate::policy(Media::class, MediaPolicy::class);
        Gate::policy(StockMovement::class, StockMovementPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Setting::class, SettingPolicy::class);
        Gate::policy(ShippingZone::class, ShippingZonePolicy::class);
        Gate::policy(Promotion::class, PromotionPolicy::class);
    }

    /**
     * Limiteurs de débit nommés (§9.10).
     */
    private function registerRateLimiters(): void
    {
        // Limiteur global de l'API : par utilisateur si authentifié, sinon par IP.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });

        // Création de commande : anti-spam / anti-abus.
        RateLimiter::for('orders', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perDay(100)->by($request->ip()),
            ];
        });

        // Connexion : anti-bruteforce par IP.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Back-office : borné mais plus permissif que le public.
        RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });

        // Uploads : limite dédiée (§9.10) — anti-abus de stockage.
        RateLimiter::for('uploads', function (Request $request) {
            return [
                Limit::perMinute(20)->by($request->user()?->getAuthIdentifier() ?: $request->ip()),
                Limit::perDay(300)->by($request->user()?->getAuthIdentifier() ?: $request->ip()),
            ];
        });
    }
}
