<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DisciplineRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'record_date' => $this->record_date->format('Y-m-d'),
            'recorded_by' => new UserResource($this->whenLoaded('recordedBy')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
