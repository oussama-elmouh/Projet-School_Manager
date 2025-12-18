<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransportLineRequest;
use App\Http\Requests\StoreTransportRegistrationRequest;
use App\Http\Resources\TransportLineResource;
use App\Http\Resources\TransportRegistrationResource;
use App\Models\TransportLine;
use App\Models\TransportRegistration;
use Illuminate\Http\Request;

class TransportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function indexLines(Request $request)
    {
        $query = TransportLine::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('line_name', 'like', "%{$request->search}%");
        }

        $lines = $query->paginate($request->get('per_page', 15));

        return TransportLineResource::collection($lines);
    }

    public function storeLine(StoreTransportLineRequest $request)
    {
        $line = TransportLine::create([
            ...$request->validated(),
            'status' => 'ACTIVE',
        ]);

        return response()->json(
            new TransportLineResource($line),
            201
        );
    }

    public function showLine(TransportLine $line)
    {
        return new TransportLineResource($line);
    }

    public function updateLine(Request $request, TransportLine $line)
    {
        $validated = $request->validate([
            'line_name' => 'sometimes|string|max:255',
            'start_point' => 'sometimes|string|max:255',
            'end_point' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0.01',
            'capacity' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ]);

        $line->update($validated);

        return new TransportLineResource($line);
    }

    public function destroyLine(TransportLine $line)
    {
        if ($line->registrations()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une ligne avec des inscriptions.',
            ], 422);
        }

        $line->delete();

        return response()->json([
            'message' => 'Ligne supprimée avec succès',
        ]);
    }

    public function indexRegistrations(Request $request)
    {
        $query = TransportRegistration::with(['student', 'line']);

        if ($request->has('line_id')) {
            $query->where('line_id', $request->line_id);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        $registrations = $query->paginate($request->get('per_page', 15));

        return TransportRegistrationResource::collection($registrations);
    }

    public function storeRegistration(StoreTransportRegistrationRequest $request)
    {
        $line = TransportLine::find($request->line_id);

        if ($line->registrations()->count() >= $line->capacity) {
            return response()->json([
                'message' => 'Cette ligne est pleine.',
            ], 422);
        }

        $exists = TransportRegistration::where('student_id', $request->student_id)
            ->where('line_id', $request->line_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Cet élève est déjà inscrit à cette ligne.',
            ], 422);
        }

        $registration = TransportRegistration::create([
            ...$request->validated(),
            'status' => 'ACTIVE',
        ]);

        return response()->json(
            new TransportRegistrationResource($registration->load(['student', 'line'])),
            201
        );
    }

    public function cancelRegistration(TransportRegistration $registration)
    {
        $registration->update(['status' => 'INACTIVE']);

        return response()->json([
            'message' => 'Inscription au transport annulée avec succès',
        ]);
    }
}
