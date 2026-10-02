<?php

namespace App\Http\Requests\Admin;

use App\Services\MediaService;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Upload d'un média (§9.9).
 *
 * La taille et les extensions sont whitelistées ici ; la vérification du MIME
 * réel et des « magic bytes » est faite par le MediaService.
 */
class MediaUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:'.MediaService::MAX_SIZE_KB,
                'mimes:jpg,jpeg,png,webp,gif,avif,glb',
            ],
            'is_public' => ['nullable', 'boolean'],
        ];
    }
}
