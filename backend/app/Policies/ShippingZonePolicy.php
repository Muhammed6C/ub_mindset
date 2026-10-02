<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ShippingZone;
use App\Models\User;

/**
 * Autorisation sur les zones de livraison (§9.3).
 */
class ShippingZonePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function viewAdmin(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, ShippingZone $zone): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, ShippingZone $zone): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
