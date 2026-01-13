import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    matricule: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    address: "",
    phone: "",
    medical_info: "",
    class_id: "",
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
      matricule: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      address: "",
      phone: "",
      medical_info: "",
      class_id: "",
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentsRes, classesRes, usersRes] = await Promise.all([
        api.get("/students"),
        api.get("/classes"),
        api.get("/users"),
      ]);

      setStudents(studentsRes.data?.data || studentsRes.data || []);
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

  const studentDisplayName = (s) =>
    s?.full_name ||
    `${s?.first_name || ""} ${s?.last_name || ""}`.trim() ||
    "Élève";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const endpoint = editingId ? `/students/${editingId}` : "/students";
      const method = editingId ? api.put : api.post; // ✅ PUT > PATCH

      const { data } = await method(endpoint, form);
      const newStudent = data?.data || data;

      if (editingId) {
        setStudents((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...newStudent } : s))
        );

        setSuccessModal({
          isOpen: true,
          title: "✅ Élève modifié !",
          message: `${studentDisplayName(newStudent)} a été modifié avec succès.`,
        });
      } else {
        setStudents((prev) => [newStudent, ...prev]);
        setSuccessModal({
          isOpen: true,
          title: "✅ Élève ajouté !",
          message: `${studentDisplayName(newStudent)} a été ajouté à la base de données.`,
        });
      }

      resetForm();
    } catch (err) {
      console.log("CREATE/UPDATE ERROR:", err.response?.data || err);

      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join("\n"));
      } else {
        setError(
          err.response?.data?.message ||
            "Erreur lors de la création / modification."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setError("");
    setForm({
      user_id: student.user?.id
        ? String(student.user.id)
        : student.user_id
        ? String(student.user_id)
        : "",
      matricule: student.matricule || "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      address: student.address || "",
      phone: student.phone || "",
      medical_info: student.medical_info || "",
      class_id: student.class?.id
        ? String(student.class.id)
        : student.class_id
        ? String(student.class_id)
        : "",
    });

    setEditingId(student.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet élève ?")) return;

    try {
      const deletedStudent = students.find((s) => s.id === id);
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));

      setSuccessModal({
        isOpen: true,
        title: "✅ Élève supprimé !",
        message: `${studentDisplayName(deletedStudent)} a été supprimé de la base de données.`,
      });
    } catch (err) {
      console.error("Erreur suppression", err);
      setError("Erreur lors de la suppression.");
    }
  };

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return students;

    return students.filter((student) => {
      const fullName = studentDisplayName(student).toLowerCase();
      return (
        (student.matricule || "").toLowerCase().includes(search) ||
        (student.first_name || "").toLowerCase().includes(search) ||
        (student.last_name || "").toLowerCase().includes(search) ||
        fullName.includes(search)
      );
    });
  }, [students, searchTerm]);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des élèves</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end bg-white p-6 rounded-lg shadow-md border"
      >
        {/* UTILISATEUR */}
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
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        {/* MATRICULE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matricule *
          </label>
          <input
            name="matricule"
            value={form.matricule}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* PRENOM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* NOM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* DATE NAISSANCE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date naissance *
          </label>
          <input
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* GENRE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Genre *
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionner</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>

        {/* TELEPHONE */}
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

        {/* CLASSE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classe *
          </label>
          <select
            name="class_id"
            value={form.class_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.name} ({classe.level}) - {classe.academic_year}
              </option>
            ))}
          </select>
        </div>

        {/* ADRESSE */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* INFOS MEDICALES */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Infos médicales
          </label>
          <input
            name="medical_info"
            value={form.medical_info}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* BUTTONS */}
        <div className="space-x-2 col-span-1 md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* SEARCH */}
      <div className="mb-4 flex items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher par matricule ou nom..."
            className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-4 text-sm text-gray-500">
          {filteredStudents.length} élève(s) trouvé(s)
        </div>
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
                Matricule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom complet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classe
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {student.matricule}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {studentDisplayName(student)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="font-medium">
                    {student.class?.name || "-"}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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

        {/* ✅ Empty state should be filteredStudents */}
        {filteredStudents.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 text-lg">
            Aucun élève trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
