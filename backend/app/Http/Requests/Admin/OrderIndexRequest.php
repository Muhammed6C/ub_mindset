<?php

namespace App\Http\Requests\Admin;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Filtres de la liste des commandes (back-office).
 *
 * Whitelist stricte des statuts, tris bornés et `per_page` plafonné (§9.4 /
 * §9.10) pour empêcher l'extraction massive de données clients.
 */
class OrderIndexRequest extends FormRequest
{
    public const MAX_PER_PAGE = 60;

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
            'status' => ['nullable', Rule::in(Order::STATUSES)],
            'payment_status' => ['nullable', Rule::in(Order::PAYMENT_STATUSES)],
            'search' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'sort' => ['nullable', Rule::in([
                'latest', 'oldest', 'total_asc', 'total_desc',
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
            'page' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ];
    }
}
