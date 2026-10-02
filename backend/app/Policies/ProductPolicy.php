<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;

/**
 * Autorisation fine sur les produits (§9.3).
 *
 * - Lecture publique : uniquement les produits actifs ;
 * - Lecture back-office : admin ou staff ;
 * - Écriture : admin ou staff ;
 * - Suppression : réservée aux administrateurs.
 */
class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Product $product): bool
    {
        if ($product->is_active) {
            return true;
        }

        return $user !== null && $user->role instanceof UserRole && $user->role->isAdmin();
    }

    /**
     * Consultation back-office : admin ou staff, y compris les produits inactifs.
     */
    public function viewAdmin(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
