<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * GET /api/v1/grades
     * Récupérer toutes les notes
     */
    public function index(Request $request)
    {
        $query = Grade::with(['student', 'subject', 'teacher']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('period')) {
            $query->where('period', $request->period);
        }

        $grades = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'data' => $grades
        ]);
    }

    /**
     * POST /api/v1/grades
     * Enregistrer une note
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'type' => 'required|in:EXAM,ASSIGNMENT,CLASS_WORK,PROJECT',
            'score' => 'required|numeric|min:0',
            'total_score' => 'required|numeric|min:0.01',
            'period' => 'required|in:T1,T2,T3',
            'remarks' => 'nullable|string',
        ]);

        $validated['teacher_id'] = auth()->user()->teacher->id ?? 1;

        $grade = Grade::create($validated);

        return response()->json([
            'message' => 'Note enregistrée',
            'data' => $grade->load(['student', 'subject', 'teacher']),
            'percentage' => $grade->percentage,
            'status' => $grade->grade_status,
        ], 201);
    }

    /**
     * GET /api/v1/grades/{id}
     * Récupérer une note
     */
    public function show(Grade $grade)
    {
        return response()->json([
            'data' => $grade->load(['student', 'subject', 'teacher']),
            'percentage' => $grade->percentage,
        ]);
    }

    /**
     * PUT /api/v1/grades/{id}
     * Modifier une note
     */
    public function update(Request $request, Grade $grade)
    {
        $validated = $request->validate([
            'score' => 'required|numeric|min:0',
            'total_score' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string',
        ]);

        $grade->update($validated);

        return response()->json([
            'message' => 'Note mise à jour',
            'data' => $grade,
            'percentage' => $grade->percentage,
            'status' => $grade->grade_status,
        ]);
    }

    /**
     * DELETE /api/v1/grades/{id}
     * Supprimer une note
     */
    public function destroy(Grade $grade)
    {
        $studentId = $grade->student_id;
        $grade->delete();

        return response()->json([
            'message' => 'Note supprimée',
            'student_id' => $studentId
        ]);
    }

    /**
     * GET /api/v1/grades/student/{studentId}
     * Récupérer toutes les notes d'un élève
     */
    public function studentGrades($studentId)
    {
        $student = Student::findOrFail($studentId);
        $grades = $student->grades()->with(['subject', 'teacher'])->orderBy('created_at', 'desc')->get();

        $average = $student->average;

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->full_name,
                'average' => $average . '%',
            ],
            'grades' => $grades->map(function($grade) {
                return [
                    'id' => $grade->id,
                    'subject' => $grade->subject->name,
                    'type' => $grade->type_translation,
                    'display_score' => $grade->display_score,
                    'percentage' => $grade->percentage . '%',
                    'status' => $grade->grade_status,
                    'period' => $grade->period,
                    'created_at' => $grade->created_at,
                ];
            }),
            'by_subject' => $grades->groupBy('subject.name')->map(fn($g) => [
                'total_points' => $g->sum('score'),
                'total_possible' => $g->sum('total_score'),
                'percentage' => round(($g->sum('score') / $g->sum('total_score')) * 100, 2) . '%',
                'count' => $g->count(),
            ])
        ]);
    }

    /**
     * GET /api/v1/grades/subject/{subjectId}
     * Carnet de notes pour une matière
     */
    public function subjectGradebook($subjectId)
    {
        $subject = Subject::findOrFail($subjectId);
        $grades = Grade::where('subject_id', $subjectId)->with(['student', 'teacher'])->get();

        $gradebook = $grades->groupBy('student_id')->map(function($studentGrades) {
            $student = $studentGrades->first()->student;
            $totalPoints = $studentGrades->sum('score');
            $totalPossible = $studentGrades->sum('total_score');
            
            return [
                'student_id' => $student->id,
                'student_name' => $student->full_name,
                'total_score' => "$totalPoints/$totalPossible",
                'percentage' => round(($totalPoints / $totalPossible) * 100, 2) . '%',
                'grades_count' => $studentGrades->count(),
            ];
        });

        return response()->json([
            'subject' => $subject->name,
            'gradebook' => $gradebook
        ]);
    }

    /**
     * POST /api/v1/grades/bulk
     * Enregistrer plusieurs notes à la fois
     */
public function bulkStore(Request $request)
{
    $validated = $request->validate([
        'subject_id' => 'required|exists:subjects,id',
        'type' => 'required|in:DEVOIR,CONTROLE,EXAMEN,EXAM,ASSIGNMENT,CLASS_WORK,PROJECT',
        'graded_at' => 'required|date',
        'max_value' => 'required|numeric|min:0.01',

        'grades' => 'required|array|min:1',
        'grades.*.student_id' => 'required|exists:students,id',
        'grades.*.value' => 'nullable|numeric|min:0',
    ]);

    // ✅ récupérer teacher_id (si user est un teacher)
    $teacherId = optional(auth()->user()->teacher)->id;

    // fallback si tu n'as pas teacher lié (dev)
    if (!$teacherId) {
        $teacherId = 1; // ou null si ta DB autorise null
    }

    // ✅ Convertir type (si besoin)
    $typeMap = [
        'DEVOIR' => 'ASSIGNMENT',
        'CONTROLE' => 'CLASS_WORK',
        'EXAMEN' => 'EXAM',
    ];
    $type = $typeMap[$validated['type']] ?? $validated['type'];

    // ✅ Déduire la période (T1/T2/T3) à partir de la date (tu peux changer)
    $month = (int) date('m', strtotime($validated['graded_at']));
    $period = ($month <= 4) ? 'T2' : (($month <= 8) ? 'T3' : 'T1'); 
    // (simple) -> adapte à ton calendrier si besoin

    $saved = [];
    foreach ($validated['grades'] as $g) {
        // si vide => on skip (permet saisie partielle)
        if ($g['value'] === null || $g['value'] === '') continue;

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $g['student_id'],
                'subject_id' => $validated['subject_id'],
                'type' => $type,
                'period' => $period,
                // si tu as une colonne date dans grades, utilise-la.
                // sinon on ne peut pas distinguer 2 contrôles même période…
            ],
            [
                'score' => $g['value'],
                'total_score' => $validated['max_value'],
                'teacher_id' => $teacherId,
                'remarks' => null,
            ]
        );

        $saved[] = $grade;
    }

    return response()->json([
        'message' => count($saved) . ' note(s) enregistrée(s)',
        'count' => count($saved),
        'data' => $saved,
    ], 201);
}


    /**
     * GET /api/v1/grades/student/{studentId}/report
     * Rapport complet d'un élève
     */
    public function studentReport($studentId)
    {
        $student = Student::findOrFail($studentId);
        $grades = $student->grades()->with(['subject', 'teacher'])->get();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->full_name,
                'general_average' => $student->average . '%',
            ],
            'grades' => $grades->groupBy('period')->map(function($periodGrades) {
                return $periodGrades->groupBy('subject.name')->map(fn($g) => [
                    'total_score' => round($g->sum('score'), 2) . '/' . round($g->sum('total_score'), 2),
                    'percentage' => round(($g->sum('score') / $g->sum('total_score')) * 100, 2) . '%',
                ]);
            })
        ]);
    }
}
