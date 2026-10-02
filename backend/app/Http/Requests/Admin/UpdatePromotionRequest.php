<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $promo = $this->route('promotion');
        $promoId = is_object($promo) ? $promo->id : (int) $promo;

        return [
            'code' => ['sometimes', 'required', 'string', 'max:50', 'regex:/^[A-Z0-9_\-]+$/i', Rule::unique('promotions', 'code')->ignore($promoId)],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'type' => ['sometimes', 'required', 'in:percentage,fixed'],
            'value' => ['sometimes', 'required', 'numeric', 'min:0.01', function ($attribute, $value, $fail) {
                $type = $this->input('type') ?? $this->route('promotion')?->type;
                if ($type === 'percentage' && $value > 100) {
                    $fail('Le pourcentage de réduction ne peut pas dépasser 100%.');
                }
            }],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
