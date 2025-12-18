<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Http\Resources\ClassResource;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
   /*  public function __construct()
    {
        $this->middleware('auth:sanctum');
    } */

    public function index(Request $request)
    {
        $query = SchoolClass::with(['principalTeacher', 'students']);

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $classes = $query->paginate($request->get('per_page', 15));

        return ClassResource::collection($classes);
    }

    public function store(StoreClassRequest $request)
    {
        $class = SchoolClass::create($request->validated());

        return response()->json(
            new ClassResource($class->load(['principalTeacher', 'students'])),
            201
        );
    }

    public function show(SchoolClass $schoolClass)
    {
        return new ClassResource($schoolClass->load(['principalTeacher', 'students']));
    }

    public function update(UpdateClassRequest $request, SchoolClass $schoolClass)
    {
        $schoolClass->update($request->validated());

        return new ClassResource($schoolClass->load(['principalTeacher', 'students']));
    }

    public function destroy(SchoolClass $schoolClass)
    {
        if ($schoolClass->students()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une classe avec des élèves.',
            ], 422);
        }

        $schoolClass->delete();

        return response()->json([
            'message' => 'Classe supprimée avec succès',
        ], 200);
    }

    public function students(SchoolClass $schoolClass)
    {
        return response()->json([
            'class' => new ClassResource($schoolClass),
            'students' => \App\Http\Resources\StudentResource::collection(
                $schoolClass->students()->paginate(15)
            ),
        ]);
    }
}
