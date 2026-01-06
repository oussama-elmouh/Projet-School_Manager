import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teacher/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("teacher/dashboard error:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Chargement...</div>;
  if (!data) return <div className="text-red-500">Erreur dashboard professeur</div>;

  const teacher = data.teacher;
  const classes = data.classes || [];

  const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tableau de bord TEACHER</h1>
          <p className="text-gray-600 mt-1">
            Bienvenue <span className="font-semibold">{teacher?.name}</span>
          </p>
          <p className="text-sm text-gray-500">{teacher?.email}</p>
        </div>

        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 border border-indigo-100">
          👨‍🏫 Professeur
        </span>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mes classes" value={classes.length} />
        <StatCard title="Total élèves" value={totalStudents} />
        <StatCard title="Niveaux" value={new Set(classes.map((c) => c.level).filter(Boolean)).size} />
        <StatCard title="Matières" value={new Set(classes.map((c) => c.subject).filter(Boolean)).size} />
      </div>

      {/* Classes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">🏫 Mes classes</h2>

        {classes.length === 0 ? (
          <div className="bg-white rounded-lg border p-4 text-gray-600">
            Aucune classe assignée.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow border p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-600">Niveau : {c.level}</p>
                  <p className="text-sm text-gray-600">Matière : {c.subject}</p>
                  <p className="text-sm text-gray-600">Élèves : {c.students?.length || 0}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/teacher/classes/${c.id}/students`}
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    Voir les élèves
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <h2 className="text-sm font-medium text-gray-500">{title}</h2>
      <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
    </div>
  );
}
