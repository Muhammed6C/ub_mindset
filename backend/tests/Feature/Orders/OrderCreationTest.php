<?php

namespace Tests\Feature\Orders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCreationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{variant: ProductVariant, product: Product}
     */
    private function makeVariant(float $price = 35000, int $stock = 10): array
    {
        $category = Category::create(['name' => 'Vêtements', 'slug' => 'vetements']);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Hoodie Oversize',
            'slug' => 'hoodie-oversize',
            'price' => $price,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'sku' => 'UB-HOODIE-M',
            'price' => $price,
            'stock' => $stock,
        ]);

        return ['variant' => $variant, 'product' => $product];
    }

    /**
     * @return array<string, mixed>
     */
    private function customerPayload(): array
    {
        return [
            'name' => 'Ali Diallo',
            'email' => 'ali@example.com',
            'phone' => '+221 77 123 45 67',
            'address' => '12 rue de Dakar',
            'city' => 'Dakar',
        ];
    }

    public function test_order_total_is_calculated_server_side(): void
    {
        ['variant' => $variant] = $this->makeVariant(price: 35000, stock: 10);

        $response = $this->postJson('/api/orders', [
            'customer' => $this->customerPayload(),
            'items' => [['variant_id' => $variant->id, 'quantity' => 2]],
            // Tentative de falsification de prix : ignorée par le serveur.
            'total' => 1,
            'price' => 1,
        ]);

        $response->assertStatus(201);

        // 2 x 35000 = 70000 >= 50000 => port gratuit.
        $this->assertEquals(70000.0, $response->json('order.subtotal'));
        $this->assertEquals(0.0, $response->json('order.shipping_cost'));
        $this->assertEquals(70000.0, $response->json('order.total'));

        $this->assertDatabaseHas('orders', ['total' => 70000, 'shipping_cost' => 0]);
        $this->assertEquals(8, $variant->fresh()->stock);
    }

    public function test_shipping_cost_applies_below_threshold(): void
    {
        ['variant' => $variant] = $this->makeVariant(price: 12000, stock: 10);

        $response = $this->postJson('/api/orders', [
            'customer' => $this->customerPayload(),
            'items' => [['variant_id' => $variant->id, 'quantity' => 1]],
        ]);

        $response->assertStatus(201);
        $this->assertEquals(12000.0, $response->json('order.subtotal'));
        $this->assertEquals(3000.0, $response->json('order.shipping_cost'));
        $this->assertEquals(15000.0, $response->json('order.total'));
    }

    public function test_order_rejects_unknown_variant(): void
    {
        $this->postJson('/api/orders', [
            'customer' => $this->customerPayload(),
            'items' => [['variant_id' => 999999, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('items');
    }

    public function test_order_rejects_insufficient_stock(): void
    {
        ['variant' => $variant] = $this->makeVariant(stock: 1);

        $this->postJson('/api/orders', [
            'customer' => $this->customerPayload(),
            'items' => [['variant_id' => $variant->id, 'quantity' => 5]],
        ])->assertStatus(422)->assertJsonValidationErrors('items');
    }

    public function test_order_rejects_html_in_customer_fields(): void
    {
        ['variant' => $variant] = $this->makeVariant();

        $payload = $this->customerPayload();
        $payload['name'] = '<script>alert(1)</script>';

        $this->postJson('/api/orders', [
            'customer' => $payload,
            'items' => [['variant_id' => $variant->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors('customer.name');
    }

    public function test_order_tracking_requires_valid_token(): void
    {
        ['variant' => $variant] = $this->makeVariant();

        $created = $this->postJson('/api/orders', [
            'customer' => $this->customerPayload(),
            'items' => [['variant_id' => $variant->id, 'quantity' => 1]],
        ]);

        $orderNumber = $created->json('order_number');
        $token = $created->json('tracking_token');

        // Sans jeton : accès refusé (anti-IDOR / anti-énumération).
        $this->getJson('/api/orders/'.$orderNumber)->assertStatus(403);

        // Avec le bon jeton : accès autorisé.
        $this->getJson('/api/orders/'.$orderNumber.'?token='.$token)->assertOk();

        // Le jeton n'est jamais exposé dans la ressource.
        $this->assertArrayNotHasKey('tracking_token', $created->json('order'));
        $this->assertSame(1, Order::count());
    }
}
