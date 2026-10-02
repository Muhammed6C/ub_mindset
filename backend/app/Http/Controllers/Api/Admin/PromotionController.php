<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePromotionRequest;
use App\Http\Requests\Admin\UpdatePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * CRUD des promotions / codes promo (§5.3 / §12 Lot B).
 *
 * DevSecOps :
 * - Gate::authorize() sur chaque action ;
 * - FormRequests validant strictement tous les champs ;
 * - Journalisation AuditLogger.
 */
class PromotionController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Promotion::class);

        $promotions = Promotion::query()->orderByDesc('id')->paginate(20)->withQueryString();

        return PromotionResource::collection($promotions)->response();
    }

    public function show(Promotion $promotion): JsonResponse
    {
        Gate::authorize('view', $promotion);

        return response()->json([
            'data' => new PromotionResource($promotion),
        ]);
    }

    public function store(StorePromotionRequest $request): JsonResponse
    {
        Gate::authorize('create', Promotion::class);

        $promotion = Promotion::create($request->validated());

        $this->audit->log('promotion.created', $promotion, ['code' => $promotion->code]);

        return response()->json(
            ['message' => 'Code promo créé.', 'data' => new PromotionResource($promotion)],
            Response::HTTP_CREATED
        );
    }

    public function update(UpdatePromotionRequest $request, Promotion $promotion): JsonResponse
    {
        Gate::authorize('update', $promotion);

        $promotion->fill($request->validated())->save();

        $this->audit->log('promotion.updated', $promotion, array_keys($request->validated()));

        return response()->json([
            'data' => new PromotionResource($promotion),
        ]);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        Gate::authorize('delete', $promotion);

        $this->audit->log('promotion.deleted', $promotion, ['id' => $promotion->id]);
        $promotion->delete();

        return response()->json(['message' => 'Code promo supprimé.']);
    }
}
