<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Message::where('recipient_id', auth()->id())
            ->with(['sender', 'recipient', 'class']);

        if ($request->has('unread')) {
            $query->where('is_read', false);
        }

        $messages = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return MessageResource::collection($messages);
    }

    public function sent(Request $request)
    {
        $messages = Message::where('sender_id', auth()->id())
            ->with(['sender', 'recipient', 'class'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request)
    {
        if (!$request->recipient_id && !$request->class_id) {
            return response()->json([
                'message' => 'Veuillez spécifier un destinataire ou une classe.',
            ], 422);
        }

        $message = Message::create([
            ...$request->validated(),
            'sender_id' => auth()->id(),
        ]);

        return response()->json(
            new MessageResource($message->load(['sender', 'recipient', 'class'])),
            201
        );
    }

    public function show(Message $message)
    {
        if ($message->recipient_id === auth()->id() && !$message->is_read) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return new MessageResource($message->load(['sender', 'recipient', 'class']));
    }

    public function destroy(Message $message)
    {
        if ($message->sender_id !== auth()->id()) {
            return response()->json([
                'message' => 'Non autorisé',
            ], 403);
        }

        $message->delete();

        return response()->json([
            'message' => 'Message supprimé avec succès',
        ], 200);
    }

    public function markAsRead(Message $message)
    {
        if ($message->recipient_id !== auth()->id()) {
            return response()->json([
                'message' => 'Non autorisé',
            ], 403);
        }

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Message marqué comme lu',
        ]);
    }

    public function unreadCount()
    {
        $count = Message::where('recipient_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }
}
