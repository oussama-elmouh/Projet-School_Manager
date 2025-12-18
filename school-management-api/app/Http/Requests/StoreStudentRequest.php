<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'ADMIN';
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id|unique:students',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'nullable|in:M,F,OTHER',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'medical_info' => 'nullable|string',
            'class_id' => 'nullable|exists:school_classes,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'L\'utilisateur est obligatoire.',
            'user_id.unique' => 'Cet utilisateur est déjà un élève.',
            'first_name.required' => 'Le prénom est obligatoire.',
            'last_name.required' => 'Le nom est obligatoire.',
            'date_of_birth.required' => 'La date de naissance est obligatoire.',
            'date_of_birth.before' => 'La date de naissance doit être dans le passé.',
        ];
    }
}
