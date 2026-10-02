<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_can_create_product(): void
    {
        $category = Category::create(['name' => 'Vet', 'slug' => 'vet']);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products', [
                'category_id' => $category->id,
                'name' => 'Hoodie Test',
                'price' => 25000,
                'original_price' => 35000,
                'is_active' => true,
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'hoodie-test');

        $this->assertDatabaseHas('products', ['slug' => 'hoodie-test', 'price' => 25000]);
    }

    public function test_original_price_must_be_greater_or_equal_to_price(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Promo invalide',
                'price' => 5000,
                'original_price' => 1000,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('original_price');
    }

    public function test_technical_fields_injected_by_client_are_ignored(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Produit Injecté',
                'price' => 1000,
                'stock' => 9999,   // non validé => ignoré
                'user_id' => 12345, // non validé => ignoré
                'role' => 'admin',  // non validé => ignoré
            ])
            ->assertStatus(201);

        $product = Product::where('slug', 'produit-injecte')->firstOrFail();

        // Aucune variante n'a été créée avec le stock injecté.
        $this->assertSame(0, $product->variants()->count());
    }

    public function test_invalid_sort_is_rejected(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/products?sort=price;DROP+TABLE')
            ->assertStatus(422)
            ->assertJsonValidationErrors('sort');
    }

    public function test_per_page_is_capped(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/products?per_page=100000')
            ->assertStatus(422)
            ->assertJsonValidationErrors('per_page');
    }

    public function test_staff_cannot_delete_product_but_admin_can(): void
    {
        $product = Product::create(['name' => 'P', 'slug' => 'p', 'price' => 100]);

        $this->actingAs(User::factory()->staff()->create(), 'sanctum')
            ->deleteJson('/api/admin/products/'.$product->id)
            ->assertStatus(403);

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson('/api/admin/products/'.$product->id)
            ->assertOk();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_customer_cannot_access_admin_products(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/admin/products')
            ->assertStatus(403);
    }

    public function test_staff_can_view_inactive_product_in_backoffice(): void
    {
        $product = Product::create([
            'name' => 'Inactif', 'slug' => 'inactif', 'price' => 100, 'is_active' => false,
        ]);

        $this->actingAs(User::factory()->staff()->create(), 'sanctum')
            ->getJson('/api/admin/products/'.$product->id)
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
    }

    public function test_inactive_product_returns_404_publicly_not_403(): void
    {
        $product = Product::create([
            'name' => 'Inactif2', 'slug' => 'inactif-2', 'price' => 100, 'is_active' => false,
        ]);

        // 404 (et non 403) : aucune fuite sur l'existence de la ressource.
        $this->getJson('/api/products/'.$product->id)->assertStatus(404);
    }
}
