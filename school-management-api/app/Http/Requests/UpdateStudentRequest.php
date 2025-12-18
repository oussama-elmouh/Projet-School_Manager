<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'ADMIN';
    }

    public function rules(): array
    {
        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date|before:today',
            'gender' => 'nullable|in:M,F,OTHER',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'medical_info' => 'nullable|string',
            'class_id' => 'nullable|exists:school_classes,id',
        ];
    }
}
