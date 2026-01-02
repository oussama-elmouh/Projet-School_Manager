<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'matricule' => $this->matricule,
            'email' => $this->email,
            'specialization' => $this->specialization,
            'phone' => $this->phone,
            'bio' => $this->bio,
            'status' => $this->status,
            'full_name' => $this->full_name,
            'user' => new UserResource($this->whenLoaded('user')),
            'classes' => ClassTeacherResource::collection($this->whenLoaded('classes')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
