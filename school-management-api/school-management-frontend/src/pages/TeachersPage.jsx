import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    email: "",
    specialization: "",
    phone: "",
    bio: "",
    status: "ACTIVE",
    classes: [], // [{ class_id, subject }]
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setError("");
    setForm({
      user_id: "",
      email: "",
      specialization: "",
      phone: "",
      bio: "",
      status: "ACTIVE",
      classes: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [teachersRes, classesRes, usersRes] = await Promise.all([
        api.get("/teachers"),
        api.get("/classes"),
        api.get("/users"),
      ]);

      setTeachers(teachersRes.data?.data || teachersRes.data || []);
      setClasses(classesRes.data?.data || classesRes.data || []);
      setUsers(usersRes.data?.data || usersRes.data || []);
    } catch (err) {
      console.error("Erreur chargement", err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClass = () => {
    setForm((prev) => ({
      ...prev,
      classes: [...prev.classes, { class_id: "", subject: "" }],
    }));
  };

  const handleRemoveClass = (index) => {
    setForm((prev) => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index),
    }));
  };

  const handleClassChange = (index, field, value) => {
    setForm((prev) => {
      const newClasses = [...prev.classes];
      newClasses[index] = { ...newClasses[index], [field]: value };
      return { ...prev, classes: newClasses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        user_id: form.user_id,
        email: form.email,
        specialization: form.specialization,
        phone: form.phone,
        bio: form.bio,
        status: form.status,
        classes: form.classes, // ✅ important
      };

      const endpoint = editingId ? `/teachers/${editingId}` : "/teachers";
      const method = editingId ? api.put : api.post; // ✅ PUT (stable)

      const { data } = await method(endpoint, payload);
      const newTeacher = data?.data || data;

      if (editingId) {
        setTeachers((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...newTeacher } : t))
        );

        setSuccessModal({
          isOpen: true,
          title: "✅ Professeur modifié",
          message: "Le professeur a été modifié avec succès.",
        });
      } else {
        setTeachers((prev) => [newTeacher, ...prev]);

        setSuccessModal({
          isOpen: true,
          title: "✅ Professeur ajouté",
          message: "Le professeur a été ajouté avec succès.",
        });
      }

      resetForm();
    } catch (err) {
      console.log("CREATE/UPDATE ERROR:", err.response?.data || err);

      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join("\n"));
      } else {
        setError(err.response?.data?.message || "Erreur serveur.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (teacher) => {
    setError("");

    setForm({
      user_id: teacher.user?.id ? String(teacher.user.id) : (teacher.user_id ? String(teacher.user_id) : ""),
      email: teacher.email || teacher.user?.email || "",
      specialization: teacher.specialization || "",
      phone: teacher.phone || teacher.user?.phone || "",
      bio: teacher.bio || "",
      status: teacher.status || "ACTIVE",
      classes: Array.isArray(teacher.classes)
        ? teacher.classes.map((c) => ({
            class_id: c.id ? String(c.id) : "",
            subject: c.pivot?.subject || c.subject || "",
          }))
        : [],
    });

    setEditingId(teacher.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce professeur ?")) return;

    try {
      await api.delete(`/teachers/${id}`);
      setTeachers((prev) => prev.filter((t) => t.id !== id));

      setSuccessModal({
        isOpen: true,
        title: "✅ Professeur supprimé",
        message: "Le professeur a été supprimé avec succès.",
      });
    } catch (err) {
      console.error("Erreur suppression", err);
      setError("Erreur lors de la suppression.");
    }
  };

  const filteredTeachers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return teachers;

    return teachers.filter((teacher) => {
      const userName = teacher.user?.name || "";
      return (
        (teacher.email || "").toLowerCase().includes(search) ||
        (teacher.specialization || "").toLowerCase().includes(search) ||
        userName.toLowerCase().includes(search)
      );
    });
  }, [teachers, searchTerm]);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
      />

      <h1 className="text-2xl font-bold mb-6">Gestion des professeurs</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-md border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisateur lié *
            </label>
            <select
              name="user_id"
              value={form.user_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              
            >
              <option value="">Sélectionner un utilisateur</option>
              {users
                .filter((u) => u.role === "TEACHER")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Spécialité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spécialité *
            </label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biographie
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* Classes assignées */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Classes enseignées</h3>
            <button
              type="button"
              onClick={handleAddClass}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Ajouter classe
            </button>
          </div>

          {form.classes.map((cls, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-end">
              <select
                value={cls.class_id}
                onChange={(e) => handleClassChange(idx, "class_id", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Sélectionner classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Matière (ex: Maths)"
                value={cls.subject}
                onChange={(e) => handleClassChange(idx, "subject", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />

              <button
                type="button"
                onClick={() => handleRemoveClass(idx)}
                className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 text-sm"
              >
                Retirer
              </button>
            </div>
          ))}

          {form.classes.length === 0 && (
            <div className="text-sm text-gray-500">Aucune classe assignée.</div>
          )}
        </div>

        {/* Boutons */}
        <div className="space-x-2">
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

      {/* SEARCH */}
      <div className="mb-4 relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Rechercher par nom, email ou spécialité..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spécialité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.specialization}</td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(teacher.classes) && teacher.classes.length > 0 ? (
                      teacher.classes.map((c) => (
                        <span
                          key={`${teacher.id}-${c.id}`}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded whitespace-nowrap"
                        >
                          {c.name} ({c.pivot?.subject || c.subject || "N/A"})
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">Aucune classe</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      teacher.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {teacher.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTeachers.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            Aucun professeur trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
