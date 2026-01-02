import { useEffect, useState } from "react";
import api from "../api/client";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    email: "",
    specialization: "",
    phone: "",
    bio: "",
    status: "ACTIVE",
    classes: [] // Pour classes assignées
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teachersRes, classesRes, usersRes] = await Promise.all([
        api.get("/teachers"),
        api.get("/classes"),
        api.get("/users")
      ]);
      setTeachers(teachersRes.data.data || teachersRes.data);
      setClasses(classesRes.data.data || classesRes.data);
      setUsers(usersRes.data.data || usersRes.data);
    } catch (err) {
      console.error("Erreur chargement", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddClass = () => {
    setForm({
      ...form,
      classes: [...form.classes, { class_id: "", subject: "" }]
    });
  };

  const handleRemoveClass = (index) => {
    setForm({
      ...form,
      classes: form.classes.filter((_, i) => i !== index)
    });
  };

  const handleClassChange = (index, field, value) => {
    const newClasses = [...form.classes];
    newClasses[index][field] = value;
    setForm({ ...form, classes: newClasses });
  };

const handleCreate = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
    const payload = {
      user_id: form.user_id,
      email: form.email,
      specialization: form.specialization,
      phone: form.phone,
      bio: form.bio,
      status: form.status
    };

    const { data } = editingId 
      ? await api.patch(`/teachers/${editingId}`, payload)
      : await api.post('/teachers', payload);

    let newTeacher = data.data || data;

    // ✅ Assigner classes
    if (form.classes.length > 0) {
      for (const cls of form.classes) {
        if (cls.class_id && cls.subject) {
          try {
            await api.post(`/teachers/${newTeacher.id}/assign-class`, {
              class_id: cls.class_id,
              subject: cls.subject
            });
          } catch (err) {
            console.warn(`Classe ${cls.class_id} non assignée:`, err.response?.data?.message);
          }
        }
      }

      // ✅ RAFRAÎCHIR données du prof après assignation
      const { data: refreshedData } = await api.get(`/teachers/${newTeacher.id}`);
      newTeacher = refreshedData.data || refreshedData;
    }

    // ✅ UPDATE le tableau avec données fraîches
    if (editingId) {
      setTeachers(prev => prev.map(t => t.id === editingId ? newTeacher : t));
      setEditingId(null);
    } else {
      setTeachers(prev => [newTeacher, ...prev]);
    }

    // Reset form
    setForm({
      user_id: "", email: "", specialization: "", phone: "",
      bio: "", status: "ACTIVE", classes: []
    });

    // ✅ Optionnel: recharger TOUT le tableau
     await fetchData();
 alert('✅ Professeur ' + (editingId ? 'modifié' : 'ajouté') + ' avec succès!');
  } catch (err) {
    const errors = err.response?.data?.errors;
    const message = errors 
      ? Object.values(errors).flat().join('\n') 
      : err.response?.data?.message || err.message || "Erreur serveur";
    alert(message);
    console.error('Erreur handleCreate:', err);
  } finally {
    setSaving(false);
  }
};



  const handleEdit = (teacher) => {
    setForm({
      user_id: teacher.user?.id || "",
      email: teacher.email || "",
      specialization: teacher.specialization || "",
      phone: teacher.phone || "",
      bio: teacher.bio || "",
      status: teacher.status || "ACTIVE",
      classes: teacher.classes?.map(c => ({ class_id: c.id, subject: c.pivot?.subject })) || []
    });
    setEditingId(teacher.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce professeur ?")) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert("Erreur suppression");
    }
  };
const filteredTeachers = teachers.filter((teacher) => {
  const search = searchTerm.toLowerCase();
  
  // On récupère le nom de l'utilisateur si l'objet teacher.user existe
  const userName = teacher.user?.name || "";
  
  return (
    (teacher.email || "").toLowerCase().includes(search) ||
    (teacher.specialization || "").toLowerCase().includes(search) ||
    userName.toLowerCase().includes(search)
  );
});
  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des professeurs</h1>

      {/* FORMULAIRE */}
      <form
        onSubmit={handleCreate}
        className="mb-6 bg-white p-6 rounded-lg shadow-md border"
      >
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
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.filter(u => u.role === 'TEACHER').map((user) => (
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
                onChange={(e) => handleClassChange(idx, 'class_id', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Sélectionner classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Matière (ex: Maths)"
                value={cls.subject}
                onChange={(e) => handleClassChange(idx, 'subject', e.target.value)}
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
              onClick={() => {
                setEditingId(null);
                setForm({
                  user_id: "", email: "", specialization: "", phone: "",
                  bio: "", status: "ACTIVE", classes: []
                });
              }}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
<div className="mb-4 relative max-w-md">
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
    
  </span>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.specialization}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
  <div className="flex flex-wrap gap-1">
    {Array.isArray(teacher.classes) && teacher.classes.length > 0 ? (
      teacher.classes.map(c => (
        <span 
          key={`${teacher.id}-${c.id}`}
          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded whitespace-nowrap"
        >
          {c.name} ({c.pivot?.subject || 'N/A'})
        </span>
      ))
    ) : (
      <span className="text-gray-400">Aucune classe</span>
    )}
  </div>
</td>

                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    teacher.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
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
        {teachers.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            Aucun professeur trouvé. Ajoutez-en un ci-dessus.
          </div>
        )}
      </div>
    </div>
  );
}
