<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'class' => new ClassResource($this->whenLoaded('class')),
            'academic_year' => $this->academic_year,
            'status' => $this->status,
            'tuition_amount' => $this->tuition_amount,
            'amount_paid' => $this->amount_paid,
            'remaining_amount' => $this->remaining_amount,
            'is_paid' => $this->is_paid(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
