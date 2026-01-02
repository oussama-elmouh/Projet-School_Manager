<?php
namespace App\Http\Controllers\Api; 

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function index(Request $request)
    {


        $query = Teacher::with(['user', 'classes']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%");
            });
        }

        if ($request->has('class_id')) {
            $query->whereHas('classes', fn($q) => $q->where('class_id', $request->class_id));
        }

        $teachers = $query->paginate($request->get('per_page', 15));

        return TeacherResource::collection($teachers);
    }

    public function store(StoreTeacherRequest $request)
    {
        $matricule = 'PROF-' . date('Y') . '-' . str_pad(
            Teacher::count() + 1,
            5,
            '0',
            STR_PAD_LEFT
        );

        $teacher = Teacher::create([
            ...$request->validated(),
            'matricule' => $matricule,
        ]);

        if ($request->has('classes')) {
            $classes = [];
            foreach ($request->classes as $class) {
                $classes[$class['class_id']] = ['subject' => $class['subject']];
            }
            $teacher->classes()->attach($classes);
        }

        return response()->json(
            new TeacherResource($teacher->load(['user', 'classes'])),
            201
        );
    }

    public function show(Teacher $teacher)
    {
        return new TeacherResource($teacher->load(['user', 'classes']));
    }

  public function update(UpdateTeacherRequest $request, Teacher $teacher)
{
    $teacher->update($request->validated());

    if ($request->has('classes')) {
        $classes = [];
        foreach ($request->classes as $class) {
            // On s'assure que class_id existe pour éviter les erreurs
            if (!empty($class['class_id'])) {
                $classes[$class['class_id']] = ['subject' => $class['subject']];
            }
        }
        // sync() supprime ce qui n'est pas dans la liste et ajoute/met à jour le reste
        $teacher->classes()->sync($classes);
    }

    return new TeacherResource($teacher->load(['user', 'classes']));
}

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();
        return response()->json(['message' => 'Professeur supprimé'], 200);
    }

    // Assigner classe à prof
    public function assignClass(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject' => 'required|string|max:100',
        ]);

        $teacher->classes()->attach(
            $validated['class_id'],
            ['subject' => $validated['subject']]
        );

        return response()->json(['message' => 'Classe assignée'], 201);
    }

    public function removeClass(Request $request, Teacher $teacher)
    {
        $classId = $request->validate(['class_id' => 'required|exists:school_classes,id'])['class_id'];
        $teacher->classes()->detach($classId);

        return response()->json(['message' => 'Classe retirée'], 200);
    }
}
