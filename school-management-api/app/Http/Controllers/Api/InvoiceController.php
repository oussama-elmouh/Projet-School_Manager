<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\PayInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Invoice::with('student');

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $invoices = $query->paginate($request->get('per_page', 15));

        return InvoiceResource::collection($invoices);
    }

    public function store(StoreInvoiceRequest $request)
    {
        $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad(
            Invoice::count() + 1,
            5,
            '0',
            STR_PAD_LEFT
        );

        $invoice = Invoice::create([
            ...$request->validated(),
            'invoice_number' => $invoiceNumber,
            'status' => 'PENDING',
        ]);

        return response()->json(
            new InvoiceResource($invoice->load('student')),
            201
        );
    }

    public function show(Invoice $invoice)
    {
        return new InvoiceResource($invoice->load('student'));
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->status === 'PAID') {
            return response()->json([
                'message' => 'Impossible de supprimer une facture payée.',
            ], 422);
        }

        $invoice->delete();

        return response()->json([
            'message' => 'Facture supprimée avec succès',
        ], 200);
    }

    public function pay(PayInvoiceRequest $request, Invoice $invoice)
    {
        if ($invoice->status === 'PAID') {
            return response()->json([
                'message' => 'Cette facture est déjà payée.',
            ], 422);
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
            'student_id' => $validated['student_id'],
            'total_due' => $totalDue,
            'total_paid' => $totalPaid,
            'remaining' => $remaining,
            'invoices' => InvoiceResource::collection($invoices),
        ]);
    }
}
