import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

export default function GradesPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // formulaire "en-tête"
  const [header, setHeader] = useState({
    subject_id: "",
    type: "CONTROLE", // DEVOIR | CONTROLE | EXAMEN (selon ton UI)
    graded_at: new Date().toISOString().slice(0, 10),
    max_value: 20,
  });

  // notes saisies: { [studentId]: number|string }
  const [values, setValues] = useState({});

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const parseList = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.students)) return raw.students;
    if (Array.isArray(raw?.data?.data)) return raw.data.data; // paginate
    if (Array.isArray(raw?.students?.data)) return raw.students.data;
    return [];
  };

  const fetchInit = async () => {
    setLoadingInit(true);
    setError("");
    try {
      const [cRes, sRes] = await Promise.all([api.get("/classes"), api.get("/subjects")]);

      const classList = parseList(cRes.data);
      const subjectList = parseList(sRes.data);

      setClasses(classList);
      setSubjects(subjectList);

      // auto select first class (si existe)
      if (classList.length > 0) setSelectedClassId(String(classList[0].id));
      // auto select first subject (si existe)
      if (subjectList.length > 0) setHeader((p) => ({ ...p, subject_id: String(subjectList[0].id) }));
    } catch (e) {
      console.error(e.response?.data || e);
      setError("Erreur chargement classes/matières.");
    } finally {
      setLoadingInit(false);
    }
  };

  const fetchStudentsByClass = async (classId) => {
    if (!classId) return;
    setLoadingStudents(true);
    setError("");
    try {
      const res = await api.get(`/classes/${classId}/students`);
      const list = parseList(res.data);

      setStudents(list);
      setValues({}); // reset notes saisies
      setStudentSearch("");
    } catch (e) {
      console.error(e.response?.data || e);
      setError("Erreur chargement élèves de la classe.");
      setStudents([]);
      setValues({});
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchInit();
  }, []);

  useEffect(() => {
    if (selectedClassId) fetchStudentsByClass(selectedClassId);
  }, [selectedClassId]);

  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    const s = studentSearch.trim().toLowerCase();
    if (!s) return list;

    return list.filter((st) => {
      const fullName =
        st.full_name || `${st.first_name || ""} ${st.last_name || ""}`.trim();
      return (
        fullName.toLowerCase().includes(s) ||
        (st.matricule || "").toLowerCase().includes(s)
      );
    });
  }, [students, studentSearch]);

  const onChangeHeader = (e) => {
    const { name, value } = e.target;
    setHeader((p) => ({ ...p, [name]: value }));
  };

  const onChangeValue = (studentId, v) => {
    setValues((p) => ({ ...p, [studentId]: v }));
  };

  const handleSave = async () => {
    setError("");

    if (!selectedClassId) return setError("Choisis une classe.");
    if (!header.subject_id) return setError("Choisis une matière.");
    if (!header.graded_at) return setError("Choisis une date.");
    const max = Number(header.max_value);
    if (!max || max <= 0) return setError("Le total (sur) doit être > 0.");

    // construire payload (format front)
    const payload = {
      subject_id: Number(header.subject_id),
      type: header.type,
      graded_at: header.graded_at,
      max_value: max,
      grades: filteredStudents.map((st) => ({
        student_id: st.id,
        value: values[st.id] === "" || values[st.id] === undefined ? null : Number(values[st.id]),
      })),
    };

    // enlever les vides (optionnel)
    payload.grades = payload.grades.filter((g) => g.value !== null && !Number.isNaN(g.value));

    if (payload.grades.length === 0) {
      return setError("Aucune note saisie. Ajoute au moins une note.");
    }

    // validation bornes
    const invalid = payload.grades.find((g) => g.value < 0 || g.value > max);
    if (invalid) {
      return setError(`Note invalide: ${invalid.value} (doit être entre 0 et ${max})`);
    }

    setSaving(true);
    try {
      const res = await api.post("/grades/bulk", payload);
      const count = res.data?.count ?? res.data?.grades?.length ?? 0;

      setSuccessModal({
        isOpen: true,
        title: "✅ Notes enregistrées",
        message: `${count} note(s) enregistrée(s) pour la classe.`,
      });
    } catch (e) {
      console.error(e.response?.data || e);
      const msg = e.response?.data?.message || "Erreur serveur lors de l’enregistrement.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestion des notes</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNE GAUCHE: CLASSES */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="font-semibold">Classes</div>
              <div className="text-xs text-gray-500">{classes.length} classe(s)</div>
            </div>

            <div className="max-h-[560px] overflow-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-4 py-2 text-left">Nom</th>
                    <th className="px-4 py-2 text-left">Niveau</th>
                    <th className="px-4 py-2 text-left">Année</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {classes.map((c) => {
                    const active = String(c.id) === String(selectedClassId);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClassId(String(c.id))}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          active ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.level}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.academic_year}</td>
                      </tr>
                    );
                  })}
                  {classes.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-gray-500" colSpan={3}>
                        Aucune classe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE: ÉLÈVES + NOTES */}
        <div className="lg:col-span-8">
          {/* HEADER: matière/type/date/sur + save */}
          <div className="bg-white p-4 rounded-lg shadow-md border mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matière
                </label>
                <select
                  name="subject_id"
                  value={header.subject_id}
                  onChange={onChangeHeader}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choisir une matière</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Aucune matière. Ajoute des matières dans Subjects.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={header.type}
                  onChange={onChangeHeader}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="DEVOIR">Devoir</option>
                  <option value="CONTROLE">Contrôle</option>
                  <option value="EXAMEN">Examen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="graded_at"
                  value={header.graded_at}
                  onChange={onChangeHeader}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sur
                  </label>
                  <input
                    type="number"
                    name="max_value"
                    value={header.max_value}
                    onChange={onChangeHeader}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min={0.01}
                    step="0.01"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loadingStudents || !selectedClassId}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>

          {/* Recherche + infos */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                🔍
              </span>
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Rechercher (nom ou matricule)..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="text-sm text-gray-500">
              {loadingStudents ? "Chargement élèves..." : `${filteredStudents.length} élève(s)`}
            </div>
          </div>

          {/* Table élèves + saisie */}
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Note
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredStudents.map((st) => {
                  const fullName =
                    st.full_name || `${st.first_name || ""} ${st.last_name || ""}`.trim();

                  return (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{st.matricule || "-"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{fullName}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min={0}
                          max={Number(header.max_value) || 20}
                          step="0.01"
                          value={values[st.id] ?? ""}
                          onChange={(e) => onChangeValue(st.id, e.target.value)}
                          className="w-40 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder={`/${header.max_value}`}
                        />
                      </td>
                    </tr>
                  );
                })}

                {!loadingStudents && filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                      Aucun élève trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {!selectedClassId && (
              <div className="px-6 py-10 text-center text-gray-500">
                Sélectionne une classe.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
