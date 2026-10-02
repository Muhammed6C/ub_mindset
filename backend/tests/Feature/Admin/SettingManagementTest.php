<?php

namespace Tests\Feature\Admin;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SettingManagementTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function customerUser(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    // ─── index (admin) ────────────────────────────────────────────────────────

    public function test_admin_can_list_all_settings(): void
    {
        Sanctum::actingAs($this->adminUser());
        Setting::create(['key' => 'store_name', 'value' => 'UB Mindset', 'is_public' => true]);

        $response = $this->getJson('/api/admin/settings');

        $response->assertOk()->assertJsonPath('data.0.key', 'store_name');
    }

    public function test_customer_cannot_access_admin_settings(): void
    {
        Sanctum::actingAs($this->customerUser());

        $this->getJson('/api/admin/settings')->assertForbidden();
    }

    public function test_guest_cannot_access_admin_settings(): void
    {
        $this->getJson('/api/admin/settings')->assertUnauthorized();
    }

    // ─── public endpoint ──────────────────────────────────────────────────────

    public function test_public_settings_only_returns_public_keys(): void
    {
        Setting::create(['key' => 'store_name', 'value' => 'UB Mindset', 'is_public' => true]);
        Setting::create(['key' => 'meta_title', 'value' => 'Meta', 'is_public' => false]);

        $response = $this->getJson('/api/settings/public');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertArrayHasKey('store_name', $data);
        $this->assertArrayNotHasKey('meta_title', $data);
    }

    // ─── update ───────────────────────────────────────────────────────────────

    public function test_admin_can_update_settings(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/admin/settings', [
            'settings' => [
                ['key' => 'store_name', 'value' => 'UB Mindset Pro', 'is_public' => true],
            ],
        ]);

        $response->assertOk()->assertJsonPath('data.0.key', 'store_name');
        $this->assertDatabaseHas('settings', ['key' => 'store_name']);
    }

    public function test_admin_cannot_inject_unknown_key(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/admin/settings', [
            'settings' => [
                ['key' => 'evil_key', 'value' => 'pwned'],
            ],
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('settings', ['key' => 'evil_key']);
    }

    public function test_settings_update_requires_settings_array(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/admin/settings', [])->assertUnprocessable();
    }
}
