<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\SchoolClass;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        // ADMIN
        User::factory()->create([
            'email' => 'admin@test.com',
            'role' => 'ADMIN',
        ]);

        // TEACHER
        $teacherUser = User::factory()->create([
            'email' => 'teacher@test.com',
            'role' => 'TEACHER',
        ]);

        $teacher = Teacher::factory()->create([
            'user_id' => $teacherUser->id,
        ]);

        // CLASSES
        $classes = SchoolClass::factory(2)->create();

        // Attacher classes au professeur
        foreach ($classes as $class) {
            $teacher->classes()->attach($class->id, [
                'subject' => fake()->randomElement(['Math', 'Français', 'Science'])
            ]);
        }

        // ÉLÈVES
        $students = Student::factory(15)->create();

        // Inscrire élèves dans la première classe
        foreach ($students as $student) {
            $classes[0]->students()->attach($student->id);
        }
    }
}
