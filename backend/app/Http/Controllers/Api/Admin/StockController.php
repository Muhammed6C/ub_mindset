<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StockAdjustRequest;
use App\Http\Resources\ProductVariantResource;
use App\Http\Resources\StockMovementResource;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

/**
 * Stock : ajustements et historique (§6.2 / §9.14).
 *
 * Toute modification de stock est journalisée dans `stock_movements` avec
 * l'auteur (forcé côté serveur).
 */
class StockController extends Controller
{
    public function __construct(private readonly InventoryService $inventory) {}

    public function adjust(StockAdjustRequest $request): JsonResponse
    {
        Gate::authorize('create', StockMovement::class);

        $data = $request->validated();
        $variant = ProductVariant::findOrFail($data['product_variant_id']);

        $movement = $this->inventory->adjust(
            $variant,
            $data['type'],
            (int) $data['quantity'],
            $data['reason'] ?? null,
            $request->user(),
        );

        return response()->json([
            'data' => new StockMovementResource($movement),
            'variant' => new ProductVariantResource($variant->fresh()),
        ], Response::HTTP_CREATED);
    }

    public function movements(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', StockMovement::class);

        $query = StockMovement::query()->latest('id');

        if ($request->filled('variant_id')) {
            $query->where('product_variant_id', (int) $request->integer('variant_id'));
        }

        $perPage = min(max((int) $request->integer('per_page', 30), 1), 60);

        return StockMovementResource::collection($query->paginate($perPage)->withQueryString())->response();
    }
}
