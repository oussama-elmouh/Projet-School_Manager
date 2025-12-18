<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimeTableRequest;
use App\Http\Resources\TimeTableResource;
use App\Models\TimeTable;
use Illuminate\Http\Request;

class TimeTableController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = TimeTable::with(['class', 'subject', 'teacher']);

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('day')) {
            $query->where('day', $request->day);
        }

        $timeTables = $query->orderBy('day')->orderBy('start_time')->paginate($request->get('per_page', 50));

        return TimeTableResource::collection($timeTables);
    }

    public function store(StoreTimeTableRequest $request)
    {
        $conflict = TimeTable::where('class_id', $request->class_id)
            ->where('day', $request->day)
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                  ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Conflit d\'horaire détecté.',
            ], 422);
        }

        $timeTable = TimeTable::create($request->validated());

        return response()->json(
            new TimeTableResource($timeTable->load(['class', 'subject', 'teacher'])),
            201
        );
    }

    public function show(TimeTable $timeTable)
    {
        return new TimeTableResource($timeTable->load(['class', 'subject', 'teacher']));
    }

    public function update(Request $request, TimeTable $timeTable)
    {
        $validated = $request->validate([
            'day' => 'sometimes|in:MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'classroom' => 'nullable|string|max:255',
        ]);

        $timeTable->update($validated);

        return new TimeTableResource($timeTable->load(['class', 'subject', 'teacher']));
    }

    public function destroy(TimeTable $timeTable)
    {
        $timeTable->delete();

        return response()->json([
            'message' => 'Emploi du temps supprimé avec succès',
        ], 200);
    }

    public function byClass(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'day' => 'nullable|in:MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
        ]);

        $query = TimeTable::where('class_id', $validated['class_id'])
            ->with(['class', 'subject', 'teacher']);

        if ($request->has('day')) {
            $query->where('day', $validated['day']);
        }

        $timeTables = $query->orderBy('start_time')->get();

        return TimeTableResource::collection($timeTables);
    }
}
