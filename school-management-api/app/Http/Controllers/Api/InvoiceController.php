<?php
// app/Http/Controllers/Api/InvoiceController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\PayInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // -------------------------
    // LIST (filters)
    // -------------------------
    public function index(Request $request)
    {
        $query = Invoice::with('student');

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('billing_month')) {
            $query->where('billing_month', $request->billing_month); // ✅ NEW
        }

        $invoices = $query->orderByDesc('id')->paginate($request->get('per_page', 15));

        return InvoiceResource::collection($invoices);
    }

    // -------------------------
    // CREATE
    // -------------------------
    public function store(StoreInvoiceRequest $request)
    {
        // ✅ plus sûr que Invoice::count() (évite collisions)
        $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));

        $invoice = Invoice::create([
            ...$request->validated(),
            'invoice_number' => $invoiceNumber,
            'status' => 'PENDING',
        ]);

        return response()->json(new InvoiceResource($invoice->load('student')), 201);
    }

    public function show(Invoice $invoice)
    {
        return new InvoiceResource($invoice->load('student'));
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->status === 'PAID') {
            return response()->json(['message' => 'Impossible de supprimer une facture payée.'], 422);
        }

        $invoice->delete();

        return response()->json(['message' => 'Facture supprimée avec succès'], 200);
    }

    // -------------------------
    // PAY
    // -------------------------
    public function pay(PayInvoiceRequest $request, Invoice $invoice)
    {
        if ($invoice->status === 'PAID') {
            return response()->json(['message' => 'Cette facture est déjà payée.'], 422);
        }

        $invoice->update([
            'status' => 'PAID',
            'paid_date' => now(),
            'payment_method' => $request->payment_method,
            'payment_reference' => $request->payment_reference,
        ]);

        return response()->json([
            'message' => 'Facture payée avec succès',
            'invoice' => new InvoiceResource($invoice->load('student')),
        ], 200);
    }

    // -------------------------
    // REPORT student (keep yours)
    // -------------------------
    public function studentReport(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $invoices = Invoice::where('student_id', $validated['student_id'])
            ->with('student')
            ->get();

        $totalDue = $invoices->sum('amount');
        $totalPaid = $invoices->where('status', 'PAID')->sum('amount');
        $remaining = $totalDue - $totalPaid;

        return response()->json([
            'student_id' => (int)$validated['student_id'],
            'total_due' => $totalDue,
            'total_paid' => $totalPaid,
            'remaining' => $remaining,
            'invoices' => InvoiceResource::collection($invoices),
        ]);
    }

    // ==========================================================
    // ✅ NEW: Monthly GRID (Students × Months)
    // GET /invoices/monthly-grid?class_id=1&from=2025-09&to=2026-06&type=TUITION
    // ==========================================================
    public function monthlyGrid(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'from' => 'required|date_format:Y-m',
            'to' => 'required|date_format:Y-m',
            'type' => 'nullable|in:TUITION,CANTINE,TRANSPORT,REGISTRATION,OTHER',
        ]);

        $type = $validated['type'] ?? 'TUITION';

        $students = Student::where('class_id', $validated['class_id'])
            ->orderBy('id')
            ->get(['id', 'first_name', 'last_name', 'class_id']);

        $start = Carbon::createFromFormat('Y-m', $validated['from'])->startOfMonth();
        $end = Carbon::createFromFormat('Y-m', $validated['to'])->startOfMonth();

        $months = [];
        $cursor = $start->copy();
        while ($cursor <= $end) {
            $months[] = $cursor->format('Y-m');
            $cursor->addMonth();
        }

        $invoices = Invoice::whereIn('student_id', $students->pluck('id'))
            ->where('type', $type)
            ->whereIn('billing_month', $months)
            ->get();

        $index = [];
        foreach ($invoices as $inv) {
            $index[$inv->student_id][$inv->billing_month] = $inv;
        }

        $rows = $students->map(function ($s) use ($months, $index) {
            $name = trim(($s->first_name ?? '') . ' ' . ($s->last_name ?? ''));

            $cells = [];
            foreach ($months as $m) {
                $inv = $index[$s->id][$m] ?? null;
                $cells[$m] = $inv ? [
                    'invoice_id' => $inv->id,
                    'status' => $inv->status,
                    'amount' => (string)$inv->amount,
                    'due_date' => $inv->due_date?->format('Y-m-d'),
                    'paid_date' => $inv->paid_date?->format('Y-m-d'),
                    'payment_method' => $inv->payment_method,
                    'payment_reference' => $inv->payment_reference,
                ] : null;
            }

            return [
                'student' => [
                    'id' => $s->id,
                    'name' => $name ?: ("Élève #" . $s->id),
                ],
                'months' => $cells,
            ];
        });

        return response()->json([
            'class_id' => (int)$validated['class_id'],
            'type' => $type,
            'months' => $months,
            'rows' => $rows,
        ]);
    }

    // ==========================================================
    // ✅ NEW: Monthly GENERATE (create missing invoices for month)
    // POST /invoices/monthly-generate
    // body: {class_id, billing_month, type, amount, due_date, notes?}
    // ==========================================================
    public function monthlyGenerate(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'billing_month' => 'required|date_format:Y-m',
            'type' => 'required|in:TUITION,CANTINE,TRANSPORT,REGISTRATION,OTHER',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $students = Student::where('class_id', $validated['class_id'])->get(['id']);

        $existingStudentIds = Invoice::whereIn('student_id', $students->pluck('id'))
            ->where('type', $validated['type'])
            ->where('billing_month', $validated['billing_month'])
            ->pluck('student_id')
            ->toArray();

        $createdCount = 0;

        foreach ($students as $s) {
            if (in_array($s->id, $existingStudentIds)) continue;

            $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));

            Invoice::create([
                'student_id' => $s->id,
                'invoice_number' => $invoiceNumber,
                'type' => $validated['type'],
                'billing_month' => $validated['billing_month'],
                'amount' => $validated['amount'],
                'status' => 'PENDING',
                'due_date' => $validated['due_date'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $createdCount++;
        }

        return response()->json([
            'message' => 'Factures générées',
            'created_count' => $createdCount,
        ], 200);
    }
}
