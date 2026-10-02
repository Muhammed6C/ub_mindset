<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use Throwable;

/**
 * Journal d'audit applicatif des actions sensibles (voir §9.14).
 *
 * Persiste dans le canal de log dédié `audit` (aucune donnée sensible : ni
 * mot de passe, ni token, ni numéro de carte).
 */
class AuditLogger
{
    /**
     * Enregistre une action d'administration / sensible.
     *
     * @param  array<string, mixed>  $changes
     */
    public function log(string $action, ?Model $subject = null, array $changes = [], ?int $userId = null): void
    {
        try {
            Log::channel('audit')->info($action, [
                'actor_id' => $userId ?? optional(Request::user())->id,
                'subject_type' => $subject !== null ? $subject::class : null,
                'subject_id' => $subject?->getKey(),
                'changes' => $changes,
                'ip' => Request::ip(),
                'request_id' => Request::attributes->get('request_id'),
            ]);
        } catch (Throwable $e) {
            // L'audit ne doit jamais casser le flux métier.
            Log::warning('audit_log_failure', ['message' => $e->getMessage()]);
        }
    }

    /**
     * Événement de sécurité (échec de connexion, changement de rôle…).
     *
     * @param  array<string, mixed>  $context
     */
    public function security(string $event, array $context = []): void
    {
        $this->log('security.'.$event, null, $context);
    }

    /**
     * Événement métier lié à une commande.
     */
    public function order(string $event, Order $order): void
    {
        $this->log('order.'.$event, $order, [
            'order_number' => $order->order_number,
            'total' => $order->total,
            'order_status' => $order->order_status,
        ]);
    }

    /**
     * Mouvement de stock / ajustement d'inventaire.
     */
    public function stock(string $event, ProductVariant $variant, int $quantity, ?int $userId = null): void
    {
        $this->log('stock.'.$event, $variant, [
            'quantity' => $quantity,
            'stock' => $variant->stock,
            'sku' => $variant->sku,
        ], $userId);
    }
}
