<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => $this->user_id === '' ? null : $this->user_id,
        ]);
    }

    public function rules()
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'email' => 'required|email|unique:users,email|unique:teachers,email',
            'specialization' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'status' => 'required|in:ACTIVE,INACTIVE',

            'classes' => 'nullable|array',
            'classes.*.class_id' => 'required_with:classes|exists:school_classes,id',
            'classes.*.subject' => 'required_with:classes|string|max:100',
        ];
    }
}
