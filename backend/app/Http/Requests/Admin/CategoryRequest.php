<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Création / mise à jour d'une catégorie (§9.4).
 *
 * Aucun champ technique n'est accepté du client ; le slug est normalisé côté
 * serveur et son unicité est garantie.
 */
class CategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->getKey() : null;

        return [
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id'),
                // Une catégorie ne peut pas être son propre parent (boucle).
                Rule::notIn(array_values(array_filter([$categoryId]))),
            ],
            'name' => ['required', 'string', 'min:2', 'max:150', new NoHtml],
            'slug' => [
                'nullable',
                'string',
                'max:150',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'description' => ['nullable', 'string', 'max:2000', new NoHtml],
            'image' => ['nullable', 'string', 'max:2048', 'url:http,https'],
            'position' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['nullable', 'boolean'],
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
