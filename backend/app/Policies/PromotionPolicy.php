<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Promotion;
use App\Models\User;

/**
 * Autorisation sur les codes promotions (§9.3).
 */
class PromotionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function view(User $user, Promotion $promotion): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, Promotion $promotion): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, Promotion $promotion): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
