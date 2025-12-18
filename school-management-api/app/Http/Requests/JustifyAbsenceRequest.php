<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JustifyAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'justified' => 'required|boolean',
            'justification' => 'required_if:justified,true|string|max:500',
        ];
    }
}
