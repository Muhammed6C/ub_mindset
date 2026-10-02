<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShippingZoneResource;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;

/**
 * Zones de livraison publiques pour le tunnel de commande (§5.3).
 */
class ShippingZoneController extends Controller
{
    public function index(): JsonResponse
    {
        $zones = ShippingZone::query()
            ->active()
            ->get();

        return response()->json([
            'data' => ShippingZoneResource::collection($zones),
        ]);
    }
}
