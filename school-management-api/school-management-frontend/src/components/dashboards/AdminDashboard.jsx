// src/components/dashboards/AdminDashboard.jsx
export default function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-sm font-medium text-slate-500">
          Nombre de classes
        </h2>
        <p className="text-2xl font-bold mt-2">12</p>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-sm font-medium text-slate-500">
          Nombre d’élèves
        </h2>
        <p className="text-2xl font-bold mt-2">320</p>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-sm font-medium text-slate-500">
          Factures en attente
        </h2>
        <p className="text-2xl font-bold mt-2">45</p>
      </div>
    </div>
  );
}
