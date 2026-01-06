import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";

export default function TeacherClassStudentsPage() {
  const { classId } = useParams();
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    setLoading(true);

    api.get("/teacher/dashboard")
      .then((res) => {
        const cls = (res.data.classes || []).find((c) => String(c.id) === String(classId));
        setClassInfo(cls || null);
        setStudents(cls?.students || []);
      })
      .catch((err) => {
        console.error("students page error:", err);
        setClassInfo(null);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="text-gray-500">Chargement des élèves...</div>;

  if (!classInfo) {
    return (
      <div className="space-y-3">
        <p className="text-red-500">Classe introuvable (ou pas autorisée).</p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Élèves - {classInfo.name}
          </h1>
          <p className="text-gray-600">
            Niveau : {classInfo.level} • Matière : {classInfo.subject}
          </p>
        </div>

        <Link
          to="/dashboard"
          className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          ← Retour
        </Link>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Liste des élèves</h2>
          <span className="text-sm text-gray-500">{students.length} élève(s)</span>
        </div>

        {students.length === 0 ? (
          <div className="p-4 text-gray-600">Aucun élève dans cette classe.</div>
        ) : (
          <ul className="divide-y">
            {students.map((s) => (
              <li key={s.id} className="p-4">
                <p className="font-medium text-gray-800">{s.full_name}</p>
                <p className="text-sm text-gray-500">Matricule : {s.matricule}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
