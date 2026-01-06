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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%");
            });
        }

        if ($request->filled('class_id')) {
            $query->whereHas('classes', function ($q) use ($request) {
                $q->where('school_classes.id', $request->class_id);
            });
        }

        return TeacherResource::collection(
            $query->paginate($request->get('per_page', 15))
        );
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

        if ($request->filled('classes')) {
            $classes = collect($request->classes)->mapWithKeys(function ($class) {
                return [
                    $class['class_id'] => ['subject' => $class['subject']]
                ];
            });

            $teacher->classes()->sync($classes);
        }

        return new TeacherResource(
            $teacher->load(['user', 'classes'])
        );
    }

    public function show(Teacher $teacher)
    {
        return new TeacherResource(
            $teacher->load(['user', 'classes'])
        );
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $teacher->update($request->validated());

        if ($request->filled('classes')) {
            $classes = collect($request->classes)->mapWithKeys(function ($class) {
                return [
                    $class['class_id'] => ['subject' => $class['subject']]
                ];
            });

            $teacher->classes()->sync($classes);
        }

        return new TeacherResource(
            $teacher->load(['user', 'classes'])
        );
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->delete();

        return response()->json([
            'message' => 'Professeur supprimé'
        ]);
    }
}
