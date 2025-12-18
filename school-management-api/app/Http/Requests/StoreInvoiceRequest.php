<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'type' => 'required|in:TUITION,CANTINE,TRANSPORT,REGISTRATION,OTHER',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date|after:today',
            'notes' => 'nullable|string',
        ];
    }
}
