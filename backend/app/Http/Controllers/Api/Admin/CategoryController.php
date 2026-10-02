<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

/**
 * CRUD des catégories côté back-office (§6.2).
 *
 * Protégé par `auth:sanctum` + `admin` (routes) et autorisé par Policy.
 */
class CategoryController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAdmin', Category::class);

        $categories = Category::query()
            ->withCount('products')
            ->orderBy('position')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        Gate::authorize('create', Category::class);

        $category = Category::create($request->validated());
        $this->audit->log('category.created', $category, ['name' => $category->name]);

        return response()->json(['data' => new CategoryResource($category)], Response::HTTP_CREATED);
    }

    public function show(Category $category): JsonResponse
    {
        Gate::authorize('viewAdmin', Category::class);

        return response()->json(['data' => new CategoryResource($category->loadCount('products'))]);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        Gate::authorize('update', $category);

        $category->update($request->validated());
        $this->audit->log('category.updated', $category, ['name' => $category->name]);

        return response()->json(['data' => new CategoryResource($category)]);
    }

    public function destroy(Category $category): JsonResponse
    {
        Gate::authorize('delete', $category);

        // Intégrité de la hiérarchie : les enfants remontent à la racine.
        $category->children()->update(['parent_id' => null]);

        $this->audit->log('category.deleted', $category, ['name' => $category->name]);
        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
