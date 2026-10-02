<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductImageRequest;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\AuditLogger;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Liste des produits côté back-office (§6.2).
 *
 * Sécurité :
 * - protégé par `auth:sanctum` + `admin` (voir routes) ;
 * - autorisation explicite via la Policy (deny-by-default) ;
 * - filtres whitelistés et `per_page` plafonné (FormRequest) ;
 * - recherche via requête liée (aucune concaténation SQL).
 */
class ProductController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(ProductIndexRequest $request): JsonResponse
    {
        Gate::authorize('viewAdmin', Product::class);

        $validated = $request->validated();
        $isAdmin = $request->user()->role instanceof UserRole && $request->user()->role->isAdmin();

        $query = Product::query()->with(['category', 'variants', 'images']);

        // Un staff non-admin ne voit que le catalogue actif.
        if (! $isAdmin) {
            $query->where('is_active', true);
        }

        if (! empty($validated['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $validated['category']));
        }

        if (! empty($validated['search'])) {
            $needle = '%'.mb_strtolower($validated['search']).'%';

            $query->where(function ($q) use ($needle) {
                // Portable (PostgreSQL + SQLite) et 100% paramétré : anti-injection.
                $q->whereRaw('LOWER(name) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(description) LIKE ?', [$needle]);
            });
        }

        if (array_key_exists('featured', $validated) && $validated['featured'] !== null) {
            $query->where('is_featured', (bool) $validated['featured']);
        }

        match ($validated['sort'] ?? 'latest') {
            'oldest' => $query->oldest('id'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'position' => $query->orderBy('position')->orderByDesc('id'),
            'name' => $query->orderBy('name'),
            default => $query->latest('id'),
        };

        $products = $query->paginate((int) ($validated['per_page'] ?? 20))->withQueryString();

        return ProductResource::collection($products)->response();
    }

    public function store(ProductRequest $request): JsonResponse
    {
        Gate::authorize('create', Product::class);

        $product = Product::create($request->validated());
        $this->audit->log('product.created', $product, ['name' => $product->name]);

        return response()->json(
            ['data' => new ProductResource($product->load(['category', 'variants', 'images']))],
            Response::HTTP_CREATED,
        );
    }

    public function show(Product $product): JsonResponse
    {
        Gate::authorize('viewAdmin', Product::class);

        return response()->json([
            'data' => new ProductResource($product->load(['category', 'variants', 'images'])),
        ]);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        Gate::authorize('update', $product);

        $product->update($request->validated());
        $this->audit->log('product.updated', $product, ['name' => $product->name]);

        return response()->json([
            'data' => new ProductResource($product->load(['category', 'variants', 'images'])),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        Gate::authorize('delete', $product);

        $this->audit->log('product.deleted', $product, ['name' => $product->name]);
        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    public function storeImage(ProductImageRequest $request, Product $product): JsonResponse
    {
        Gate::authorize('update', $product);

        $data = $request->validated();

        // Le média référencé doit exister ET être une image.
        if (! empty($data['media_id'])) {
            $media = Media::findOrFail($data['media_id']);

            if (! $media->isImage()) {
                throw ValidationException::withMessages([
                    'media_id' => 'Le média sélectionné n’est pas une image.',
                ]);
            }
        }

        $position = $data['position'] ?? (((int) $product->images()->max('position')) + 1);

        $image = $product->images()->create([
            'media_id' => $data['media_id'] ?? null,
            'path' => $data['path'] ?? null,
            'alt' => $data['alt'] ?? null,
            'position' => $position,
        ]);

        $this->audit->log('product.image_added', $product, ['image_id' => $image->id]);

        return response()->json(
            ['data' => new ProductImageResource($image->load('media'))],
            Response::HTTP_CREATED,
        );
    }

    public function destroyImage(Product $product, ProductImage $image): JsonResponse
    {
        Gate::authorize('update', $product);

        // Anti-IDOR (défense en profondeur, en plus du scopeBindings de la route).
        if ((int) $image->product_id !== (int) $product->id) {
            throw new AuthorizationException('Cette image n’appartient pas à ce produit.');
        }

        $this->audit->log('product.image_removed', $product, ['image_id' => $image->id]);
        $image->delete();

        return response()->json(['message' => 'Image supprimée.']);
    }
}
