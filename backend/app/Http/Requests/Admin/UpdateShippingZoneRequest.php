<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShippingZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $zone = $this->route('shipping_zone') ?? $this->route('zone');
        $zoneId = is_object($zone) ? $zone->id : (int) $zone;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'code' => ['sometimes', 'required', 'string', 'max:50', 'alpha_dash', Rule::unique('shipping_zones', 'code')->ignore($zoneId)],
            'country_code' => ['sometimes', 'required', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:100'],
            'cost' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1000000'],
            'free_over' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'estimated_days' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
