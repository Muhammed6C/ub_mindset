<?php

namespace App\Http\Requests\Order;

use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validation de la création de commande (§9.4).
 *
 * Le client n'envoie QUE des identifiants de variantes et des quantités :
 * les prix, le stock, les totaux et les frais de port sont TOUJOURS
 * recalculés côté serveur (jamais de confiance au client).
 */
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Renommage des champs client vers un schéma propre (aucun champ de prix accepté).
            'customer.name' => ['required', 'string', 'min:2', 'max:150', new NoHtml],
            'customer.email' => ['required', 'string', 'email:rfc', 'max:150'],
            'customer.phone' => ['required', 'string', 'regex:/^[0-9+\s().-]{6,30}$/'],
            'customer.address' => ['required', 'string', 'min:5', 'max:255', new NoHtml],
            'customer.city' => ['required', 'string', 'min:2', 'max:100', new NoHtml],
            'customer.shipping_zone_id' => ['nullable', 'integer', 'exists:shipping_zones,id'],
            'customer.payment_method' => ['nullable', Rule::in(['wave_om', 'card'])],
            'promo_code' => ['nullable', 'string', 'max:50', 'regex:/^[A-Z0-9_\-]+$/i'],
            'notes' => ['nullable', 'string', 'max:1000', new NoHtml],

            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.variant_id' => ['required', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('customer.email'))) {
            $this->merge([
                'customer' => array_merge($this->input('customer', []), [
                    'email' => mb_strtolower(trim($this->input('customer.email'))),
                ]),
            ]);
        }
    }
}
