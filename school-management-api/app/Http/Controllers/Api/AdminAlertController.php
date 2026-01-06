<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\SchoolClass;
use App\Models\Absence;

class AdminAlertController extends Controller
{
    public function index()
    {
        return response()->json([
            'late_invoices' => Invoice::where('status', 'OVERDUE')->count(),
            'full_classes' => SchoolClass::whereRaw('capacity <= (
                SELECT COUNT(*) FROM students WHERE students.class_id = school_classes.id
            )')->count(),
            'unjustified_absences' => Absence::where('justified', false)->count(),
        ]);
    }
}
