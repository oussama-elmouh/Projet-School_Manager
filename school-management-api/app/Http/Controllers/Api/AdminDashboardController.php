<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Invoice;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'classes' => SchoolClass::count(),
            'students' => Student::count(),
            'teachers' => Teacher::count(),
            'pending_invoices' => Invoice::where('status', 'PENDING')->count(),
        ]);
    }
}
