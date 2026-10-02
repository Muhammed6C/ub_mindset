<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\StockMovement;
use App\Models\User;

/**
 * Autorisation sur les mouvements de stock (§9.3 / §9.14).
 */
class StockMovementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function view(User $user, StockMovement $movement): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }
}
