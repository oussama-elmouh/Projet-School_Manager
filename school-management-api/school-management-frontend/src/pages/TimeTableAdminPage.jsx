import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

const DAYS = [
  { key: "MONDAY", label: "Lundi" },
  { key: "TUESDAY", label: "Mardi" },
  { key: "WEDNESDAY", label: "Mercredi" },
  { key: "THURSDAY", label: "Jeudi" },
  { key: "FRIDAY", label: "Vendredi" },
  { key: "SATURDAY", label: "Samedi" },
];


const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
};

const normalizeTimetable = (t) => {
  // backend peut renvoyer:
  // {subject:{id,name}, teacher:{id,user:{name}}, school_class:{...}} ou {subject_name, teacher_name}
  const subjectName = t?.subject?.name || t?.subject_name || t?.subject?.label || "-";
  const teacherName =
    t?.teacher?.user?.name ||
    t?.teacher?.name ||
    t?.teacher_name ||
    "-";
  const className = t?.schoolClass?.name || t?.school_class?.name || t?.class?.name || "-";

  return {
    id: t.id,
    class_id: t.class_id,
    subject_id: t.subject_id,
    teacher_id: t.teacher_id,
    day: t.day,
    start_time: (t.start_time || "").slice(0, 5),
    end_time: (t.end_time || "").slice(0, 5),
    room: t.room || "",
    subjectName,
    teacherName,
    className,
    raw: t,
  };
};

export default function TimeTableAdminPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingRight, setLoadingRight] = useState(false);
  const [error, setError] = useState("");

  const [classSearch, setClassSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  const [timetable, setTimetable] = useState([]); // all sessions for class
  const [selectedSession, setSelectedSession] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    class_id: "",
    day: "MON",
    subject_id: "",
    teacher_id: "",
    start_time: "08:00",
    end_time: "09:00",
    room: "",
  });

  const [saving, setSaving] = useState(false);

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // ---------- FETCH INIT ----------
  const fetchInit = async () => {
    setLoadingLeft(true);
    setError("");
    try {
      const [cRes, sRes, tRes] = await Promise.all([
        api.get("/classes?per_page=200"),
        api.get("/subjects?per_page=500"),
        api.get("/teachers?per_page=500"),
      ]);

      const classList = toArray(cRes.data);
      const subjectList = toArray(sRes.data);
      const teacherList = toArray(tRes.data);

      setClasses(classList);
      setSubjects(subjectList);
      setTeachers(teacherList);

      // auto select first class if exists
      if (classList.length > 0) {
        setSelectedClass(classList[0]);
      }
    } catch (e) {
      console.error(e.response?.data || e);
      setError("Erreur chargement des données (classes / matières / profs).");
    } finally {
      setLoadingLeft(false);
    }
  };

  const fetchTimetable = async (classId) => {
    if (!classId) return;
    setLoadingRight(true);
    setError("");
    setSelectedSession(null);
    try {
      // Option A: query
      const res = await api.get(`/timetables?class_id=${classId}&per_page=1000`);
      const list = toArray(res.data?.data || res.data);
      setTimetable(list.map(normalizeTimetable));
    } catch (e) {
      console.error(e.response?.data || e);
      setError("Erreur chargement emploi du temps.");
      setTimetable([]);
    } finally {
      setLoadingRight(false);
    }
  };

  useEffect(() => {
    fetchInit();
  }, []);

  useEffect(() => {
    if (selectedClass?.id) {
      fetchTimetable(selectedClass.id);
      // preset form class_id
      setForm((p) => ({ ...p, class_id: String(selectedClass.id) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass?.id]);

  // ---------- UI HELPERS ----------
  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => {
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.level || "").toLowerCase().includes(q) ||
        (c.academic_year || "").toLowerCase().includes(q)
      );
    });
  }, [classes, classSearch]);

  const groupedByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => (map[d.key] = []));
    timetable.forEach((s) => {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    });
    // sort by start_time
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
    });
    return map;
  }, [timetable]);

  const openCreateModal = (dayKey) => {
    setEditingId(null);
    setSelectedSession(null);
    setForm((p) => ({
      ...p,
      class_id: String(selectedClass?.id || ""),
      day: dayKey,
      subject_id: subjects?.[0]?.id ? String(subjects[0].id) : "",
      teacher_id: teachers?.[0]?.id ? String(teachers[0].id) : "",
      start_time: "08:00",
      end_time: "09:00",
      room: "",
    }));
    setModalOpen(true);
  };

  const openEditModal = (session) => {
    setEditingId(session.id);
    setForm({
      class_id: String(session.class_id || selectedClass?.id || ""),
      day: session.day || "MON",
      subject_id: String(session.subject_id || ""),
      teacher_id: String(session.teacher_id || ""),
      start_time: session.start_time || "08:00",
      end_time: session.end_time || "09:00",
      room: session.room || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        class_id: Number(form.class_id),
        day: form.day,
        subject_id: Number(form.subject_id),
        teacher_id: Number(form.teacher_id),
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room || null,
      };

      const res = editingId
        ? await api.patch(`/timetables/${editingId}`, payload)
        : await api.post(`/timetables`, payload);

      const saved = normalizeTimetable(res.data?.data || res.data);

      if (editingId) {
        setTimetable((prev) => prev.map((x) => (x.id === editingId ? saved : x)));
        setSuccessModal({
          isOpen: true,
          title: "✅ Séance modifiée",
          message: "La séance a été modifiée avec succès.",
        });
      } else {
        setTimetable((prev) => [saved, ...prev]);
        setSuccessModal({
          isOpen: true,
          title: "✅ Séance ajoutée",
          message: "La séance a été ajoutée avec succès.",
        });
      }

      closeModal();
      // refresh to be safe (optional)
      if (selectedClass?.id) fetchTimetable(selectedClass.id);
    } catch (e2) {
      console.error(e2.response?.data || e2);
      const msg =
        e2.response?.data?.message ||
        (e2.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join("\n")
          : "Erreur lors de l'enregistrement.");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    setError("");
    try {
      await api.delete(`/timetables/${id}`);
      setTimetable((prev) => prev.filter((x) => x.id !== id));
      if (selectedSession?.id === id) setSelectedSession(null);

      setSuccessModal({
        isOpen: true,
        title: "✅ Séance supprimée",
        message: "La séance a été supprimée avec succès.",
      });
    } catch (e) {
      console.error(e.response?.data || e);
      setError("Erreur lors de la suppression.");
    }
  };

  // ---------- RENDER ----------
  if (loadingLeft) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
      />

      <div className="mb-4">
        <h1 className="text-2xl font-bold">Emploi du temps</h1>
        <div className="text-sm text-gray-500">
          Sélectionne une classe puis ajoute / modifie les séances.
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: CLASSES */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Classes</div>
              <div className="text-xs text-gray-500">
                {filteredClasses.length}/{classes.length}
              </div>
            </div>

            <input
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="Rechercher une classe..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="max-h-[560px] overflow-auto">
              {filteredClasses.length === 0 ? (
                <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
                  Aucune classe trouvée
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClasses.map((c) => {
                    const active = selectedClass?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClass(c)}
                        className={`w-full text-left px-3 py-3 rounded-lg border transition ${
                          active
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500">
                          {c.level} • {c.academic_year} • Cap: {c.capacity}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: TIMETABLE */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">Emploi du temps</div>
                <div className="text-xs text-gray-500">
                  Clique sur une séance pour voir / modifier / supprimer.
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {selectedClass ? (
                  <span>
                    Classe: <span className="font-medium text-gray-900">{selectedClass.name}</span>
                  </span>
                ) : (
                  "Sélectionne une classe"
                )}
              </div>
            </div>

            {loadingRight ? (
              <div className="p-6 text-center text-gray-500">Chargement...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS.map((d) => {
                  const items = groupedByDay[d.key] || [];
                  return (
                    <div key={d.key} className="rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                        <div className="font-medium">{d.label}</div>
                        <button
                          type="button"
                          onClick={() => openCreateModal(d.key)}
                          disabled={!selectedClass}
                          className="text-sm text-blue-700 hover:text-blue-900 disabled:opacity-50"
                        >
                          + Ajouter
                        </button>
                      </div>

                      <div className="p-3 min-h-[120px]">
                        {items.length === 0 ? (
                          <div className="border border-dashed rounded-lg p-4 text-center text-gray-500">
                            Aucun cours
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {items.map((s) => (
                              <button
                                type="button"
                                key={s.id}
                                onClick={() => setSelectedSession(s)}
                                className={`w-full text-left rounded-lg border px-3 py-2 hover:bg-gray-50 transition ${
                                  selectedSession?.id === s.id
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-900">
                                    {s.start_time} - {s.end_time}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {s.room ? `Salle ${s.room}` : ""}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-700">{s.subjectName}</div>
                                <div className="text-xs text-gray-500">{s.teacherName}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DETAILS */}
            <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 font-medium">Détails</div>

              {!selectedSession ? (
                <div className="p-4 text-sm text-gray-500">
                  Sélectionne une séance pour afficher ses détails.
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Jour</div>
                      <div className="font-medium">
                        {DAYS.find((x) => x.key === selectedSession.day)?.label || selectedSession.day}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Horaire</div>
                      <div className="font-medium">
                        {selectedSession.start_time} - {selectedSession.end_time}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Matière</div>
                      <div className="font-medium">{selectedSession.subjectName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Professeur</div>
                      <div className="font-medium">{selectedSession.teacherName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Salle</div>
                      <div className="font-medium">{selectedSession.room || "-"}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedSession)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedSession.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSession(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="font-semibold">
                {editingId ? "Modifier la séance" : "Ajouter une séance"}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
                  <select
                    name="day"
                    value={form.day}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                  <input
                    name="room"
                    value={form.room}
                    onChange={handleFormChange}
                    placeholder="Ex: A12"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <select
                    name="subject_id"
                    value={form.subject_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
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
                      Aucune matière trouvée. Ajoute des matières.
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professeur</label>
                  <select
                    name="teacher_id"
                    value={form.teacher_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Choisir un professeur</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user?.name || t.name || `Prof #${t.id}`} ({t.email || t.user?.email || "—"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
