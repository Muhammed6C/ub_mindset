<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', Product::class);

        $validated = $request->validated();

        $query = Product::query()->with(['category', 'variants', 'images'])
            ->where('is_active', true);

        if (! empty($validated['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $validated['category']));
        }

        if (! empty($validated['search'])) {
            $needle = '%'.mb_strtolower($validated['search']).'%';

            $query->where(function ($q) use ($needle) {
                // Portable (PostgreSQL + SQLite) et paramétré : anti-injection SQL.
                $q->whereRaw('LOWER(name) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(description) LIKE ?', [$needle]);
            });
        }

        if (array_key_exists('featured', $validated) && $validated['featured'] !== null) {
            $query->where('is_featured', (bool) $validated['featured']);
        }

        if (array_key_exists('min_price', $validated) && $validated['min_price'] !== null) {
            $query->where('price', '>=', (float) $validated['min_price']);
        }

        if (array_key_exists('max_price', $validated) && $validated['max_price'] !== null) {
            $query->where('price', '<=', (float) $validated['max_price']);
        }

        match ($validated['sort'] ?? 'latest') {
            'oldest' => $query->oldest('id'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'position' => $query->orderBy('position')->orderByDesc('id'),
            'name' => $query->orderBy('name'),
            default => $query->latest('id'),
        };

        $products = $query->paginate((int) ($validated['per_page'] ?? 12))->withQueryString();

        return ProductResource::collection($products)->response();
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'variants', 'images'])->findOrFail($id);

        // Anti-énumération : un produit non visible est indiscernable d'un
        // produit inexistant (404 plutôt que 403).
        if (! Gate::allows('view', $product)) {
            abort(404);
        }

        return response()->json(['data' => new ProductResource($product)]);
    }
}
