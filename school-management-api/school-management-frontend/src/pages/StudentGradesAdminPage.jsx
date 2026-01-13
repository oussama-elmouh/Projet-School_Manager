import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";

export default function StudentGradesAdminPage() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [openResults, setOpenResults] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [grades, setGrades] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [error, setError] = useState("");

  // Filtres notes
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");

  const boxRef = useRef(null);

  const parseList = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  };

  const studentLabel = (st) => {
    const fullName =
      st.full_name || `${st.first_name || ""} ${st.last_name || ""}`.trim();
    return `${fullName || st.user?.name || "Élève"}${st.matricule ? ` (${st.matricule})` : ""}`;
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError("");
    try {
      // on récupère une grande liste (MVP)
      const res = await api.get("/students?per_page=1000");
      const list = parseList(res.data);
      setStudents(list);
    } catch (e) {
      console.error(e.response?.data || e);
      setError("Erreur chargement des élèves.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchGrades = async (studentId) => {
    if (!studentId) return;

    setLoadingGrades(true);
    setError("");

    try {
      const res = await api.get(`/grades/student/${studentId}`);
      const raw = res.data;

      setStudentInfo(raw?.student || null);

      const list =
        Array.isArray(raw?.grades) ? raw.grades :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.data?.data) ? raw.data.data :
        Array.isArray(raw?.grades?.data) ? raw.grades.data :
        [];

      setGrades(list);
    } catch (e) {
      console.error(e.response?.data || e);
      setGrades([]);
      setStudentInfo(null);
      setError("Erreur chargement des notes.");
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fermer dropdown si clic dehors
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpenResults(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const list = Array.isArray(students) ? students : [];
    const res = list.filter((st) => {
      const fullName =
        (st.full_name || `${st.first_name || ""} ${st.last_name || ""}`.trim()).toLowerCase();
      const matricule = (st.matricule || "").toLowerCase();
      const email = (st.user?.email || st.email || "").toLowerCase();
      return fullName.includes(q) || matricule.includes(q) || email.includes(q);
    });

    return res.slice(0, 12); // max 12 résultats
  }, [students, query]);

  const subjectOptions = useMemo(() => {
    const set = new Set();
    grades.forEach((g) => {
      if (g.subject) set.add(g.subject);
    });
    return Array.from(set).sort();
  }, [grades]);

  const typeOptions = useMemo(() => {
    const set = new Set();
    grades.forEach((g) => {
      if (g.type) set.add(g.type);
    });
    return Array.from(set).sort();
  }, [grades]);

  const periodOptions = useMemo(() => {
    const set = new Set();
    grades.forEach((g) => {
      if (g.period) set.add(g.period);
    });
    return Array.from(set).sort();
  }, [grades]);

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const okP = filterPeriod ? g.period === filterPeriod : true;
      const okS = filterSubject ? g.subject === filterSubject : true;
      const okT = filterType ? String(g.type) === String(filterType) : true;
      return okP && okS && okT;
    });
  }, [grades, filterPeriod, filterSubject, filterType]);

  const handlePickStudent = async (st) => {
    setSelectedStudent(st);
    setQuery(studentLabel(st));
    setOpenResults(false);

    // reset filtres
    setFilterPeriod("");
    setFilterSubject("");
    setFilterType("");

    await fetchGrades(st.id);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notes d’un élève (Admin)</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Recherche élève (avec résultats) */}
      <div ref={boxRef} className="bg-white p-4 rounded-lg shadow-sm border mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rechercher un élève
        </label>

        <div className="relative max-w-2xl">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔎</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenResults(true);
            }}
            onFocus={() => setOpenResults(true)}
            placeholder="Tape nom / matricule / email..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {loadingStudents && (
          <div className="text-sm text-gray-500 mt-2">Chargement des élèves…</div>
        )}

        {/* Résultats */}
        {openResults && query.trim() && (
          <div className="absolute z-20 mt-2 w-full max-w-2xl bg-white border rounded-md shadow-lg overflow-hidden">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">Aucun résultat.</div>
            ) : (
              <ul className="divide-y">
                {filteredResults.map((st) => (
                  <li
                    key={st.id}
                    onClick={() => handlePickStudent(st)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {studentLabel(st)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {st.id} {st.class?.name ? `• Classe: ${st.class.name}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Carte élève sélectionné */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        {!selectedStudent ? (
          <div className="text-gray-500">Sélectionne un élève pour afficher ses notes.</div>
        ) : (
          <div className="flex flex-wrap gap-4 items-center">
            <div className="font-semibold">
              {studentInfo?.name || studentLabel(selectedStudent)}
              <span className="text-gray-500 text-sm"> (ID: {selectedStudent.id})</span>
            </div>
            <div className="text-sm text-gray-500">
              {loadingGrades ? "Chargement…" : `${grades.length} note(s)`}
            </div>
            {studentInfo?.average && (
              <div className="text-sm">
                <span className="text-gray-500">Moyenne :</span>{" "}
                <span className="font-semibold">{studentInfo.average}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtres notes */}
      {selectedStudent && (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Période</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Toutes</option>
                {periodOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Matière</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Toutes</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Tous</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                setFilterPeriod("");
                setFilterSubject("");
                setFilterType("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Réinitialiser filtres
            </button>
          </div>
        </div>
      )}

      {/* Tableau notes */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matière</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loadingGrades ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Chargement des notes…
                </td>
              </tr>
            ) : filteredGrades.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Aucune note.
                </td>
              </tr>
            ) : (
              filteredGrades.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{g.subject || "-"}</td>
                  <td className="px-6 py-4 text-sm">{g.type || "-"}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{g.display_score || "-"}</td>
                  <td className="px-6 py-4 text-sm">{g.period || "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    {g.created_at ? new Date(g.created_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
