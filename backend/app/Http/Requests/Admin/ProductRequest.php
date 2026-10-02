<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Création / mise à jour d'un produit (§9.4).
 *
 * Le client ne peut JAMAIS imposer `stock`, `user_id` ou tout champ technique :
 * ces valeurs sont calculées/forcées côté serveur.
 */
class ProductRequest extends FormRequest
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
        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->getKey() : null;

        return [
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id'),
            ],
            'name' => ['required', 'string', 'min:2', 'max:200', new NoHtml],
            'subtitle' => ['nullable', 'string', 'max:200', new NoHtml],
            'slug' => [
                'nullable',
                'string',
                'max:200',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'description' => ['nullable', 'string', 'max:5000', new NoHtml],
            'tag' => ['nullable', 'string', 'max:50', new NoHtml],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'max:99999999', 'gte:price'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'image' => ['nullable', 'string', 'max:2048', 'url:http,https'],
            'position' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['nullable', 'boolean'],
            'is_new' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255', new NoHtml],
            'meta_description' => ['nullable', 'string', 'max:500', new NoHtml],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (blank($this->input('slug')) && is_string($this->input('name'))) {
            $this->merge(['slug' => Str::slug($this->input('name'))]);
        }
    }
}
