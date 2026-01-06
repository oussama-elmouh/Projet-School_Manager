<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // crée aussi l'utilisateur lié
            'matricule' => $this->faker->unique()->numerify('STU-####'),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'address' => $this->faker->address(),
            'phone' => $this->faker->phoneNumber(),
            'medical_info' => $this->faker->text(),
            'class_id' => SchoolClass::factory(), // ou une classe existante
        ];
    }
}
