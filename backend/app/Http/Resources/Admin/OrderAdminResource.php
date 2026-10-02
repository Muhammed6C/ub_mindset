<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\OrderItemResource;
use App\Models\Order;
use App\Services\OrderWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation d'une commande côté back-office (§9.19).
 *
 * Expose les informations nécessaires à la gestion (client, lignes, workflow)
 * sans jamais divulguer le `tracking_token` public ni de champ technique inutile.
 *
 * @mixin Order
 */
class OrderAdminResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'order_status' => $this->order_status,
            'allowed_transitions' => app(OrderWorkflowService::class)
                ->allowedTransitions((string) $this->order_status),
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'is_guest' => $this->user_id === null,
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
                'address' => $this->shipping_address,
                'city' => $this->shipping_city,
            ],
            'user' => $this->whenLoaded('user', function () {
                return $this->user === null ? null : [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'shipping_method' => $this->shipping_method,
            'tracking_number' => $this->tracking_number,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'total' => (float) $this->total,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
