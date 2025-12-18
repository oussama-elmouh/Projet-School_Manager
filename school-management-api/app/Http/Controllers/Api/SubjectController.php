<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Subject::query();

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $subjects = $query->paginate($request->get('per_page', 15));

        return SubjectResource::collection($subjects);
    }

    public function store(StoreSubjectRequest $request)
    {
        $subject = Subject::create($request->validated());

        return response()->json(
            new SubjectResource($subject),
            201
        );
    }

    public function show(Subject $subject)
    {
        return new SubjectResource($subject);
    }

    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        $subject->update($request->validated());

        return new SubjectResource($subject);
    }

    public function destroy(Subject $subject)
    {
        if ($subject->grades()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une matière avec des notes.',
            ], 422);
        }

        $subject->delete();

        return response()->json([
            'message' => 'Matière supprimée avec succès',
        ], 200);
    }
}
