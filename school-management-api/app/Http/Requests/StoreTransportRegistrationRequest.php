<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransportRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'line_id' => 'required|exists:transport_lines,id',
            'pickup_point' => 'nullable|string|max:255',
        ];
    }
}
