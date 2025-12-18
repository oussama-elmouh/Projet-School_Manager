<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'level' => $this->level,
            'capacity' => $this->capacity,
            'academic_year' => $this->academic_year,
            'principal_teacher' => new UserResource($this->whenLoaded('principalTeacher')),
            'students_count' => $this->students_count ?? $this->students()->count(),
            'students' => StudentResource::collection($this->whenLoaded('students')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
