<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // ✅ Autoriser modification
        return true;  // ← PAS false
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $teacherId = $this->route('teacher')?->id;

        return [
            'user_id' => 'sometimes|exists:users,id',
            'email' => 'sometimes|email|unique:teachers,email,' . $teacherId,
            'specialization' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ];
    }

    public function messages()
    {
        return [
            'email.unique' => 'Cet email est déjà utilisé',
            'email.email' => 'Email invalide',
            'user_id.exists' => 'Utilisateur inexistant',
        ];
    }
}
