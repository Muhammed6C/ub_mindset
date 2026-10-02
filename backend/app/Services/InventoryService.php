<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Gestion du stock (§5.3 / §9.14).
 *
 * Toute modification de stock passe par un mouvement journalisé, sous
 * transaction et verrou pessimiste (pas de course, pas de stock négatif).
 */
class InventoryService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * @param  string  $type  in | out | adjust
     * @param  int  $quantity  quantité (in/out) ou stock cible absolu (adjust)
     */
    public function adjust(
        ProductVariant $variant,
        string $type,
        int $quantity,
        ?string $reason = null,
        ?User $user = null,
    ): StockMovement {
        return DB::transaction(function () use ($variant, $type, $quantity, $reason, $user) {
            /** @var ProductVariant $locked */
            $locked = ProductVariant::query()
                ->whereKey($variant->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $delta = match ($type) {
                StockMovement::TYPE_IN => $quantity,
                StockMovement::TYPE_OUT => -$quantity,
                StockMovement::TYPE_ADJUST => $quantity - (int) $locked->stock,
                default => throw ValidationException::withMessages([
                    'type' => 'Type de mouvement invalide.',
                ]),
            };

            $newStock = (int) $locked->stock + $delta;

            if ($newStock < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'Le stock ne peut pas devenir négatif.',
                ]);
            }

            $locked->forceFill(['stock' => $newStock])->save();

            $movement = StockMovement::create([
                'product_variant_id' => $locked->id,
                'type' => $type,
                'quantity' => $delta,
                'reason' => $reason,
            ]);

            // `user_id` n'est pas mass-assignable : forcé côté serveur (§9.4).
            if ($user !== null) {
                $movement->forceFill(['user_id' => $user->id])->save();
            }

            $this->audit->stock($type, $locked, $delta, $user?->id);

            return $movement;
        });
    }
}
