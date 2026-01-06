<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Grade;

class SchoolDemoSeeder extends Seeder
{
    public function run(): void
    {
        // ===== ADMIN =====
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
        ]);

        // ===== TEACHERS =====
        $teachers = collect();

        for ($i = 0; $i < 3; $i++) {
            $user = User::factory()->create([
                'role' => 'TEACHER',
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
            ]);

            $teachers->push($teacher);
        }

        // ===== CLASSES =====
        $classes = SchoolClass::factory(4)->create();

        foreach ($classes as $class) {
            $teacher = $teachers->random();

            $teacher->classes()->attach($class->id, [
                'subject' => fake()->randomElement(['Math', 'Français', 'Science']),
            ]);
        }

        // ===== STUDENTS =====
        $students = Student::factory(30)->create();

        foreach ($students as $student) {
            $class = $classes->random();
            $class->students()->attach($student->id);
        }

        // ===== GRADES =====
        foreach ($classes as $class) {
            $teacher = $teachers->random();

            foreach ($class->students as $student) {
                Grade::factory()->create([
                    'student_id' => $student->id,
                    'teacher_id' => $teacher->id,
                    'class_id' => $class->id,
                ]);
            }
        }
    }
}
