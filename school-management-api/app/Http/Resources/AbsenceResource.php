<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'absence_date' => $this->absence_date->format('Y-m-d'),
            'period' => $this->period,
            'reason' => $this->reason,
            'justified' => $this->justified,
            'justification' => $this->justification,
            'recorded_by' => new UserResource($this->whenLoaded('recordedBy')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
