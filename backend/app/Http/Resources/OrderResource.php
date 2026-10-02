<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Représentation PUBLIQUE d'une commande (§9.19).
 *
 * Le `tracking_token` n'est JAMAIS exposé ici : il n'est renvoyé qu'une seule
 * fois, au moment de la création de la commande.
 *
 * @mixin Order
 */
class OrderResource extends JsonResource
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
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
                'address' => $this->shipping_address,
                'city' => $this->shipping_city,
            ],
            'shipping_method' => $this->shipping_method,
            'tracking_number' => $this->tracking_number,
            'shipping_zone_id' => $this->shipping_zone_id,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'discount_amount' => (float) ($this->discount_amount ?? 0.0),
            'total' => (float) $this->total,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
