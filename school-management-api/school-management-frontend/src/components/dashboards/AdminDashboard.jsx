import { useEffect, useState } from "react";
import api from "../../api/client";
import AdminAlerts from "./AdminAlerts";
import AdminNotifications from "../notifications/AdminNotifications";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Chargement du tableau de bord...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Erreur chargement dashboard</div>;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
           
        </h1>
        <AdminNotifications />
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Classes" value={stats.classes} />
        <StatCard title="Élèves" value={stats.students} />
        <StatCard title="Professeurs" value={stats.teachers} />
        <StatCard title="Factures en attente" value={stats.pending_invoices} />
      </div>

      {/* ALERTES */}
      <AdminAlerts />

      {/* ACTIONS RAPIDES (TAILWIND) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          ⚡ Actions rapides
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon="🏫"
            title="Classes"
            description="Gérer les classes"
            to="/classes"
            color="blue"
          />

          <QuickAction
            icon="🎓"
            title="Élèves"
            description="Gérer les élèves"
            to="/students"
            color="green"
          />

          <QuickAction
            icon="👨‍🏫"
            title="Professeurs"
            description="Gérer les professeurs"
            to="/teachers"
            color="purple"
          />

          <QuickAction
            icon="💳"
            title="Factures"
            description="Suivi des paiements"
            to="/invoices"
            color="yellow"
          />
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-medium text-gray-500">{title}</h2>
      <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
    </div>
  );
}

function QuickAction({ icon, title, description, to, color }) {
  const colorMap = {
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-800",
    green: "bg-green-50 hover:bg-green-100 text-green-800",
    purple: "bg-purple-50 hover:bg-purple-100 text-purple-800",
    yellow: "bg-yellow-50 hover:bg-yellow-100 text-yellow-800",
  };

  return (
    <a
      href={to}
      className={`rounded-lg border p-4 transition-all cursor-pointer hover:shadow-md ${colorMap[color]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </a>
  );
}
