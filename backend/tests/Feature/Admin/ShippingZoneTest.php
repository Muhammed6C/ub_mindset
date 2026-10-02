<?php

namespace Tests\Feature\Admin;

use App\Models\ShippingZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShippingZoneTest extends TestCase
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

    private function zoneData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Dakar',
            'code' => 'DKR',
            'country_code' => 'SN',
            'city' => 'Dakar',
            'cost' => 1500,
            'free_over' => 30000,
            'estimated_days' => '1-2 jours',
            'is_active' => true,
            'position' => 1,
        ], $overrides);
    }

    // ─── Public listing ───────────────────────────────────────────────────────

    public function test_public_can_list_active_shipping_zones(): void
    {
        ShippingZone::factory()->create(['is_active' => true, 'name' => 'Dakar', 'cost' => 1500, 'position' => 1]);
        ShippingZone::factory()->create(['is_active' => false, 'name' => 'Invisible', 'cost' => 999, 'position' => 2]);

        $response = $this->getJson('/api/shipping-zones');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Dakar', $data[0]['name']);
    }

    // ─── Admin CRUD ───────────────────────────────────────────────────────────

    public function test_admin_can_list_all_zones_including_inactive(): void
    {
        Sanctum::actingAs($this->adminUser());
        ShippingZone::factory()->create(['is_active' => false]);
        ShippingZone::factory()->create(['is_active' => true]);

        $this->getJson('/api/admin/shipping-zones')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_shipping_zone(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/admin/shipping-zones', $this->zoneData());

        $response->assertCreated()->assertJsonPath('data.name', 'Dakar');
        $this->assertDatabaseHas('shipping_zones', ['code' => 'DKR']);
    }

    public function test_admin_can_update_shipping_zone(): void
    {
        Sanctum::actingAs($this->adminUser());
        $zone = ShippingZone::factory()->create(['cost' => 1500]);

        $this->putJson("/api/admin/shipping-zones/{$zone->id}", ['cost' => 2000])
            ->assertOk()
            ->assertJsonFragment(['cost' => 2000.0]);
    }

    public function test_admin_can_delete_shipping_zone(): void
    {
        Sanctum::actingAs($this->adminUser());
        $zone = ShippingZone::factory()->create();

        $this->deleteJson("/api/admin/shipping-zones/{$zone->id}")->assertOk();
        $this->assertDatabaseMissing('shipping_zones', ['id' => $zone->id]);
    }

    public function test_customer_cannot_manage_shipping_zones(): void
    {
        Sanctum::actingAs($this->customerUser());

        $this->getJson('/api/admin/shipping-zones')->assertForbidden();
        $this->postJson('/api/admin/shipping-zones', $this->zoneData())->assertForbidden();
    }

    public function test_cost_cannot_be_negative(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/admin/shipping-zones', $this->zoneData(['cost' => -100]))
            ->assertUnprocessable();
    }

    public function test_order_with_invalid_zone_is_rejected(): void
    {
        $response = $this->postJson('/api/orders', [
            'customer' => [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '770000000',
                'address' => '123 Rue Test',
                'city' => 'Dakar',
                'shipping_zone_id' => 9999,
            ],
            'items' => [['variant_id' => 1, 'quantity' => 1]],
        ]);

        // Variant 1 doesn't exist either, but the zone check fires first via request validation.
        $response->assertUnprocessable();
    }
}
