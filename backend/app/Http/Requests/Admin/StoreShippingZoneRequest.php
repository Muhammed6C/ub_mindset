<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreShippingZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:shipping_zones,code'],
            'country_code' => ['required', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:100'],
            'cost' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'free_over' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'estimated_days' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
