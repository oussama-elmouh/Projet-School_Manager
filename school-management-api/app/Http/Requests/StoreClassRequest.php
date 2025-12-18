<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:100',
            'principal_teacher_id' => 'nullable|exists:users,id',
            'academic_year' => 'required|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la classe est obligatoire.',
            'level.required' => 'Le niveau est obligatoire.',
            'capacity.required' => 'La capacité est obligatoire.',
            'academic_year.required' => 'L\'année scolaire est obligatoire.',
        ];
    }
}
