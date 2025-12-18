<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreParentRequest;
use App\Http\Requests\UpdateParentRequest;
use App\Http\Resources\ParentResource;
use App\Models\ParentModel;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    /* public function __construct()
    {
        $this->middleware('auth:sanctum');
    } */

    public function index(Request $request)
    {
        $query = ParentModel::with(['user', 'students']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $parents = $query->paginate($request->get('per_page', 15));

        return ParentResource::collection($parents);
    }

    public function store(StoreParentRequest $request)
    {
        $parent = ParentModel::create($request->validated());

        return response()->json(new ParentResource($parent->load(['user', 'students'])),201);
    }

    public function show(ParentModel $parentModel)
    {
        return new ParentResource($parentModel->load(['user', 'students']));
    }

    public function update(UpdateParentRequest $request, ParentModel $parentModel)
    {
        $parentModel->update($request->validated());

        return new ParentResource($parentModel->load(['user', 'students']));
    }

    public function destroy(ParentModel $parentModel)
    {
        $parentModel->delete();

        return response()->json([
            'message' => 'Parent supprimé avec succès',
        ], 200);
    }
}
