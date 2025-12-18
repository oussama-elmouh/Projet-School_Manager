<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR', 'PARENT']);
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:CHEQUE,BANK_TRANSFER,CASH,CARD',
            'payment_reference' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
        ];
    }
}
