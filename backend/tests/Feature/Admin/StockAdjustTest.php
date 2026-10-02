<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockAdjustTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function variant(int $stock = 10): ProductVariant
    {
        $product = Product::create(['name' => 'P', 'slug' => 'p-'.uniqid(), 'price' => 100]);

        return ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'sku' => 'UB-'.uniqid(),
            'price' => 100,
            'stock' => $stock,
        ]);
    }

    public function test_admin_can_add_stock_and_movement_is_logged(): void
    {
        $variant = $this->variant(10);
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/stock/adjust', [
                'product_variant_id' => $variant->id,
                'type' => 'in',
                'quantity' => 5,
                'reason' => 'Réapprovisionnement',
            ])
            ->assertStatus(201);

        $this->assertSame(15, $variant->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $variant->id,
            'type' => 'in',
            'quantity' => 5,
            'user_id' => $admin->id,
        ]);
    }

    public function test_injected_user_id_is_ignored(): void
    {
        $variant = $this->variant(10);
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/stock/adjust', [
                'product_variant_id' => $variant->id,
                'type' => 'in',
                'quantity' => 1,
                'user_id' => 999999, // ignoré : forcé côté serveur
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('stock_movements', ['user_id' => $admin->id]);
        $this->assertDatabaseMissing('stock_movements', ['user_id' => 999999]);
    }

    public function test_stock_cannot_become_negative(): void
    {
        $variant = $this->variant(2);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/stock/adjust', [
                'product_variant_id' => $variant->id,
                'type' => 'out',
                'quantity' => 5,
            ])
            ->assertStatus(422);

        $this->assertSame(2, $variant->fresh()->stock);
    }

    public function test_adjust_sets_absolute_stock(): void
    {
        $variant = $this->variant(10);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/stock/adjust', [
                'product_variant_id' => $variant->id,
                'type' => 'adjust',
                'quantity' => 3,
            ])
            ->assertStatus(201);

        $this->assertSame(3, $variant->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'product_variant_id' => $variant->id,
            'type' => 'adjust',
            'quantity' => -7,
        ]);
    }

    public function test_quantity_must_be_positive_for_in_or_out(): void
    {
        $variant = $this->variant(10);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/stock/adjust', [
                'product_variant_id' => $variant->id,
                'type' => 'out',
                'quantity' => 0,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('quantity');
    }

    public function test_customer_cannot_adjust_stock(): void
    {
        $variant = $this->variant(10);

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/admin/stock/adjust', [
                'product_variant_id' => $variant->id,
                'type' => 'in',
                'quantity' => 1,
            ])
            ->assertStatus(403);
    }
}
