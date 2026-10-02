<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'order_number' => 'UB-'.strtoupper(Str::random(10)),
            'tracking_token' => Str::random(64),
            'user_id' => null,
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'customer_phone' => '77'.rand(1000000, 9999999),
            'shipping_address' => $this->faker->streetAddress(),
            'shipping_city' => 'Dakar',
            'shipping_zone_id' => null,
            'promotion_id' => null,
            'discount_amount' => 0,
            'payment_method' => 'wave_om',
            'payment_status' => Order::PAYMENT_STATUS_PENDING,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => $this->faker->numberBetween(5000, 100000),
            'shipping_cost' => 3000,
            'total' => fn (array $attrs) => $attrs['subtotal'] + $attrs['shipping_cost'] - ($attrs['discount_amount'] ?? 0),
            'notes' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(['payment_status' => Order::PAYMENT_STATUS_PAID]);
    }

    public function delivered(): static
    {
        return $this->state([
            'order_status' => Order::STATUS_DELIVERED,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
        ]);
    }
}
