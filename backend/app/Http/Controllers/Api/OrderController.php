<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer.firstName' => 'required|string|max:100',
            'customer.lastName' => 'required|string|max:100',
            'customer.email' => 'required|email|max:150',
            'customer.phone' => 'required|string|max:50',
            'customer.address' => 'required|string|max:255',
            'customer.city' => 'required|string|max:100',
            'customer.paymentMethod' => 'nullable|string|in:wave_om,card',
            'items' => 'required|array|min:1',
            'items.*.product.id' => 'required',
            'items.*.product.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.variant.size' => 'nullable|string',
            'total' => 'required|numeric|min:0',
        ]);

        $customer = $validated['customer'];
        $items = $validated['items'];

        $subtotal = collect($items)->reduce(fn ($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);
        $shipping = $subtotal > 50000 ? 0 : 3000;
        $total = $subtotal + $shipping;

        $order = DB::transaction(function () use ($customer, $items, $subtotal, $shipping, $total) {
            $order = Order::create([
                'order_number' => 'UB-' . strtoupper(Str::random(8)),
                'customer_name' => "{$customer['firstName']} {$customer['lastName']}",
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'shipping_address' => $customer['address'],
                'shipping_city' => $customer['city'],
                'payment_method' => $customer['paymentMethod'] ?? 'wave_om',
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'total' => $total,
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']['id'] ?? null,
                    'product_name' => $item['product']['name'],
                    'variant_info' => isset($item['variant']['size']) ? "Taille: {$item['variant']['size']}" : null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);
            }

            return $order;
        });

        return response()->json([
            'message' => 'Commande créée avec succès',
            'order_id' => $order->order_number,
            'order' => $order->load('items'),
        ], 201);
    }

    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        return response()->json(['data' => $order]);
    }
}
