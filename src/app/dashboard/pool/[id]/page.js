"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import Link from "next/link";
import CandlestickChart from "@/components/CandlestickChart";

export default function PoolDetails() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-primary text-white p-6">
      <h1 className="text-2xl font-bold text-center">📌 Detalhes da Pool</h1>

      {/* Botão Add Entrada */}
      <div className="text-center mt-4">
        <Link href={`/dashboard/pool/${id}/add-entry`}>
          <button className="bg-blue-600 px-6 py-3 rounded-lg text-lg font-semibold">➕ Add Entrada</button>
        </Link>
      </div>

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
