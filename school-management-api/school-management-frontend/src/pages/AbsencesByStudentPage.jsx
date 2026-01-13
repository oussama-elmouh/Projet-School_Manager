import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

export default function AbsencesByStudentPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAbsences, setLoadingAbsences] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    student_id: "",
    absence_date: "",
    period: "FULL_DAY",
    reason: "",
    justified: false,
    justification: "",
  });

  const studentLabel = (st) =>
    st.full_name ||
    `${st.first_name || ""} ${st.last_name || ""}`.trim() ||
    (st.user?.name ? st.user.name : "") ||
    `#${st.id}`;

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/students?per_page=200");
      const list = res.data?.data || res.data || [];
      setStudents(list);

      if (list.length > 0) {
        const firstId = String(list[0].id);
        setSelectedStudentId(firstId);
        setForm((p) => ({ ...p, student_id: firstId }));
      }
    } catch (e) {
      console.error(e);
      setError("Erreur lors du chargement des élèves.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsencesForStudent = async (studentId) => {
    if (!studentId) return;
    setLoadingAbsences(true);
    setError("");
    try {
      const res = await api.get(`/absences/student/${studentId}`);
      const paginator = res.data?.absences;
      const list = paginator?.data || paginator || [];
      setAbsences(list);

      setForm((p) => ({ ...p, student_id: studentId }));
    } catch (e) {
      console.error(e);
      setError("Erreur lors du chargement des absences.");
      setAbsences([]);
    } finally {
      setLoadingAbsences(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) fetchAbsencesForStudent(selectedStudentId);
  }, [selectedStudentId]);

  // ✅ filtre élèves (nom / matricule / email)
  const filteredStudents = useMemo(() => {
    const s = studentSearch.trim().toLowerCase();
    if (!s) return students;

    return students.filter((st) => {
      const fullName = studentLabel(st).toLowerCase();
      const matricule = (st.matricule || "").toLowerCase();
      const email = (st.user?.email || st.email || "").toLowerCase();

      return fullName.includes(s) || matricule.includes(s) || email.includes(s);
    });
  }, [students, studentSearch]);

  // ✅ si l'élève sélectionné n’est pas dans la liste filtrée, on garde quand même la sélection
  const studentsForSelect = useMemo(() => {
    if (!selectedStudentId) return filteredStudents;
    const exists = filteredStudents.some((s) => String(s.id) === String(selectedStudentId));
    if (exists) return filteredStudents;

    const selected = students.find((s) => String(s.id) === String(selectedStudentId));
    return selected ? [selected, ...filteredStudents] : filteredStudents;
  }, [filteredStudents, selectedStudentId, students]);

  const resetForm = () => {
    setEditingId(null);
    setError("");
    setForm({
      student_id: selectedStudentId || "",
      absence_date: "",
      period: "FULL_DAY",
      reason: "",
      justified: false,
      justification: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.student_id) {
      setError("Veuillez sélectionner un élève.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint = editingId ? `/absences/${editingId}` : "/absences";
      const method = editingId ? api.put : api.post;

      const payload = {
        student_id: form.student_id,
        absence_date: form.absence_date,
        period: form.period,
        reason: form.reason || null,
        justified: !!form.justified,
        justification: form.justification || null,
      };

      const res = await method(endpoint, payload);
      const savedAbsence = res.data?.absence || res.data?.data || res.data;

      if (editingId) {
        setAbsences((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...savedAbsence } : a))
        );
        setSuccessModal({
          isOpen: true,
          title: "✅ Absence modifiée",
          message: "L’absence a été mise à jour.",
        });
      } else {
        // updateOrCreate => peut renvoyer une absence existante
        setAbsences((prev) => {
          const exists = prev.some((a) => a.id === savedAbsence.id);
          if (exists) return prev.map((a) => (a.id === savedAbsence.id ? savedAbsence : a));
          return [savedAbsence, ...prev];
        });

        setSuccessModal({
          isOpen: true,
          title: "✅ Absence enregistrée",
          message: "L’absence a été enregistrée.",
        });
      }

      resetForm();
      // ✅ reload pour être sûr (si tu veux)
      // fetchAbsencesForStudent(selectedStudentId);
    } catch (err) {
      console.log(err.response?.data || err);
      const errors = err.response?.data?.errors;
      if (errors) setError(Object.values(errors).flat().join("\n"));
      else setError(err.response?.data?.message || "Erreur serveur.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (absence) => {
    setError("");
    setEditingId(absence.id);
    setForm({
      student_id: String(absence.student_id || selectedStudentId || ""),
      absence_date: absence.absence_date || "",
      period: absence.period || "FULL_DAY",
      reason: absence.reason || "",
      justified: !!absence.justified,
      justification: absence.justification || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette absence ?")) return;
    setError("");
    try {
      await api.delete(`/absences/${id}`);
      setAbsences((prev) => prev.filter((a) => a.id !== id));
      setSuccessModal({
        isOpen: true,
        title: "✅ Absence supprimée",
        message: "L’absence a été supprimée.",
      });
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la suppression.");
    }
  };

  const filteredAbsences = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return absences;

    return absences.filter((a) => {
      return (
        (a.absence_date || "").toLowerCase().includes(s) ||
        (a.period || "").toLowerCase().includes(s) ||
        (a.reason || "").toLowerCase().includes(s) ||
        (a.justification || "").toLowerCase().includes(s) ||
        String(a.justified).toLowerCase().includes(s)
      );
    });
  }, [absences, searchTerm]);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
      />

      <h1 className="text-2xl font-bold mb-6">Gestion des absences (par élève)</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      {/* ✅ SELECT + SEARCH STUDENT */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Élève
        </label>

        <div className="relative max-w-xl mb-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            🔎
          </span>
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule ou email..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full max-w-xl border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {studentsForSelect.map((st) => (
            <option key={st.id} value={st.id}>
              {studentLabel(st)} {st.matricule ? `(${st.matricule})` : ""}
            </option>
          ))}
        </select>

        <div className="text-xs text-gray-500 mt-2">
          {filteredStudents.length} élève(s) affiché(s)
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-md border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              name="absence_date"
              value={form.absence_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Période *</label>
            <select
              name="period"
              value={form.period}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="MORNING">Matin</option>
              <option value="AFTERNOON">Après-midi</option>
              <option value="FULL_DAY">Journée</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="justified"
              type="checkbox"
              name="justified"
              checked={form.justified}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="justified" className="text-sm text-gray-700">
              Justifiée
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: malade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification (preuve / remarque)
            </label>
            <input
              name="justification"
              value={form.justification}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: certificat médical"
            />
          </div>
        </div>

        <div className="mt-4 space-x-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* SEARCH ABSENCES */}
      <div className="mb-4 relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Rechercher (date, motif, période)..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">Absences</div>
          {loadingAbsences ? (
            <div className="text-sm text-gray-500">Chargement…</div>
          ) : (
            <div className="text-sm text-gray-500">{filteredAbsences.length} ligne(s)</div>
          )}
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Justifiée</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredAbsences.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{a.absence_date}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{a.period}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{a.reason || "-"}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      a.justified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {a.justified ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loadingAbsences && filteredAbsences.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            Aucune absence trouvée pour cet élève.
          </div>
        )}
      </div>
    </div>
  );
}
