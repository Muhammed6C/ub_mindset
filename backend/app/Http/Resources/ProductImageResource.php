<?php

namespace App\Http\Resources;

use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProductImage
 */
class ProductImageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'media_id' => $this->media_id,
            'alt' => $this->alt,
            'position' => (int) $this->position,
            // URL résolue : média interne servi par l'API, sinon URL externe validée.
            'url' => $this->media_id !== null
                ? url("/api/media/{$this->media_id}")
                : $this->path,
        ];
    }
}
