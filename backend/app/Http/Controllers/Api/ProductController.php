<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants'])
            ->where('is_active', true);

        // Filter by category slug or id
        if ($request->filled('category')) {
            $category = $request->input('category');
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)->orWhere('name', 'ilike', "%{$category}%");
            });
        }

        // Search by keyword
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        // Sort
        $sort = $request->input('sort', 'latest');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            default => $query->orderBy('id', 'desc'),
        };

        $products = $query->paginate($request->input('per_page', 12));

        return response()->json($products);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'variants'])
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json(['data' => $product]);
    }
}
