// src/pages/InvoiceMonthlyAdminPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SuccessModal from "../components/SuccessModal";

const TYPES = ["TUITION", "CANTINE", "TRANSPORT", "REGISTRATION", "OTHER"];
const METHODS = ["CASH", "CHEQUE", "BANK_TRANSFER"];

function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  return [];
}

function monthLabel(ym) {
  // "2026-01" -> "01/2026"
  const [y, m] = String(ym).split("-");
  return `${m}/${y}`;
}

export default function InvoiceMonthlyAdminPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classSearch, setClassSearch] = useState("");

  const [type, setType] = useState("TUITION");
  const [from, setFrom] = useState("2026-01");
  const [to, setTo] = useState("2026-06");

  const [grid, setGrid] = useState(null); // {months, rows}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate modal
  const [genOpen, setGenOpen] = useState(false);
  const [genMonth, setGenMonth] = useState("2026-01");
  const [genAmount, setGenAmount] = useState("300.00");
  const [genDueDate, setGenDueDate] = useState("2026-01-10");
  const [genNotes, setGenNotes] = useState("");

  // Pay modal
  const [payOpen, setPayOpen] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState(null);
  const [payStudentName, setPayStudentName] = useState("");
  const [payMonth, setPayMonth] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payRef, setPayRef] = useState("");

  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

  const filteredClasses = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [classes, classSearch]);

  async function fetchInit() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/classes", { params: { per_page: 200 } });
      const list = toArray(res.data);
      setClasses(list);
      if (list.length) setSelectedClass(list[0]);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur chargement des classes.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchGrid() {
    if (!selectedClass?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/invoices/monthly-grid", {
        params: { class_id: selectedClass.id, from, to, type },
      });
      setGrid(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur chargement grille paiements.");
      setGrid(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInit();
  }, []);

  useEffect(() => {
    if (selectedClass?.id) fetchGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass?.id, type, from, to]);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!selectedClass?.id) return;

    setLoading(true);
    setError("");
    try {
      await api.post("/invoices/monthly-generate", {
        class_id: selectedClass.id,
        billing_month: genMonth,
        type,
        amount: Number(genAmount),
        due_date: genDueDate,
        notes: genNotes || null,
      });

      setSuccessModal({
        isOpen: true,
        title: "✅ Factures générées",
        message: `Factures du mois ${monthLabel(genMonth)} générées (si manquantes).`,
      });
      setGenOpen(false);
      await fetchGrid();
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors ? Object.values(e2.response.data.errors).flat().join("\n") : "") ||
        "Erreur génération";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function openPay(invoiceId, studentName, month) {
    setPayInvoiceId(invoiceId);
    setPayStudentName(studentName);
    setPayMonth(month);
    setPayMethod("CASH");
    setPayRef("");
    setPayOpen(true);
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!payInvoiceId) return;

    setLoading(true);
    setError("");
    try {
      await api.post(`/invoices/${payInvoiceId}/pay`, {
        payment_method: payMethod,
        payment_reference: payRef || null,
      });

      setSuccessModal({
        isOpen: true,
        title: "✅ Paiement enregistré",
        message: `${payStudentName} — ${monthLabel(payMonth)} payé.`,
      });

      setPayOpen(false);
      await fetchGrid();
    } catch (e2) {
  // ✅ AFFICHE L'ERREUR EXACTE DU BACKEND
  console.log("PAY 422 ERROR:", e2?.response?.data);

  const msg =
    e2?.response?.data?.message ||
    (e2?.response?.data?.errors
      ? Object.values(e2.response.data.errors).flat().join("\n")
      : "Erreur paiement");

  setError(msg);
}
 finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal((p) => ({ ...p, isOpen: false }))}
      />

      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Paiements mensuels</h1>
          <div className="text-sm text-gray-500">
            Tableau: élèves × mois (payé / en attente / absent).
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setGenMonth(from);
            setGenOpen(true);
          }}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          disabled={!selectedClass}
        >
          + Générer factures
        </button>
      </div>

      {error ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded whitespace-pre-line">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="font-semibold mb-3">Classes</div>

            <input
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 outline-none"
            />

            <div className="max-h-[520px] overflow-auto space-y-2">
              {filteredClasses.map((c) => {
                const active = selectedClass?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClass(c)}
                    className={`w-full text-left px-3 py-3 rounded-lg border transition ${
                      active ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">ID: {c.id}</div>
                  </button>
                );
              })}
              {!filteredClasses.length ? (
                <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
                  Aucune classe
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <div>
                <label className="text-xs text-gray-600">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">De (YYYY-MM)</label>
                  <input value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">À (YYYY-MM)</label>
                  <input value={to} onChange={(e) => setTo(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>

              <button
                type="button"
                onClick={fetchGrid}
                className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black"
                disabled={!selectedClass}
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Grille</div>
              <div className="text-sm text-gray-500">
                {selectedClass ? <>Classe: <span className="font-medium text-gray-900">{selectedClass.name}</span></> : "—"}
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Chargement...</div>
            ) : !grid ? (
              <div className="p-6 text-center text-gray-500">Aucune donnée</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-[900px] w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-600 border-b p-2 sticky left-0 bg-white">
                        Élève
                      </th>
                      {grid.months.map((m) => (
                        <th key={m} className="text-center text-xs font-semibold text-gray-600 border-b p-2">
                          {monthLabel(m)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.rows.map((row) => (
                      <tr key={row.student.id} className="border-b">
                        <td className="p-2 text-sm sticky left-0 bg-white border-r">
                          {row.student.name}
                        </td>

                        {grid.months.map((m) => {
                          const cell = row.months[m]; // null or object
                          if (!cell) {
                            return (
                              <td key={m} className="p-2 text-center text-xs text-gray-400">
                                —
                              </td>
                            );
                          }

                          const isPaid = cell.status === "PAID";
                          const isPending = cell.status === "PENDING";
                          const badge =
                            isPaid ? "bg-green-100 text-green-800 border-green-200" :
                            isPending ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                            "bg-gray-100 text-gray-700 border-gray-200";

                          return (
                            <td key={m} className="p-2 text-center">
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs ${badge}`}>
                                <span>{cell.status}</span>
                                <span>{cell.amount}</span>
                              </div>

                              {isPending ? (
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    onClick={() => openPay(cell.invoice_id, row.student.name, m)}
                                    className="text-xs text-blue-700 hover:text-blue-900"
                                  >
                                    Payer
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {genOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="font-semibold">Générer des factures (mois)</div>
              <button type="button" onClick={() => setGenOpen(false)} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleGenerate} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mois (YYYY-MM)</label>
                  <input value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                  <input type="date" value={genDueDate} onChange={(e) => setGenDueDate(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                  <input value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                  <input value={genNotes} onChange={(e) => setGenNotes(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setGenOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "..." : "Générer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Pay Modal */}
      {payOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="font-semibold">Enregistrer paiement</div>
              <button type="button" onClick={() => setPayOpen(false)} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handlePay} className="p-5 space-y-4">
              <div className="text-sm text-gray-700">
                <div><span className="text-gray-500">Élève:</span> <b>{payStudentName}</b></div>
                <div><span className="text-gray-500">Mois:</span> <b>{monthLabel(payMonth)}</b></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full border rounded-md px-3 py-2">
                    {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence (optionnel)</label>
                  <input value={payRef} onChange={(e) => setPayRef(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setPayOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                  {loading ? "..." : "Valider paiement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
