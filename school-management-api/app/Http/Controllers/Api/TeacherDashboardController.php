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
 
public function store(Request $request)
{
    $data = $request->validate([
        'user_id' => 'nullable|exists:users,id',

        // on garde email obligatoire
        'email' => 'required|email|unique:users,email|unique:teachers,email',

        'specialization' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'bio' => 'nullable|string',
        'status' => 'required|in:ACTIVE,INACTIVE',

        'classes' => 'nullable|array',
        'classes.*.class_id' => 'required_with:classes|integer|exists:school_classes,id', // ⚠️ adapte table
        'classes.*.subject' => 'required_with:classes|string|max:255',

        // optionnel: name si tu veux (sinon on dérive du email)
        'name' => 'nullable|string|max:255',
    ]);

    // ✅ Si user_id vide => créer user teacher
    $generatedPassword = null;

    if (empty($data['user_id'])) {
        $generatedPassword = Str::random(10);

        $user = User::create([
            'name' => $data['name'] ?? $data['email'],
            'email' => $data['email'],
            'password' => Hash::make($generatedPassword),
            'role' => 'TEACHER',
            'phone' => $data['phone'] ?? null,
            'status' => 'ACTIVE',
        ]);

        $data['user_id'] = $user->id;
    } else {
        // Optionnel: vérifier que user est TEACHER
        $u = User::find($data['user_id']);
        if ($u && $u->role !== 'TEACHER') {
            return response()->json([
                'message' => "L'utilisateur sélectionné n'a pas le rôle TEACHER."
            ], 422);
        }
    }

    // ✅ créer teacher
    $teacher = Teacher::create([
        'user_id' => $data['user_id'],
        'email' => $data['email'],
        'specialization' => $data['specialization'],
        'phone' => $data['phone'] ?? null,
        'bio' => $data['bio'] ?? null,
        'status' => $data['status'],
    ]);

    // ✅ sync classes pivot
    if (!empty($data['classes'])) {
        $sync = [];
        foreach ($data['classes'] as $c) {
            $sync[$c['class_id']] = ['subject' => $c['subject']];
        }
        $teacher->classes()->sync($sync);
    }

    $teacher->load(['user', 'classes']);

    $response = ['data' => $teacher];

    // DEV: renvoyer le mot de passe pour tester
    if ($generatedPassword) {
        $response['generated_user_password'] = $generatedPassword;
    }

    return response()->json($response, 201);
}
public function update(Request $request, Teacher $teacher)
{
    $data = $request->validate([
        'email' => 'required|email|unique:users,email,' . $teacher->user_id . '|unique:teachers,email,' . $teacher->id,
        'specialization' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'bio' => 'nullable|string',
        'status' => 'required|in:ACTIVE,INACTIVE',

        'classes' => 'nullable|array',
        'classes.*.class_id' => 'required_with:classes|integer|exists:school_classes,id',
        'classes.*.subject' => 'required_with:classes|string|max:255',
    ]);

    $teacher->update([
        'email' => $data['email'],
        'specialization' => $data['specialization'],
        'phone' => $data['phone'] ?? null,
        'bio' => $data['bio'] ?? null,
        'status' => $data['status'],
    ]);

    // update user email/phone aussi (pratique)
    if ($teacher->user) {
        $teacher->user->update([
            'email' => $data['email'],
            'phone' => $data['phone'] ?? $teacher->user->phone,
        ]);
    }

    // sync classes
    if (isset($data['classes'])) {
        $sync = [];
        foreach ($data['classes'] as $c) {
            $sync[$c['class_id']] = ['subject' => $c['subject']];
        }
        $teacher->classes()->sync($sync);
    }

    return response()->json(['data' => $teacher->load(['user', 'classes'])], 200);
}

}
