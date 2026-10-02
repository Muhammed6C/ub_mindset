<?php

namespace Database\Factories;

use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShippingZoneFactory extends Factory
{
    protected $model = ShippingZone::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->city(),
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'country_code' => 'SN',
            'city' => $this->faker->city(),
            'cost' => $this->faker->numberBetween(1000, 5000),
            'free_over' => $this->faker->numberBetween(30000, 100000),
            'estimated_days' => $this->faker->randomElement(['1-2 jours', '3-5 jours', '5-7 jours']),
            'is_active' => true,
            'position' => $this->faker->numberBetween(1, 100),
        ];
    }
}
