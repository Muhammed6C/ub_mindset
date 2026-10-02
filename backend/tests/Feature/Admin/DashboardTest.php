<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
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

    public function test_admin_can_access_dashboard(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'orders' => ['total', 'this_month', 'pending', 'processing'],
                    'revenue' => ['total', 'this_month', 'last_month', 'avg_order_value'],
                    'products' => ['total', 'active', 'out_of_stock'],
                    'customers' => ['total', 'new_this_month'],
                    'low_stock_alerts',
                    'recent_orders',
                ],
            ]);
    }

    public function test_dashboard_counts_pending_orders(): void
    {
        Sanctum::actingAs($this->adminUser());

        Order::factory()->count(3)->create([
            'order_status' => Order::STATUS_PENDING,
            'order_number' => fn () => 'UB-'.strtoupper(str()->random(10)),
        ]);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk();
        $this->assertEquals(3, $response->json('data.orders.pending'));
    }

    public function test_customer_cannot_access_dashboard(): void
    {
        Sanctum::actingAs($this->customerUser());

        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_dashboard_revenue_includes_only_paid_orders(): void
    {
        Sanctum::actingAs($this->adminUser());

        Order::factory()->create([
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'total' => 15000,
            'order_number' => 'UB-PAID00001',
        ]);
        Order::factory()->create([
            'payment_status' => Order::PAYMENT_STATUS_PENDING,
            'total' => 99999,
            'order_number' => 'UB-PEND00001',
        ]);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk();
        $this->assertEquals(15000.0, $response->json('data.revenue.total'));
    }
}
