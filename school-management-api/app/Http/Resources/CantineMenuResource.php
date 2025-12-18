<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CantineMenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'menu_date' => $this->menu_date->format('Y-m-d'),
            'type' => $this->type,
            'description' => $this->description,
            'price' => $this->price,
            'quantity_available' => $this->quantity_available,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
