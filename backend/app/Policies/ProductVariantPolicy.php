<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ProductVariant;
use App\Models\User;

/**
 * Autorisation sur les variantes de produit (§9.3).
 */
class ProductVariantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function view(User $user, ProductVariant $variant): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, ProductVariant $variant): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, ProductVariant $variant): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
