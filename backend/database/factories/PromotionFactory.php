<?php

namespace Database\Factories;

use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['percentage', 'fixed']);

        return [
            'code' => strtoupper(Str::random(8)),
            'name' => $this->faker->sentence(3),
            'type' => $type,
            'value' => $type === 'percentage'
                ? $this->faker->numberBetween(5, 50)
                : $this->faker->numberBetween(500, 5000),
            'min_order_amount' => $this->faker->numberBetween(3000, 20000),
            'usage_limit' => $this->faker->numberBetween(10, 200),
            'used_count' => 0,
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
        ];
    }

    public function expired(): static
    {
        return $this->state(['ends_at' => now()->subDay()]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
