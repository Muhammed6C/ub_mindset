<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShippingZoneRequest;
use App\Http\Requests\Admin\UpdateShippingZoneRequest;
use App\Http\Resources\ShippingZoneResource;
use App\Models\ShippingZone;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * CRUD des zones de livraison (§5.3 / §12 Lot B).
 *
 * DevSecOps :
 * - Gate::authorize() sur chaque action ;
 * - FormRequests validant strictement tous les champs ;
 * - Journalisation AuditLogger.
 */
class ShippingZoneController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', ShippingZone::class);

        $zones = ShippingZone::query()->orderBy('position')->orderBy('id')->get();

        return response()->json([
            'data' => ShippingZoneResource::collection($zones),
        ]);
    }

    public function show(ShippingZone $shippingZone): JsonResponse
    {
        Gate::authorize('view', $shippingZone);

        return response()->json([
            'data' => new ShippingZoneResource($shippingZone),
        ]);
    }

    public function store(StoreShippingZoneRequest $request): JsonResponse
    {
        Gate::authorize('create', ShippingZone::class);

        $zone = ShippingZone::create($request->validated());

        $this->audit->log('shipping_zone.created', $zone, ['id' => $zone->id]);

        return response()->json(
            ['message' => 'Zone de livraison créée.', 'data' => new ShippingZoneResource($zone)],
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateShippingZoneRequest $request, ShippingZone $shippingZone): JsonResponse
    {
        Gate::authorize('update', $shippingZone);

        $shippingZone->fill($request->validated())->save();

        $this->audit->log('shipping_zone.updated', $shippingZone, array_keys($request->validated()));

        return response()->json([
            'data' => new ShippingZoneResource($shippingZone),
        ]);
    }

    public function destroy(ShippingZone $shippingZone): JsonResponse
    {
        Gate::authorize('delete', $shippingZone);

        $this->audit->log('shipping_zone.deleted', $shippingZone, ['id' => $shippingZone->id]);
        $shippingZone->delete();

        return response()->json(['message' => 'Zone de livraison supprimée.']);
    }
}
