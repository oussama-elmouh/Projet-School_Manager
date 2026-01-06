<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ===== 1. Créer un utilisateur ADMIN =====
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
        ]);

        // ===== 2. Créer 35 professeurs (5 par classe × 7 classes) =====
        $teachers = collect();
        for ($i = 0; $i < 35; $i++) {
            $user = User::create([
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'password' => Hash::make('password'),
                'role' => 'TEACHER',
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'matricule' => fake()->unique()->numerify('TCHR-####'),
                'specialization' => fake()->randomElement(['Maths', 'Français', 'Anglais', 'Histoire', 'Sciences', 'Physique']),
                'phone' => fake()->phoneNumber(),
                'email' => fake()->unique()->safeEmail(),
                'bio' => fake()->paragraph(),
                'status' => fake()->randomElement(['ACTIVE', 'INACTIVE']),
            ]);

            $teachers->push($teacher);
        }

        // ===== 3. Créer 7 classes avec 30 élèves et 5 professeurs chacun =====
        for ($classNum = 1; $classNum <= 7; $classNum++) {
            // Créer la classe
            $class = SchoolClass::create([
                'name' => "Classe " . chr(64 + $classNum),  // Classe A, B, C, D, E, F, G
                'level' => "Niveau " . $classNum,
                'capacity' => 30,
                'academic_year' => '2025-2026',
                'principal_teacher_id' => $teachers->get(($classNum - 1) * 5)->user_id, // Premier prof = directeur classe
            ]);

            // ===== IMPORTANT: Assigner 5 professeurs à cette classe =====
            $classTeachers = $teachers->slice(($classNum - 1) * 5, 5);
            foreach ($classTeachers as $teacher) {
                // Attacher le professeur avec une matière
                $class->teachers()->attach($teacher->id, [
                    'subject' => $teacher->specialization,
                ]);
            }

            // ===== 4. Créer 30 élèves pour cette classe =====
            for ($i = 0; $i < 30; $i++) {
                $user = User::create([
                    'name' => fake()->name(),
                    'email' => fake()->unique()->safeEmail(),
                    'password' => Hash::make('password'),
                    'role' => 'STUDENT',
                ]);

                Student::create([
                    'user_id' => $user->id,
                    'matricule' => fake()->unique()->numerify('STU-####'),
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'date_of_birth' => fake()->date(),
                    'gender' => fake()->randomElement(['M', 'F']),
                    'address' => fake()->address(),
                    'phone' => fake()->phoneNumber(),
                    'medical_info' => fake()->text(),
                    'class_id' => $class->id,
                ]);
            }

            echo "✅ Classe {$class->name} créée : 30 élèves + 5 professeurs\n";
        }

        echo "\n✅✅✅ BASE DE DONNÉES COMPLÈTE ✅✅✅\n";
        echo "- 1 Admin\n";
        echo "- 35 Professeurs\n";
        echo "- 7 Classes\n";
        echo "- 210 Étudiants (30 par classe)\n";
        echo "- Tous les professeurs assignés aux classes ✅\n";
    }
}
