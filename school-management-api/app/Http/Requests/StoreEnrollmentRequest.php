<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:school_classes,id',
            'academic_year' => 'required|string|max:20',
            'tuition_amount' => 'nullable|numeric|min:0',
        ];
    }
}
