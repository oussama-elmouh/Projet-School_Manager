<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Enrollment::with(['student', 'class']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        $enrollments = $query->paginate($request->get('per_page', 15));

        return EnrollmentResource::collection($enrollments);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $exists = Enrollment::where('student_id', $request->student_id)
            ->where('class_id', $request->class_id)
            ->where('academic_year', $request->academic_year)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Cet élève est déjà inscrit dans cette classe pour cette année.',
            ], 422);
        }

        $enrollment = Enrollment::create([
            ...$request->validated(),
            'status' => 'ACTIVE',
        ]);

        Student::find($request->student_id)->update([
            'class_id' => $request->class_id,
        ]);

        return response()->json(
            new EnrollmentResource($enrollment->load(['student', 'class'])),201);}

    public function show(Enrollment $enrollment)
    {
        return new EnrollmentResource($enrollment->load(['student', 'class']));
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return response()->json([
            'message' => 'Inscription supprimée avec succès',
        ], 200);
    }

    public function payTuition(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $enrollment->increment('amount_paid', $validated['amount']);

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'enrollment' => new EnrollmentResource($enrollment),
        ], 200);
    }
}
