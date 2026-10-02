<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductVariantCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function product(): Product
    {
        return Product::create(['name' => 'Hoodie', 'slug' => 'hoodie', 'price' => 100]);
    }

    public function test_admin_can_create_variant_with_initial_stock_journalized(): void
    {
        $product = $this->product();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/variants', [
                'size' => 'M',
                'price' => 100,
                'initial_stock' => 7,
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.stock', 7);

        $this->assertDatabaseHas('stock_movements', [
            'type' => 'in',
            'quantity' => 7,
            'reason' => 'initial_stock',
        ]);
    }

    public function test_stock_cannot_be_set_directly_on_update(): void
    {
        $variant = ProductVariant::create([
            'product_id' => $this->product()->id,
            'size' => 'M',
            'sku' => 'UB-M',
            'price' => 100,
            'stock' => 5,
        ]);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/variants/'.$variant->id, ['price' => 120, 'stock' => 999])
            ->assertStatus(422)
            ->assertJsonValidationErrors('stock');

        $this->assertSame(5, $variant->fresh()->stock);
    }

    public function test_sku_must_be_unique(): void
    {
        $product = $this->product();

        ProductVariant::create([
            'product_id' => $product->id, 'size' => 'S', 'sku' => 'UB-S', 'price' => 100, 'stock' => 1,
        ]);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/variants', [
                'size' => 'S', 'sku' => 'UB-S', 'price' => 100,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('sku');
    }

    public function test_staff_can_create_but_only_admin_can_delete(): void
    {
        $product = $this->product();

        $created = $this->actingAs(User::factory()->staff()->create(), 'sanctum')
            ->postJson('/api/admin/products/'.$product->id.'/variants', ['size' => 'L', 'price' => 100])
            ->assertStatus(201);

        $variantId = $created->json('data.id');

        $this->actingAs(User::factory()->staff()->create(), 'sanctum')
            ->deleteJson('/api/admin/variants/'.$variantId)
            ->assertStatus(403);

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/variants/'.$variantId)
            ->assertOk();
    }
}
