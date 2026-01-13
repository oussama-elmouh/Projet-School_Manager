<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:CASH,CHEQUE,BANK_TRANSFER',
            'payment_reference' => 'nullable|string|max:255',
        ];
    }
}
