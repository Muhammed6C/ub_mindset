<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_role_helper_methods(): void
    {
        $this->assertTrue(UserRole::Admin->isAdmin());
        $this->assertTrue(UserRole::Staff->isAdmin());
        $this->assertFalse(UserRole::Customer->isAdmin());

        $this->assertTrue(UserRole::Admin->isSuperAdmin());
        $this->assertFalse(UserRole::Staff->isSuperAdmin());
        $this->assertFalse(UserRole::Customer->isSuperAdmin());
    }

    public function test_role_values_whitelist(): void
    {
        $this->assertSame(['customer', 'staff', 'admin'], UserRole::values());
    }
}
