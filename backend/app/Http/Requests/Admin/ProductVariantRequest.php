<?php

namespace App\Http\Requests\Admin;

use App\Models\ProductVariant;
use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Création / mise à jour d'une variante (§9.4).
 *
 * Le stock n'est accepté qu'à la CRÉATION, sous le nom `initial_stock`, et il
 * est journalisé via l'InventoryService. En mise à jour, tout envoi de stock
 * est PROHIBÉ : les ajustements passent par `/admin/stock/adjust`.
 */
class ProductVariantRequest extends FormRequest
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
        $variant = $this->route('variant');
        $variantId = $variant instanceof ProductVariant ? $variant->getKey() : null;
        $isCreation = $this->isMethod('POST');

        return [
            'size' => ['nullable', 'string', 'max:50', new NoHtml],
            'color' => ['nullable', 'string', 'max:50', new NoHtml],
            'sku' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('product_variants', 'sku')->ignore($variantId),
            ],
            'barcode' => [
                'nullable',
                'string',
                'max:64',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('product_variants', 'barcode')->ignore($variantId),
            ],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'initial_stock' => $isCreation
                ? ['nullable', 'integer', 'min:0', 'max:1000000']
                : ['prohibited'],
            // Champ technique interdit sur les deux opérations.
            'stock' => ['prohibited'],
        ];
    }
}
