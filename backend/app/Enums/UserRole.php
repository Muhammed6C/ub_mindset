<?php

namespace App\Enums;

/**
 * Rôles disponibles pour un utilisateur.
 *
 * - customer : client de la boutique (aucun accès admin)
 * - staff    : membre de l'équipe (accès admin limité)
 * - admin    : administrateur (accès admin complet)
 */
enum UserRole: string
{
    case Customer = 'customer';
    case Staff = 'staff';
    case Admin = 'admin';

    /**
     * Indique si le rôle donne accès au back-office.
     */
    public function isAdmin(): bool
    {
        return $this === self::Admin || $this === self::Staff;
    }

    /**
     * Indique si le rôle est un administrateur complet.
     */
    public function isSuperAdmin(): bool
    {
        return $this === self::Admin;
    }

    /**
     * Tous les rôles autorisés (whitelist) sous forme de tableau de valeurs.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $role) => $role->value, self::cases());
    }
}
