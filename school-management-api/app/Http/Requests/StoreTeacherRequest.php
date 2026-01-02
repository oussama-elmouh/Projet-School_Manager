<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'email' => 'required|email|unique:teachers',
            'specialization' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'classes' => 'nullable|array',
            'classes.*.class_id' => 'required|exists:school_classes,id',
            'classes.*.subject' => 'required|string|max:100',
        ];
    }
}
