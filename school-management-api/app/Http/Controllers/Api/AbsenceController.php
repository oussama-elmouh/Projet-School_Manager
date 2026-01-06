<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Student;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    /**
     * GET /api/absences/student/{studentId}
     * Récupérer les absences d'un élève
     */
    public function getStudentAbsences($studentId)
    {
        $student = Student::findOrFail($studentId);
        
        $absences = $student->absences()
            ->orderBy('absence_date', 'desc')
            ->paginate(20);

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->full_name,
                'absences_count' => $student->absences_count,
                'absences_this_month' => $student->absences_this_month,
                'justified' => $student->justified_absences,
                'unjustified' => $student->unjustified_absences,
            ],
            'absences' => $absences
        ]);
    }

    /**
     * POST /api/absences
     * Enregistrer une absence
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'absence_date' => 'required|date',
            'period' => 'required|in:MORNING,AFTERNOON,FULL_DAY',
            'reason' => 'nullable|string',
            'justified' => 'boolean',
            'justification' => 'nullable|string',
        ]);

        $validated['recorded_by'] = auth()->id(); // Qui enregistre

        $absence = Absence::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'absence_date' => $validated['absence_date'],
                'period' => $validated['period'],
            ],
            $validated
        );

        return response()->json([
            'message' => 'Absence enregistrée',
            'absence' => $absence
        ], 201);
    }

    /**
     * PUT /api/absences/{id}
     * Modifier une absence
     */
    public function update(Request $request, Absence $absence)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
            'justified' => 'boolean',
            'justification' => 'nullable|string',
        ]);

        $absence->update($validated);

        return response()->json([
            'message' => 'Absence mise à jour',
            'absence' => $absence
        ]);
    }

    /**
     * DELETE /api/absences/{id}
     * Supprimer une absence
     */
    public function destroy(Absence $absence)
    {
        $absence->delete();
        return response()->json(['message' => 'Absence supprimée']);
    }

    /**
     * GET /api/absences/class/{classId}/date/{date}
     * Récupérer les absences d'une classe pour un jour donné
     */
    public function getByClassAndDate($classId, $date)
    {
        $students = Student::where('class_id', $classId)->get();

        $absences = Absence::where('absence_date', $date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $data = $students->map(function($student) use ($absences) {
            $absence = $absences->get($student->id);
            return [
                'student_id' => $student->id,
                'name' => $student->full_name,
                'morning' => $absences->filter(fn($a) => $a->student_id === $student->id && $a->period === 'MORNING')->first(),
                'afternoon' => $absences->filter(fn($a) => $a->student_id === $student->id && $a->period === 'AFTERNOON')->first(),
                'full_day' => $absences->filter(fn($a) => $a->student_id === $student->id && $a->period === 'FULL_DAY')->first(),
            ];
        });

        return response()->json([
            'date' => $date,
            'class_id' => $classId,
            'students' => $data
        ]);
    }

    /**
     * GET /api/absences/report/student/{studentId}
     * Rapport d'absences pour un élève
     */
    public function reportStudent($studentId)
    {
        $student = Student::findOrFail($studentId);
        
        $absences = $student->absences()
            ->orderBy('absence_date', 'desc')
            ->get();

        $justified = $absences->where('justified', true)->count();
        $unjustified = $absences->where('justified', false)->count();

        return response()->json([
            'student' => $student->full_name,
            'total' => $absences->count(),
            'justified' => $justified,
            'unjustified' => $unjustified,
            'absences' => $absences
        ]);
    }
}
