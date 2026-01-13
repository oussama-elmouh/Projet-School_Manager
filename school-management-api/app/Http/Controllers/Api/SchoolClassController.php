<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = SchoolClass::query()
            ->with('principalTeacher')
            ->withCount(['students']); // students_count

        // recherche: ?q=1A
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where('name', 'like', "%{$q}%")
                  ->orWhere('level', 'like', "%{$q}%");
        }

        $classes = $query
            ->orderBy('level')
            ->orderBy('name')
            ->paginate($request->get('per_page', 100));

        // ✅ retourne {data:[...], meta, links} compatible avec ton front
        return response()->json($classes);
    }

    public function show(SchoolClass $schoolClass)
    {
        $schoolClass->load('principalTeacher')
                    ->loadCount(['students']);

        return response()->json($schoolClass);
    }
}
