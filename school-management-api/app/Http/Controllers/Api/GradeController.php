<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradeRequest;
use App\Http\Resources\GradeResource;
use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Grade::with(['student', 'subject', 'teacher']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('period')) {
            $query->where('period', $request->period);
        }

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        $grades = $query->paginate($request->get('per_page', 15));

        return GradeResource::collection($grades);
    }

    public function store(StoreGradeRequest $request)
    {
        $grade = Grade::create([
            ...$request->validated(),
            'teacher_id' => auth()->id(),
        ]);

        return response()->json(
            new GradeResource($grade->load(['student', 'subject', 'teacher'])),
            201
        );
    }

    public function show(Grade $grade)
    {
        return new GradeResource($grade->load(['student', 'subject', 'teacher']));
    }

    public function update(Request $request, Grade $grade)
    {
        $validated = $request->validate([
            'score' => 'sometimes|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $grade->update($validated);

        return new GradeResource($grade->load(['student', 'subject', 'teacher']));
    }

    public function destroy(Grade $grade)
    {
        $grade->delete();

        return response()->json([
            'message' => 'Note supprimée avec succès',
        ], 200);
    }

    public function studentAverage(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'period' => 'required|in:T1,T2,T3',
        ]);

        $grades = Grade::where('student_id', $validated['student_id'])
            ->where('period', $validated['period'])
            ->with(['subject'])
            ->get();

        if ($grades->isEmpty()) {
            return response()->json([
                'message' => 'Aucune note trouvée pour cette période.',
            ], 404);
        }

        $averages = [];
        foreach ($grades->groupBy('subject_id') as $subjectGrades) {
            $subject = $subjectGrades->first()->subject;
            $average = $subjectGrades->avg('score');
            $coefficient = $subject->coefficient;

            $averages[] = [
                'subject' => $subject->name,
                'coefficient' => $coefficient,
                'average' => round($average, 2),
                'weighted_average' => round($average * $coefficient, 2),
            ];
        }

        $totalCoefficient = collect($averages)->sum('coefficient');
        $generalAverage = collect($averages)->sum('weighted_average') / $totalCoefficient;

        return response()->json([
            'student_id' => $validated['student_id'],
            'period' => $validated['period'],
            'subject_averages' => $averages,
            'general_average' => round($generalAverage, 2),
        ]);
    }

    public function bulletin(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'period' => 'required|in:T1,T2,T3',
        ]);

        $student = \App\Models\Student::with('currentClass')->find($validated['student_id']);
        $grades = Grade::where('student_id', $validated['student_id'])
            ->where('period', $validated['period'])
            ->with(['subject', 'teacher'])
            ->get();

        if ($grades->isEmpty()) {
            return response()->json([
                'message' => 'Aucun résultat pour cette période.',
            ], 404);
        }

        $data = [];
        foreach ($grades->groupBy('subject_id') as $subjectGrades) {
            $subject = $subjectGrades->first()->subject;
            $average = $subjectGrades->avg('score');

            $data[] = [
                'subject' => $subject->name,
                'coefficient' => $subject->coefficient,
                'average' => round($average, 2),
                'grade_details' => GradeResource::collection($subjectGrades),
            ];
        }

        $totalCoefficient = collect($data)->sum('coefficient');
        $generalAverage = collect($data)->sum(fn($item) => $item['average'] * $item['coefficient']) / $totalCoefficient;

        return response()->json([
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'matricule' => $student->matricule,
                'class' => $student->currentClass->name,
            ],
            'period' => $validated['period'],
            'subjects' => $data,
            'general_average' => round($generalAverage, 2),
            'ranking' => $this->calculateRanking($student->class_id, $validated['period'], $generalAverage),
        ]);
    }

    private function calculateRanking($classId, $period, $studentAverage)
    {
        $students = \App\Models\Student::where('class_id', $classId)->with('grades')->get();

        $averages = $students->map(function ($student) use ($period) {
            $grades = $student->grades()->where('period', $period)->get();
            if ($grades->isEmpty()) return null;

            $totalCoeff = $grades->groupBy('subject_id')->sum(
                fn($g) => $g->first()->subject->coefficient
            );

            return $grades->groupBy('subject_id')->sum(
                fn($g) => $g->avg('score') * $g->first()->subject->coefficient
            ) / $totalCoeff;
        })->filter()->sort()->reverse();

        return $averages->search($studentAverage) + 1;
    }
}
