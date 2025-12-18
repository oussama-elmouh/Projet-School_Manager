<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['ADMIN', 'DIRECTOR']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:subjects',
            'description' => 'nullable|string',
            'coefficient' => 'required|integer|min:1',
            'level' => 'required|string|max:255',
        ];
    }
}
