<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCantineRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'menu_id' => 'required|exists:cantine_menus,id',
        ];
    }
}
