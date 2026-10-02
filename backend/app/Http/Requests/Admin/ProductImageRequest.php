<?php

namespace App\Http\Requests\Admin;

use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ajout d'une image à la galerie d'un produit (§9.9).
 *
 * L'image provient soit de la bibliothèque de médias (`media_id`), soit d'une
 * URL externe validée (`path`). Au moins l'un des deux est obligatoire.
 */
class ProductImageRequest extends FormRequest
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
            'media_id' => [
                'nullable',
                'integer',
                'required_without:path',
                Rule::exists('media', 'id'),
            ],
            'path' => [
                'nullable',
                'string',
                'max:2048',
                'url:http,https',
                'required_without:media_id',
            ],
            'alt' => ['nullable', 'string', 'max:255', new NoHtml],
            'position' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ];
    }
}
