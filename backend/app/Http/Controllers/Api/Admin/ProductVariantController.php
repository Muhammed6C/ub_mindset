<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Services\AuditLogger;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * CRUD des variantes d'un produit (§6.2).
 *
 * Le stock n'est JAMAIS écrit directement : il passe par l'InventoryService
 * (mouvement journalisé). `initial_stock` n'est accepté qu'à la création.
 */
class ProductVariantController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Product $product): JsonResponse
    {
        Gate::authorize('viewAny', ProductVariant::class);

        return response()->json([
            'data' => ProductVariantResource::collection($product->variants()->orderBy('id')->get()),
        ]);
    }

    public function store(ProductVariantRequest $request, Product $product): JsonResponse
    {
        Gate::authorize('create', ProductVariant::class);

        $data = $request->validated();

        $variant = DB::transaction(function () use ($product, $data, $request) {
            $variant = $product->variants()->create([
                'size' => $data['size'] ?? null,
                'color' => $data['color'] ?? null,
                'sku' => $data['sku'] ?? $this->generateSku($product, $data),
                'barcode' => $data['barcode'] ?? null,
                'price' => $data['price'],
                'stock' => 0, // forcé à 0 : le stock est géré par InventoryService
            ]);

            if (! empty($data['initial_stock'])) {
                $this->inventory->adjust(
                    $variant,
                    StockMovement::TYPE_IN,
                    (int) $data['initial_stock'],
                    'initial_stock',
                    $request->user(),
                );
            }

            return $variant;
        });

        $this->audit->log('variant.created', $variant, ['sku' => $variant->sku]);

        return response()->json(
            ['data' => new ProductVariantResource($variant->fresh())],
            Response::HTTP_CREATED,
        );
    }

    public function update(ProductVariantRequest $request, ProductVariant $variant): JsonResponse
    {
        Gate::authorize('update', $variant);

        $data = $request->validated();

        // `stock` n'est jamais modifiable ici (règle `prohibited` + ajustement dédié).
        $variant->update([
            'size' => $data['size'] ?? null,
            'color' => $data['color'] ?? null,
            'sku' => $data['sku'] ?? $variant->sku,
            'barcode' => $data['barcode'] ?? null,
            'price' => $data['price'],
        ]);

        $this->audit->log('variant.updated', $variant, ['sku' => $variant->sku]);

        return response()->json(['data' => new ProductVariantResource($variant)]);
    }

    public function destroy(ProductVariant $variant): JsonResponse
    {
        Gate::authorize('delete', $variant);

        $this->audit->log('variant.deleted', $variant, ['sku' => $variant->sku]);
        $variant->delete();

        return response()->json(['message' => 'Variante supprimée.']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function generateSku(Product $product, array $data): string
    {
        $base = Str::limit('UB-'.strtoupper(Str::slug($product->name)), 80, '');
        $suffix = collect([$data['size'] ?? null, $data['color'] ?? null])
            ->filter()
            ->map(fn ($part) => Str::upper(Str::slug((string) $part)))
            ->implode('-');

        $candidate = $suffix === '' ? $base.'-'.Str::upper(Str::random(4)) : $base.'-'.$suffix;

        if (ProductVariant::where('sku', $candidate)->exists()) {
            $candidate .= '-'.Str::upper(Str::random(4));
        }

        return Str::limit($candidate, 100, '');
    }
}
