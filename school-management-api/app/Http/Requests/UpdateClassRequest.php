<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Vérifie que l'utilisateur est ADMIN
        return $this->user()->role === 'ADMIN';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:50',
            'academic_year' => 'required|string|max:20',
            'capacity' => 'required|integer|min:1',
        ];
    }
}
