<?php

namespace App\Http\Requests\Admin;

use App\Models\Order;
use App\Rules\NoHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Mise à jour des données « back-office » d'une commande (§7 — livraison, note,
 * paiement).
 *
 * Le statut de commande N'EST PAS modifiable ici : il passe exclusivement par
 * le workflow dédié (`POST /api/admin/orders/{order}/status`).
 */
class OrderUpdateRequest extends FormRequest
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
            'shipping_method' => ['nullable', 'string', 'max:100', new NoHtml],
            'tracking_number' => ['nullable', 'string', 'max:100', new NoHtml],
            'payment_status' => ['nullable', Rule::in(Order::PAYMENT_STATUSES)],
            'notes' => ['nullable', 'string', 'max:2000', new NoHtml],
        ];
    }
}
