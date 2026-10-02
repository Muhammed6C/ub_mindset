<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Media;
use App\Models\User;

/**
 * Autorisation sur la bibliothèque de médias (§9.3 / §9.9).
 */
class MediaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function view(User $user, Media $media): bool
    {
        if ($media->is_public) {
            return true;
        }

        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function update(User $user, Media $media): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }

    public function delete(User $user, Media $media): bool
    {
        return $user->role instanceof UserRole && $user->role->isAdmin();
    }
}
