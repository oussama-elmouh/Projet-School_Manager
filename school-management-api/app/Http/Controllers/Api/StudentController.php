<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
 /*    public function __construct()
    {
        $this->middleware('auth:sanctum');
    } */

    public function index(Request $request)
    {
         $students = Student::with('currentClass')->get();
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

        $students = $query->paginate($request->get('per_page', 15));

        return StudentResource::collection($students);
    }

    public function store(StoreStudentRequest $request)
    {
        $matricule = 'STU-' . date('Y') . '-' . str_pad(
            Student::count() + 1,
            5,
            '0',
            STR_PAD_LEFT
        );

        $student = Student::create([
            ...$request->validated(),
            'matricule' => $matricule,
        ]);

        return response()->json(
            new StudentResource($student->load(['user', 'currentClass', 'parents'])),
            201
        );
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
