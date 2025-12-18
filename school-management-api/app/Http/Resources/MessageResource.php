<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender' => new UserResource($this->whenLoaded('sender')),
            'recipient' => new UserResource($this->whenLoaded('recipient')),
            'class' => new ClassResource($this->whenLoaded('class')),
            'subject' => $this->subject,
            'content' => $this->content,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at?->format('Y-m-d H:i:s'),
            'attachment_path' => $this->attachment_path,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
