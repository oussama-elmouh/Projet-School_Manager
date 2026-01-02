import { useEffect, useState } from "react";
import api from "../api/client";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    class_id: ""
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes, usersRes] = await Promise.all([
        api.get("/students"),
        api.get("/classes"),
        api.get("/users")
      ]);
      setStudents(studentsRes.data.data || studentsRes.data);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = editingId ? `/students/${editingId}` : "/students";
      const method = editingId ? api.patch : api.post;
      const { data } = await method(endpoint, form);
      const newStudent = data.data || data;

      if (editingId) {
        setStudents(prev => prev.map(s => s.id === editingId ? newStudent : s));
        setEditingId(null);
      } else {
        setStudents(prev => [newStudent, ...prev]);
      }

      setForm({
        user_id: "", matricule: "", first_name: "", last_name: "",
        date_of_birth: "", gender: "", address: "", phone: "",
        medical_info: "", class_id: ""
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      alert(errors ? Object.values(errors).flat().join('\n') : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setForm({
      user_id: student.user_id || "",
      matricule: student.matricule || "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      address: student.address || "",
      phone: student.phone || "",
      medical_info: student.medical_info || "",
      class_id: student.class_id || ""
    });
    setEditingId(student.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet élève ?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;




const filteredStudents = students.filter((student) => {
  const search = searchTerm.toLowerCase();
  return (
    student.matricule?.toLowerCase().includes(search) ||
    student.first_name?.toLowerCase().includes(search) ||
    student.last_name?.toLowerCase().includes(search) ||
    student.full_name?.toLowerCase().includes(search)
  );
});

 
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des élèves</h1>

      {/* FORMULAIRE avec EXACTEMENT le même style que Classes */}
      <form
        onSubmit={handleCreate}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end bg-white p-6 rounded-lg shadow-md border"
      >
        {/* UTILISATEUR - Même style */}
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
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        {/* MATRICULE - Même style */}
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

        {/* PRENOM - Même style */}
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

        {/* NOM - Même style */}
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

        {/* DATE NAISSANCE - Même style */}
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

        {/* GENRE - Même style */}
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

        {/* TELEPHONE - Même style */}
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

        {/* CLASSE - Même style EXACT */}
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

        {/* ADRESSE & MEDICAL - Span 2 colonnes comme avant */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Infos médicales
          </label>
          <input
            name="medical_info"
            value={form.medical_info}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* BOUTONS - Même style exact */}
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
              onClick={() => {
                setEditingId(null);
                setForm({
                  user_id: "", matricule: "", first_name: "", last_name: "",
                  date_of_birth: "", gender: "", address: "", phone: "",
                  medical_info: "", class_id: ""
                });
              }}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </form>


      {/* BARRE DE RECHERCHE */}
     

      <div className="mb-4 flex items-center bg-white p-4 rounded-lg shadow-sm border">
  <div className="relative w-full max-w-md">
    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
      
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




      {/* TABLE - Inchangée, déjà parfaite */}
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
      {/* ← text-center pour Actions */}
      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
   {filteredStudents.map((student) => (
      <tr key={student.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">{student.id}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.matricule}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.full_name}</td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <span className="font-medium">{student.class?.name || "-"}</span>
        </td>
        
        {/* ← text-center pour Actions + flex justify-center */}
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


        {students.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 text-lg">
            Aucun élève trouvé. Ajoutez-en un ci-dessus.
          </div>
        )}
      </div>
    </div>
  );
}
