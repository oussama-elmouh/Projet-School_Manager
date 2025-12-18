<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransportLineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'line_name' => 'required|string|max:255|unique:transport_lines',
            'start_point' => 'required|string|max:255',
            'end_point' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.01',
            'capacity' => 'required|integer|min:1|max:100',
        ];
    }
}
