<?php

namespace App\Http\Requests\Admin;

use App\Models\StockMovement;
use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ajustement de stock (§9.4 / §9.14).
 *
 * `user_id` n'est jamais accepté : il est forcé côté serveur.
 */
class StockAdjustRequest extends FormRequest
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
            'product_variant_id' => ['required', 'integer', Rule::exists('product_variants', 'id')],
            'type' => ['required', Rule::in(StockMovement::TYPES)],
            'quantity' => [
                'required',
                'integer',
                'min:0',
                'max:1000000',
                function (string $attribute, mixed $value, \Closure $fail) {
                    // Pour une entrée/sortie, la quantité doit être strictement positive.
                    if (in_array($this->input('type'), [StockMovement::TYPE_IN, StockMovement::TYPE_OUT], true)
                        && (int) $value < 1) {
                        $fail('La quantité doit être au moins 1 pour une entrée ou une sortie.');
                    }
                },
            ],
            'reason' => ['nullable', 'string', 'max:255', new NoHtml],
        ];
    }
}
