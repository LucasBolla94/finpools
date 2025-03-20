"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import CandlestickChart from "@/components/CandlestickChart";

export default function PoolDetails() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newEntry, setNewEntry] = useState({
    balance: "",
    pendingYield: "",
    sol: "",
    usdc: "",
  });

  useEffect(() => {
    if (!id) return;
    fetchEntries();
  }, [id]);

  const fetchEntries = async () => {
    setLoading(true);
    const q = query(collection(db, "entries"), where("poolId", "==", id));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEntries(data);
    setLoading(false);
  };

  const addEntry = async () => {
    setMessage("");
    setError("");

    try {
      await addDoc(collection(db, "entries"), {
        poolId: id,
        balance: newEntry.balance,
        pendingYield: newEntry.pendingYield,
        sol: newEntry.sol,
        usdc: newEntry.usdc,
        timestamp: new Date().toISOString(),
      });

      setMessage("✅ Entrada adicionada com sucesso!");
      setNewEntry({ balance: "", pendingYield: "", sol: "", usdc: "" });
      setShowForm(false);
      fetchEntries();

      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setError("❌ Erro ao adicionar entrada. Tente novamente.");
    }
  };

  const isFormFilled = Object.values(newEntry).every((value) => value.trim() !== "");

  return (
    <div className="min-h-screen bg-primary text-white p-6">
      <h1 className="text-2xl font-bold text-center">📌 Detalhes da Pool</h1>

      {/* Botão Add Entrada */}
      <div className="text-center mt-4">
        <button
          className="bg-blue-600 px-6 py-3 rounded-lg text-lg font-semibold"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "❌ Fechar Formulário" : "➕ Add Entrada"}
        </button>
      </div>

      {/* Formulário de Entrada */}
      {showForm && (
        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <h2 className="text-lg font-semibold text-center">➕ Nova Entrada</h2>
          <p className="text-sm text-gray-400 text-center mb-4">Preencha os campos abaixo:</p>

          <div className="grid gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Balance ($)"
              className="input-field"
              value={newEntry.balance}
              onChange={(e) => setNewEntry({ ...newEntry, balance: e.target.value })}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Pending Yield ($)"
              className="input-field"
              value={newEntry.pendingYield}
              onChange={(e) => setNewEntry({ ...newEntry, pendingYield: e.target.value })}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="SOL"
              className="input-field"
              value={newEntry.sol}
              onChange={(e) => setNewEntry({ ...newEntry, sol: e.target.value })}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="USDC"
              className="input-field"
              value={newEntry.usdc}
              onChange={(e) => setNewEntry({ ...newEntry, usdc: e.target.value })}
            />
          </div>

          {isFormFilled && (
            <button onClick={addEntry} className="bg-green-600 px-4 py-2 rounded mt-4 w-full">
              ✅ Salvar Entrada
            </button>
          )}
        </div>
      )}

      {/* Mensagens */}
      {message && <p className="text-green-400 text-center mt-4">{message}</p>}
      {error && <p className="text-red-400 text-center mt-4">{error}</p>}

      {/* Mensagem de Carregamento */}
      {loading ? (
        <p className="text-center text-gray-400 mt-4">Carregando entradas...</p>
      ) : (
        <>
          {/* Lista de Entradas */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-center">📜 Histórico de Entradas</h2>
            {entries.length === 0 ? (
              <p className="text-center text-gray-400 mt-2">Nenhuma entrada registrada ainda.</p>
            ) : (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-800 rounded-lg mb-2">
                    <p><strong>Balance:</strong> ${entry.balance} | <strong>Pending Yield:</strong> ${entry.pendingYield}</p>
                    <p><strong>SOL:</strong> {entry.sol} | <strong>USDC:</strong> {entry.usdc}</p>
                    <p className="text-sm text-gray-400">📅 {new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gráfico de Velas */}
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h2 className="text-lg font-semibold text-center">📈 Histórico de Entradas</h2>
            {entries.length > 0 ? (
              <CandlestickChart entries={entries} />
            ) : (
              <p className="text-center text-gray-400 mt-2">Nenhuma entrada registrada ainda.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
