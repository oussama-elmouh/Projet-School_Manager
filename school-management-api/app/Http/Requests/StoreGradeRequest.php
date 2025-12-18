<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'TEACHER';
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'type' => 'required|in:EXAM,ASSIGNMENT,CLASS_WORK,PROJECT',
            'score' => 'required|numeric|min:0',
            'total_score' => 'required|numeric|min:0.01',
            'period' => 'required|in:T1,T2,T3',
            'remarks' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'score.min' => 'La note ne peut pas être négative.',
            'total_score.min' => 'Le total doit être supérieur à 0.',
        ];
    }
}
