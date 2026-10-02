<?php

namespace App\Http\Resources;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Media
 */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mime' => $this->mime,
            'size' => (int) $this->size,
            'width' => $this->width !== null ? (int) $this->width : null,
            'height' => $this->height !== null ? (int) $this->height : null,
            'is_public' => (bool) $this->is_public,
            'is_image' => $this->isImage(),
            // Le chemin de stockage interne n'est jamais exposé.
            'url' => url("/api/media/{$this->id}"),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
