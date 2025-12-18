<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDisciplineRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['TEACHER', 'ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'type' => 'required|in:SANCTION,REWARD,WARNING',
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'record_date' => 'required|date|before_or_equal:today',
        ];
    }
}
