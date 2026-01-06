<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
              'name' => fake()->randomElement([
            '1ère année fondamentale',
            '2ème année fondamentale',
            '3ème année fondamentale',
        ]),
        'level' => fake()->randomElement(['Primaire', 'Collège']),
        ];
    }
}
