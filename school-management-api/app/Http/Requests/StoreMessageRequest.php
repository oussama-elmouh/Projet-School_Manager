<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'recipient_id' => 'nullable|exists:users,id',
            'class_id' => 'nullable|exists:school_classes,id',
            'subject' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'attachment_path' => 'nullable|file|max:10240', // 10MB
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_id.exists' => 'Le destinataire n\'existe pas.',
            'class_id.exists' => 'La classe n\'existe pas.',
            'content.min' => 'Le message doit contenir au moins 10 caractères.',
        ];
    }
}
