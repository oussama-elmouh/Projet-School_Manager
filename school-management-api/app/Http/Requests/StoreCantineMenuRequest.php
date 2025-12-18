<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCantineMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'menu_date' => 'required|date|after_or_equal:today',
            'type' => 'required|in:LUNCH,BREAKFAST,SNACK',
            'description' => 'required|string|min:10',
            'price' => 'required|numeric|min:0.01',
            'quantity_available' => 'required|integer|min:1',
        ];
    }
}
