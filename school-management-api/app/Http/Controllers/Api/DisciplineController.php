<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDisciplineRecordRequest;
use App\Http\Resources\DisciplineRecordResource;
use App\Models\DisciplineRecord;
use Illuminate\Http\Request;

class DisciplineController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = DisciplineRecord::with(['student', 'recordedBy']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $records = $query->orderBy('record_date', 'desc')->paginate($request->get('per_page', 15));

        return DisciplineRecordResource::collection($records);
    }

    public function store(StoreDisciplineRecordRequest $request)
    {
        $record = DisciplineRecord::create([
            ...$request->validated(),
            'recorded_by' => auth()->id(),
        ]);

        return response()->json(
            new DisciplineRecordResource($record->load(['student', 'recordedBy'])),
            201
        );
    }

    public function show(DisciplineRecord $record)
    {
        return new DisciplineRecordResource($record->load(['student', 'recordedBy']));
    }

    public function destroy(DisciplineRecord $record)
    {
        $record->delete();

        return response()->json([
            'message' => 'Enregistrement supprimé avec succès',
        ]);
    }

    public function studentReport(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $records = DisciplineRecord::where('student_id', $validated['student_id'])
            ->with(['recordedBy'])
            ->get();

        $sanctions = $records->where('type', 'SANCTION')->count();
        $rewards = $records->where('type', 'REWARD')->count();
        $warnings = $records->where('type', 'WARNING')->count();

        return response()->json([
            'student_id' => $validated['student_id'],
            'sanctions' => $sanctions,
            'rewards' => $rewards,
            'warnings' => $warnings,
            'records' => DisciplineRecordResource::collection($records),
        ]);
    }
}
