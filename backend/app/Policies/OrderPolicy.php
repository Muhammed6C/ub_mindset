<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;

/**
 * Autorisation sur les commandes (§9.3 / §9.18 — anti-IDOR).
 *
 * Un client ne peut consulter QUE ses propres commandes ; le back-office
 * (admin/staff) peut consulter l'ensemble des commandes.
 */
class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function view(User $user, Order $order): bool
    {
        // Anti-IDOR : accès uniquement au propriétaire ou au back-office.
        if ($order->user_id !== null && $order->user_id === $user->id) {
            return true;
        }

        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, Order $order): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
