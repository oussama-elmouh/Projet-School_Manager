<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;

class TeacherDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Récupérer le professeur lié à l'utilisateur connecté
        $teacher = Teacher::where('user_id', $user->id)
            ->with(['classes.students'])
            ->first();

        if (!$teacher) {
            return response()->json([
                'message' => 'Professeur non trouvé'
            ], 404);
        }

        return response()->json([
            'teacher' => [
                'id' => $teacher->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'classes' => $teacher->classes->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'level' => $class->level,
                    'subject' => $class->pivot->subject,
                    'students' => $class->students->map(function ($student) {
                        return [
                            'id' => $student->id,
                            'full_name' => $student->first_name . ' ' . $student->last_name,
                            'matricule' => $student->matricule,
                        ];
                    }),
                ];
            }),
        ]);
    }
}
