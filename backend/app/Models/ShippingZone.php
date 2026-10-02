<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Zones et frais de livraison (§5.3 / §12 Lot A3).
 *
 * Permet de piloter dynamiquement les frais par ville / pays (Dakar, régions, international)
 * sans modifier le code.
 */
class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'country_code',
        'city',
        'cost',
        'free_over',
        'estimated_days',
        'is_active',
        'position',
    ];

    protected $casts = [
        'cost' => 'float',
        'free_over' => 'float',
        'is_active' => 'boolean',
        'position' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('position')->orderBy('id');
    }

    /**
     * Calcule les frais de port pour un montant de sous-total donné.
     */
    public function calculateShippingCost(float $subtotal): float
    {
        if ($this->free_over !== null && $subtotal >= (float) $this->free_over) {
            return 0.0;
        }

        return (float) $this->cost;
    }
}
