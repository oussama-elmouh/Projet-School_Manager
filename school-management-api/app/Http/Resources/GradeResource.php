<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'type' => $this->type,
            'score' => $this->score,
            'total_score' => $this->total_score,
            'percentage' => $this->percentage,
            'period' => $this->period,
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'remarks' => $this->remarks,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
