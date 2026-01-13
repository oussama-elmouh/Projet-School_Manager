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
        'user_id' => 'nullable|exists:users,id',
        'email' => 'nullable|email|unique:users,email',

        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'date_of_birth' => 'required|date',
        'gender' => 'required|in:M,F',

        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string|max:255',
        'medical_info' => 'nullable|string',

        // important: selon ton modèle, c'est class_id ou current_class_id
        'class_id' => 'required|exists:school_classes,id',
        
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
