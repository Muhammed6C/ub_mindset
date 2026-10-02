<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * Gestion des réglages du site côté back-office (§5.3 / §9.4 / §9.14).
 *
 * DevSecOps :
 * - Protégé par `auth:sanctum` + `admin` ;
 * - Seules les clés de la whitelist ALLOWED_KEYS sont acceptées ;
 * - La mise à jour est journalisée (AuditLogger) ;
 * - Aucune clé interne (DB, secrets) n'est jamais lisible ici.
 */
class SettingController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Setting::class);

        $settings = Setting::query()->orderBy('key')->get();

        return response()->json([
            'data' => SettingResource::collection($settings),
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        Gate::authorize('update', Setting::class);

        $saved = [];
        foreach ($request->validated()['settings'] as $item) {
            $key = (string) $item['key'];
            $setting = Setting::query()->firstOrNew(['key' => $key]);
            $setting->value = $item['value'];
            if (isset($item['is_public'])) {
                $setting->is_public = (bool) $item['is_public'];
            }
            if (isset($item['description'])) {
                $setting->description = $item['description'];
            }
            $setting->save();
            $saved[] = $setting;
        }

        $this->audit->log('settings.updated', null, array_column($request->validated()['settings'], 'key'));

        return response()->json([
            'message' => count($saved).' réglage(s) mis à jour.',
            'data' => SettingResource::collection($saved),
        ]);
    }
}
