<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function staff(): User
    {
        return User::factory()->staff()->create();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function order(array $attributes = []): Order
    {
        return Order::create(array_merge([
            'order_number' => 'UB-'.Str::upper(Str::random(10)),
            'tracking_token' => Str::random(64),
            'customer_name' => 'Client Test',
            'customer_email' => 'client@example.com',
            'customer_phone' => '+221770000000',
            'shipping_address' => '1 rue du Test',
            'shipping_city' => 'Dakar',
            'payment_method' => 'wave_om',
            'payment_status' => Order::PAYMENT_STATUS_PENDING,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 10000,
            'shipping_cost' => 3000,
            'total' => 13000,
        ], $attributes));
    }

    public function test_guest_is_unauthenticated(): void
    {
        $this->getJson('/api/admin/orders')->assertStatus(401);
    }

    public function test_customer_is_forbidden(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/admin/orders')
            ->assertStatus(403);
    }

    public function test_admin_can_list_orders(): void
    {
        $this->order();
        $this->order(['order_number' => 'UB-SECOND0001']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_index_can_filter_by_status(): void
    {
        $this->order();
        $this->order(['order_status' => Order::STATUS_SHIPPED]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?status=shipped')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order_status', Order::STATUS_SHIPPED);
    }

    public function test_index_can_search_customer(): void
    {
        $this->order();
        $this->order(['customer_name' => 'Awa Ndiaye', 'customer_email' => 'awa@example.com']);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?search=awa')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.customer.name', 'Awa Ndiaye');
    }

    public function test_index_rejects_unknown_status_filter(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?status=;DROP TABLE orders')
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_index_per_page_is_capped(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders?per_page=5000')
            ->assertStatus(422)
            ->assertJsonValidationErrors('per_page');
    }

    public function test_show_returns_order_with_allowed_transitions(): void
    {
        $order = $this->order();

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders/'.$order->id)
            ->assertOk()
            ->assertJsonPath('data.order_number', $order->order_number)
            ->assertJsonPath('data.allowed_transitions', [
                Order::STATUS_CONFIRMED,
                Order::STATUS_CANCELLED,
            ]);
    }

    public function test_show_does_not_leak_tracking_token(): void
    {
        $order = $this->order();

        $response = $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/admin/orders/'.$order->id)
            ->assertOk();

        $this->assertStringNotContainsString((string) $order->tracking_token, $response->getContent());
    }

    public function test_staff_can_advance_status(): void
    {
        $order = $this->order();

        $this->actingAs($this->staff(), 'sanctum')
            ->postJson('/api/admin/orders/'.$order->id.'/status', [
                'status' => Order::STATUS_CONFIRMED,
            ])
            ->assertOk()
            ->assertJsonPath('data.order_status', Order::STATUS_CONFIRMED);

        $this->assertSame(Order::STATUS_CONFIRMED, $order->fresh()->order_status);
    }

    public function test_workflow_rejects_status_jump(): void
    {
        $order = $this->order();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/orders/'.$order->id.'/status', [
                'status' => Order::STATUS_SHIPPED,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->order_status);
    }

    public function test_delivered_order_cannot_be_reopened(): void
    {
        $order = $this->order(['order_status' => Order::STATUS_DELIVERED]);

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/orders/'.$order->id.'/status', [
                'status' => Order::STATUS_PROCESSING,
            ])
            ->assertStatus(422);

        $this->assertSame(Order::STATUS_DELIVERED, $order->fresh()->order_status);
    }

    public function test_status_value_is_whitelisted(): void
    {
        $order = $this->order();

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/admin/orders/'.$order->id.'/status', ['status' => 'rooted'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_customer_cannot_change_status(): void
    {
        $order = $this->order(['user_id' => null]);

        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/admin/orders/'.$order->id.'/status', [
                'status' => Order::STATUS_CONFIRMED,
            ])
            ->assertStatus(403);

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->order_status);
    }

    public function test_admin_can_update_shipping_and_notes(): void
    {
        $order = $this->order();

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/orders/'.$order->id, [
                'shipping_method' => 'Express',
                'tracking_number' => 'SN-123456',
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'notes' => 'Client rappelé, colis à livrer avant vendredi.',
            ])
            ->assertOk()
            ->assertJsonPath('data.tracking_number', 'SN-123456')
            ->assertJsonPath('data.payment_status', Order::PAYMENT_STATUS_PAID);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'shipping_method' => 'Express',
            'tracking_number' => 'SN-123456',
            'payment_status' => Order::PAYMENT_STATUS_PAID,
        ]);
    }

    public function test_update_cannot_change_order_status(): void
    {
        $order = $this->order();

        // `order_status` n'est pas une règle de `OrderUpdateRequest` → ignoré.
        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/orders/'.$order->id, [
                'order_status' => Order::STATUS_DELIVERED,
            ])
            ->assertOk();

        $this->assertSame(Order::STATUS_PENDING, $order->fresh()->order_status);
    }

    public function test_update_rejects_html_and_unknown_payment_status(): void
    {
        $order = $this->order();

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/orders/'.$order->id, [
                'notes' => '<script>alert(1)</script>',
                'payment_status' => 'crypto',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['notes', 'payment_status']);
    }

    public function test_update_ignores_injected_amounts(): void
    {
        $order = $this->order();

        // Les montants ne sont jamais modifiables : ils sont calculés côté serveur.
        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/admin/orders/'.$order->id, [
                'total' => 1,
                'subtotal' => 1,
            ])
            ->assertOk();

        $this->assertSame(13000.0, (float) $order->fresh()->total);
    }
}
