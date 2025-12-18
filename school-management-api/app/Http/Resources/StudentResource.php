<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'matricule' => $this->matricule,
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'date_of_birth' => $this->date_of_birth->format('Y-m-d'),
            'age' => $this->age,
            'gender' => $this->gender,
            'address' => $this->address,
            'phone' => $this->phone,
            'medical_info' => $this->medical_info,
            'class' => new ClassResource($this->whenLoaded('currentClass')),
            'parents' => ParentResource::collection($this->whenLoaded('parents')),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
