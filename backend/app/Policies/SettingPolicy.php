<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

/**
 * Autorisation sur les réglages système (§9.3 / §12).
 *
 * DevSecOps :
 * - Lecture réservée aux administrateurs / staff ;
 * - Modification réservée aux super-administrateurs (rôle `admin`) ;
 * - Deny by default pour tout autre utilisateur.
 */
class SettingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isSuperAdmin();
    }
}
