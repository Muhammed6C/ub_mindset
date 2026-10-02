<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Workflow de statut d'une commande (§7 — module Commandes).
 *
 * Le serveur est seul maître des transitions : un client (ou même un
 * administrateur via un payload forgé) ne peut pas sauter d'étape ni revenir à
 * un statut incohérent. Toute transition invalide est rejetée en `422` (§9.4).
 */
class OrderWorkflowService
{
    /**
     * Transitions autorisées : clé = statut actuel, valeur = statuts cibles.
     *
     * - un état final (`delivered`, `cancelled`) n'admet aucune sortie ;
     * - une commande expédiée n'est plus annulable (elle doit être réceptionnée).
     */
    private const TRANSITIONS = [
        Order::STATUS_PENDING => [Order::STATUS_CONFIRMED, Order::STATUS_CANCELLED],
        Order::STATUS_CONFIRMED => [Order::STATUS_PROCESSING, Order::STATUS_CANCELLED],
        Order::STATUS_PROCESSING => [Order::STATUS_SHIPPED, Order::STATUS_CANCELLED],
        Order::STATUS_SHIPPED => [Order::STATUS_DELIVERED],
        Order::STATUS_DELIVERED => [],
        Order::STATUS_CANCELLED => [],
    ];

    /**
     * Indique si la transition est autorisée.
     *
     * Un statut identique est accepté (idempotence d'un appel réseau rejoué).
     */
    public function canTransition(string $from, string $to): bool
    {
        if (! in_array($from, Order::STATUSES, true) || ! in_array($to, Order::STATUSES, true)) {
            return false;
        }

        if ($from === $to) {
            return true;
        }

        return in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    /**
     * Statuts cibles possibles depuis un statut donné (pour l'UI back-office).
     *
     * @return array<int, string>
     */
    public function allowedTransitions(string $from): array
    {
        return array_values(array_filter(
            self::TRANSITIONS[$from] ?? [],
            fn (string $to): bool => $this->canTransition($from, $to),
        ));
    }

    /**
     * Applique la transition de statut ou rejette la demande.
     *
     * @throws ValidationException
     */
    public function transition(Order $order, string $to, ?User $actor = null): Order
    {
        $from = (string) $order->order_status;

        if (! $this->canTransition($from, $to)) {
            throw ValidationException::withMessages([
                'status' => "Transition de statut invalide : « {$from} » → « {$to} ».",
            ]);
        }

        if ($from !== $to) {
            $order->forceFill(['order_status' => $to])->save();
        }

        return $order;
    }
}
