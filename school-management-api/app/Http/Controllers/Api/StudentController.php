<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentController extends Controller
{
public function index(Request $request)
{
    $query = Student::with(['user', 'currentClass', 'parents']);

    if ($request->has('class_id')) {
        $query->where('class_id', $request->class_id);
    }

    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('matricule', 'like', "%{$search}%");
        });
    }

    // ✅ IMPORTANT: afficher les plus récents en premier
    $query->orderByDesc('id'); // ou ->latest() si tu as created_at

    $students = $query->paginate($request->get('per_page', 100));

    return StudentResource::collection($students);
}


    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();

        // ✅ Générer matricule si tu veux garder ce format
        $matricule = 'STU-' . date('Y') . '-' . str_pad(
            Student::count() + 1,
            5,
            '0',
            STR_PAD_LEFT
        );

        // ✅ Si user_id non fourni => créer automatiquement un User STUDENT
        if (empty($data['user_id'])) {
            $passwordPlain = Str::random(10);

            // email optionnel: si non fourni, on génère un email "temp"
            $email = $data['email'] ?? null;
            if (!$email) {
                $slug = Str::slug(($data['first_name'] ?? 'student') . '.' . ($data['last_name'] ?? 'user'));
                $email = $slug . '.' . rand(100, 999) . '@school.local';
            }

            $user = User::create([
                'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                'email' => $email,
                'password' => Hash::make($passwordPlain),
                'role' => 'STUDENT',
                'phone' => $data['phone'] ?? null,
                'status' => 'ACTIVE',
            ]);

            $data['user_id'] = $user->id;

            // ⚠️ Optionnel (dev): retourner le mdp en réponse
            // En prod: plutôt "reset password" / email au parent.
            $data['_generated_password'] = $passwordPlain;
        }

        // ✅ Créer student
        $student = Student::create([
            ...$data,
            'matricule' => $matricule,
        ]);

        $resource = new StudentResource($student->load(['user', 'currentClass', 'parents']));

        // ✅ Si on a généré un mdp, on le renvoie dans la réponse (DEV)
        if (isset($data['_generated_password'])) {
            return response()->json([
                'data' => $resource,
                'generated_user_password' => $data['_generated_password'],
                'message' => 'Élève créé et utilisateur STUDENT généré automatiquement.',
            ], 201);
        }

        return response()->json($resource, 201);
    }

    public function show(Student $student)
    {
        return new StudentResource(
            $student->load(['user', 'currentClass', 'parents', 'absences', 'grades'])
        );
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return new StudentResource($student->load(['user', 'currentClass', 'parents']));
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'message' => 'Élève supprimé avec succès',
        ], 200);
    }

    public function attachParent(Request $request, Student $student)
    {
        $validated = $request->validate([
            'parent_id' => 'required|exists:parent_models,id',
            'relationship' => 'required|string|max:50',
        ]);

        $student->parents()->attach(
            $validated['parent_id'],
            ['relationship' => $validated['relationship']]
        );

        return response()->json([
            'message' => 'Parent ajouté avec succès',
        ], 201);
    }

    public function detachParent(Request $request, Student $student)
    {
        $parentId = $request->validate(['parent_id' => 'required|exists:parent_models,id'])['parent_id'];

        $student->parents()->detach($parentId);

        return response()->json([
            'message' => 'Parent retiré avec succès',
        ], 200);
    }
}
