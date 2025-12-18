<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCantineMenuRequest;
use App\Http\Requests\StoreCantineRegistrationRequest;
use App\Http\Resources\CantineMenuResource;
use App\Http\Resources\CantineRegistrationResource;
use App\Models\CantineMenu;
use App\Models\CantineRegistration;
use Illuminate\Http\Request;

class CantineController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function indexMenus(Request $request)
    {
        $query = CantineMenu::query();

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('menu_date', [$request->from_date, $request->to_date]);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $menus = $query->orderBy('menu_date')->paginate($request->get('per_page', 15));

        return CantineMenuResource::collection($menus);
    }

    public function storeMenu(StoreCantineMenuRequest $request)
    {
        $menu = CantineMenu::create($request->validated());

        return response()->json(
            new CantineMenuResource($menu),
            201
        );
    }

    public function showMenu(CantineMenu $menu)
    {
        return new CantineMenuResource($menu);
    }

    public function updateMenu(Request $request, CantineMenu $menu)
    {
        $validated = $request->validate([
            'description' => 'sometimes|string|min:10',
            'price' => 'sometimes|numeric|min:0.01',
            'quantity_available' => 'sometimes|integer|min:1',
        ]);

        $menu->update($validated);

        return new CantineMenuResource($menu);
    }

    public function destroyMenu(CantineMenu $menu)
    {
        $menu->delete();

        return response()->json([
            'message' => 'Menu supprimé avec succès',
        ]);
    }

    public function indexRegistrations(Request $request)
    {
        $query = CantineRegistration::with(['student', 'menu']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('menu_id')) {
            $query->where('menu_id', $request->menu_id);
        }

        $registrations = $query->paginate($request->get('per_page', 15));

        return CantineRegistrationResource::collection($registrations);
    }

    public function storeRegistration(StoreCantineRegistrationRequest $request)
    {
        $menu = CantineMenu::find($request->menu_id);

        if ($menu->quantity_available <= 0) {
            return response()->json([
                'message' => 'Ce menu n\'est plus disponible.',
            ], 422);
        }

        $exists = CantineRegistration::where('student_id', $request->student_id)
            ->where('menu_id', $request->menu_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Cet élève est déjà inscrit à ce menu.',
            ], 422);
        }

        $registration = CantineRegistration::create([
            ...$request->validated(),
            'status' => 'REGISTERED',
        ]);

        $menu->decrement('quantity_available');

        return response()->json(
            new CantineRegistrationResource($registration->load(['student', 'menu'])),
            201
        );
    }

    public function cancelRegistration(CantineRegistration $registration)
    {
        if ($registration->status !== 'REGISTERED') {
            return response()->json([
                'message' => 'Seules les inscriptions en attente peuvent être annulées.',
            ], 422);
        }

        $registration->update(['status' => 'CANCELLED']);

        $registration->menu->increment('quantity_available');

        return response()->json([
            'message' => 'Inscription annulée avec succès',
        ]);
    }
}
