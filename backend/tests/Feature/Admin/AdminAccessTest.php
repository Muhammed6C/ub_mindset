<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_unauthenticated_on_admin_routes(): void
    {
        $this->getJson('/api/admin/products')->assertStatus(401);
    }

    public function test_customer_is_forbidden_on_admin_routes(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/admin/products')
            ->assertStatus(403);
    }

    public function test_inactive_admin_is_forbidden(): void
    {
        $admin = User::factory()->admin()->inactive()->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/products')
            ->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/products')
            ->assertOk();
    }

    public function test_staff_can_access_admin_routes(): void
    {
        $staff = User::factory()->staff()->create();

        $this->actingAs($staff, 'sanctum')
            ->getJson('/api/admin/me')
            ->assertOk()
            ->assertJsonPath('data.role', 'staff');
    }

    public function test_admin_login_rejects_non_admin_account(): void
    {
        User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/admin/auth/login', [
            'email' => 'client@example.com',
            'password' => 'secret-password',
        ])->assertStatus(422);
    }

    public function test_admin_login_succeeds_for_admin(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ])->assertOk()->assertJsonStructure(['token', 'user']);
    }
}
