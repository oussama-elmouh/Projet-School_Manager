<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransportRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'line' => new TransportLineResource($this->whenLoaded('line')),
            'status' => $this->status,
            'pickup_point' => $this->pickup_point,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
