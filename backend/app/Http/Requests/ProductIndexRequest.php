<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Filtres de la liste produits (public + admin).
 *
 * Whitelist stricte des tris et plafonnement de `per_page` (§9.4 / §9.10)
 * pour empêcher l'extraction massive ou l'injection via le tri.
 */
class ProductIndexRequest extends FormRequest
{
    public const MAX_PER_PAGE = 60;

    public function authorize(): bool
    {
        // La consultation du catalogue ne nécessite aucun privilège particulier.
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => [
                'nullable',
                'string',
                'max:100',
                Rule::exists('categories', 'slug')->where('is_active', true),
            ],
            'search' => ['nullable', 'string', 'max:100'],
            'min_price' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in([
                'latest', 'oldest', 'price_asc', 'price_desc', 'position', 'name',
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
            'page' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ];
    }
}
