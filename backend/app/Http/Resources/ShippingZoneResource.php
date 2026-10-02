<?php

namespace App\Http\Resources;

use App\Models\ShippingZone;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShippingZone
 */
class ShippingZoneResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'country_code' => $this->country_code,
            'city' => $this->city,
            'cost' => (float) $this->cost,
            'free_over' => $this->free_over !== null ? (float) $this->free_over : null,
            'estimated_days' => $this->estimated_days,
            'is_active' => (bool) $this->is_active,
            'position' => (int) $this->position,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
