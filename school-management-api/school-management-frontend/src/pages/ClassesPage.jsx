import { useEffect, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({  
    name: "",
    level: "",
    academic_year: "",
    capacity: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ STATE POUR MODAL SUCCESS
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/classes");
      setClasses(data.data || data);
    } catch (err) {
      console.error("Erreur chargement classes", err);
      setError("Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const endpoint = editingId ? `/classes/${editingId}` : "/classes";
      const method = editingId ? api.patch : api.post;

      const { data } = await method(endpoint, form);
      const newClass = data.data || data;

      if (editingId) {
        setClasses((prev) => 
          prev.map((c) => (c.id === editingId ? newClass : c))
        );
        setEditingId(null);
        
        // ✅ AFFICHER MODAL SUCCESS (MODIFICATION)
        setSuccessModal({
          isOpen: true,
          title: '✅ Classe modifiée!',
          message: `La classe "${newClass.name}" a été modifiée avec succès.`
        });
      } else {
        setClasses((prev) => [newClass, ...prev]);
        
        // ✅ AFFICHER MODAL SUCCESS (AJOUT)
        setSuccessModal({
          isOpen: true,
          title: '✅ Classe ajoutée!',
          message: `La classe "${newClass.name}" a été ajoutée à la base de données.`
        });
      }

      // Reset form
      setForm({ name: "", level: "", academic_year: "", capacity: "" });
    } catch (err) {
      console.log("CREATE ERROR FULL:", err.response?.data);

      const errors = err.response?.data?.errors;
      if (errors) {
        const msg = Object.values(errors).flat().join("\n");
        setError("Erreurs de validation :\n" + msg);
      } else {
        setError(err.response?.data?.message || "Erreur lors de la création / modification");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (classe) => {
    setForm({
      name: classe.name || "",
      level: classe.level || "",
      academic_year: classe.academic_year || "",
      capacity: classe.capacity || "",
    });
    setEditingId(classe.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette classe ?")) return;
    try {
      const deletedClass = classes.find(c => c.id === id);
      await api.delete(`/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      
      // ✅ AFFICHER MODAL SUCCESS (SUPPRESSION)
      setSuccessModal({
        isOpen: true,
        title: '✅ Classe supprimée!',
        message: `La classe "${deletedClass.name}" a été supprimée de la base de données.`
      });
    } catch (err) {
      console.error("Erreur suppression classe", err);
      setError("Erreur lors de la suppression");
    }
  };

  // Filtrage des classes en fonction de la saisie
  const filteredClasses = classes.filter((classe) => {
    const search = searchTerm.toLowerCase();
    return (
      (classe.name || "").toLowerCase().includes(search) ||
      (classe.level || "").toLowerCase().includes(search) ||
      (classe.academic_year || "").toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <div className="p-8 text-center">Chargement des classes...</div>;
  }

  return (
    <div className="p-6">
      {/* ✅ MODAL SUCCESS */}
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des classes</h1>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Formulaire CRUD */}
      <form
        onSubmit={handleCreate}
        className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4 items-end bg-white p-6 rounded-lg shadow-md border"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la classe
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Niveau
          </label>
          <input
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année scolaire
          </label>
          <input
            name="academic_year"
            value={form.academic_year}
            onChange={handleChange}
            placeholder="2024-2025"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacité
          </label>
          <input
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            placeholder="30"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-x-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", level: "", academic_year: "", capacity: "" });
              }}
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Recherche */}
      <div className="mb-4 flex items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom, niveau ou année..."
            className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau des classes */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Niveau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Année
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacité
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClasses.map((classe) => (
              <tr key={classe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {classe.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {classe.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {classe.level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {classe.academic_year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {classe.capacity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(classe)}
                      className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded hover:bg-blue-50 transition-colors text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(classe.id)}
                      className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {classes.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            Aucune classe trouvée. Ajoutez-en une ci-dessus.
          </div>
        )}
      </div>
    </div>
  );
}
