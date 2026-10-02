<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

/**
 * Exposition publique des réglages du site (§5.3 / §12 Lot A3).
 *
 * DevSecOps :
 * - Uniquement les clés déclarées comme publiques (is_public = true et dans PUBLIC_KEYS) ;
 * - Ne divulgue aucune clé d'API, mot de passe ou configuration interne sensible.
 */
class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::query()
            ->publicOnly()
            ->whereIn('key', Setting::PUBLIC_KEYS)
            ->get()
            ->pluck('value', 'key');

        return response()->json([
            'data' => $settings,
        ]);
    }
}
