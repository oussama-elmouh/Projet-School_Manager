<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreParentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'ADMIN';
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id|unique:parent_models',
            'occupation' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
        ];
    }
}
