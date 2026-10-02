<?php

namespace Tests\Feature\Admin;

use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PromotionTest extends TestCase
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

    private function promoData(array $overrides = []): array
    {
        return array_merge([
            'code' => 'SUMMER10',
            'name' => 'Soldes été',
            'type' => 'percentage',
            'value' => 10,
            'min_order_amount' => 5000,
            'is_active' => true,
        ], $overrides);
    }

    // ─── Admin CRUD ───────────────────────────────────────────────────────────

    public function test_admin_can_list_promotions(): void
    {
        Sanctum::actingAs($this->adminUser());
        Promotion::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/promotions');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_can_create_promotion(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/admin/promotions', $this->promoData());

        $response->assertCreated()->assertJsonPath('data.code', 'SUMMER10');
        $this->assertDatabaseHas('promotions', ['code' => 'SUMMER10']);
    }

    public function test_admin_can_update_promotion(): void
    {
        Sanctum::actingAs($this->adminUser());
        $promo = Promotion::factory()->create(['value' => 10]);

        $this->putJson("/api/admin/promotions/{$promo->id}", ['value' => 20])
            ->assertOk()
            ->assertJsonFragment(['value' => 20.0]);
    }

    public function test_admin_can_delete_promotion(): void
    {
        Sanctum::actingAs($this->adminUser());
        $promo = Promotion::factory()->create();

        $this->deleteJson("/api/admin/promotions/{$promo->id}")->assertOk();
        $this->assertDatabaseMissing('promotions', ['id' => $promo->id]);
    }

    public function test_customer_cannot_manage_promotions(): void
    {
        Sanctum::actingAs($this->customerUser());

        $this->getJson('/api/admin/promotions')->assertForbidden();
        $this->postJson('/api/admin/promotions', $this->promoData())->assertForbidden();
    }

    // ─── Validation de sécurité ───────────────────────────────────────────────

    public function test_percentage_value_cannot_exceed_100(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/admin/promotions', $this->promoData(['type' => 'percentage', 'value' => 110]))
            ->assertUnprocessable();
    }

    public function test_fixed_value_cannot_be_negative(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/admin/promotions', $this->promoData(['type' => 'fixed', 'value' => -500]))
            ->assertUnprocessable();
    }

    public function test_duplicate_promo_code_is_rejected(): void
    {
        Sanctum::actingAs($this->adminUser());
        Promotion::factory()->create(['code' => 'SUMMER10']);

        $this->postJson('/api/admin/promotions', $this->promoData(['code' => 'SUMMER10']))
            ->assertUnprocessable();
    }

    public function test_promo_code_must_be_alphanumeric(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/admin/promotions', $this->promoData(['code' => 'INVALID CODE!']))
            ->assertUnprocessable();
    }
}
