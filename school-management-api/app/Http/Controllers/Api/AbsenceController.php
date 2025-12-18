<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\JustifyAbsenceRequest;
use App\Http\Resources\AbsenceResource;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Absence::with(['student', 'recordedBy']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('absence_date', [$request->from_date, $request->to_date]);
        }

        if ($request->has('justified')) {
            $query->where('justified', $request->justified === 'true');
        }

        $absences = $query->paginate($request->get('per_page', 15));

        return AbsenceResource::collection($absences);
    }

    public function store(StoreAbsenceRequest $request)
    {
        $exists = Absence::where('student_id', $request->student_id)
            ->where('absence_date', $request->absence_date)
            ->where('period', $request->period)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Cette absence existe déjà.',
            ], 422);
        }

        $absence = Absence::create([
            ...$request->validated(),
            'recorded_by' => auth()->id(),
        ]);

        return response()->json(
            new AbsenceResource($absence->load(['student', 'recordedBy'])),
            201
        );
    }

    public function show(Absence $absence)
    {
        return new AbsenceResource($absence->load(['student', 'recordedBy']));
    }

    public function destroy(Absence $absence)
    {
        $absence->delete();

        return response()->json([
            'message' => 'Absence supprimée avec succès',
        ], 200);
    }

    public function justify(JustifyAbsenceRequest $request, Absence $absence)
    {
        $absence->update([
            'justified' => $request->justified,
            'justification' => $request->justification ?? null,
        ]);

        return new AbsenceResource($absence->load(['student', 'recordedBy']));
    }

    public function studentReport(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $query = Absence::where('student_id', $validated['student_id']);

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('absence_date', [$validated['from_date'], $validated['to_date']]);
        }

        $absences = $query->get();
        $total = $absences->count();
        $justified = $absences->where('justified', true)->count();
        $unjustified = $total - $justified;

        return response()->json([
            'total_absences' => $total,
            'justified' => $justified,
            'unjustified' => $unjustified,
            'absences' => AbsenceResource::collection($absences),
        ]);
    }
}
