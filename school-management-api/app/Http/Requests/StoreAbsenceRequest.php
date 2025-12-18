<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['TEACHER', 'ADMIN']);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'absence_date' => 'required|date|before_or_equal:today',
            'period' => 'required|in:MORNING,AFTERNOON,FULL_DAY',
            'reason' => 'nullable|string',
        ];
    }
}
