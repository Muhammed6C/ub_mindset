<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\User;

/**
 * Autorisation sur les catégories (§9.3).
 */
class CategoryPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Category $category): bool
    {
        if ($category->is_active) {
            return true;
        }

        return $user !== null && $user->role instanceof UserRole && $user->role->isAdmin();
    }

    /**
     * Consultation back-office : admin ou staff, y compris les catégories inactives.
     */
    public function viewAdmin(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, Category $category): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
