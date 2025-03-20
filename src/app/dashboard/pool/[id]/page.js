"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, addDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import CandlestickChart from "@/components/CandlestickChart";

export default function PoolDetails() {
  const params = useParams();
  const { id } = params;

  const [entries, setEntries] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [lastEntry, setLastEntry] = useState(null);
  const [previousEntry, setPreviousEntry] = useState(null);
  const [percentageChange, setPercentageChange] = useState(0);
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [depositsLimit, setDepositsLimit] = useState(10);

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [message, setMessage] = useState("");

  const [newEntry, setNewEntry] = useState({ balance: "", pendingYield: "", sol: "", usdc: "" });
  const [newDeposit, setNewDeposit] = useState({ total: "", sol: "", usdc: "" });

  useEffect(() => {
    if (!id) return;
    fetchEntries();
    fetchDeposits();
  }, [id, entriesLimit, depositsLimit]);

  const fetchEntries = async () => {
    const q = query(
      collection(db, "entries"),
      where("poolId", "==", id),
      orderBy("timestamp", "desc"),
      limit(entriesLimit)
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setEntries(data);
    if (data.length > 0) {
      setLastEntry(data[0]);
      if (data.length > 1) {
        setPreviousEntry(data[1]);
        calculatePercentageChange(data[0].balance, data[1].balance);
      }
    }
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous > 0) {
      const change = ((current - previous) / previous) * 100;
      setPercentageChange(change.toFixed(2));
    } else {
      setPercentageChange(0);
    }
  };

  const fetchDeposits = async () => {
    const q = query(
      collection(db, "deposits"),
      where("poolId", "==", id),
      orderBy("timestamp", "desc"),
      limit(depositsLimit)
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDeposits(data);
  };

  const addEntry = async () => {
    await addDoc(collection(db, "entries"), {
      poolId: id,
      balance: newEntry.balance,
      pendingYield: newEntry.pendingYield,
      sol: newEntry.sol,
      usdc: newEntry.usdc,
      timestamp: new Date().toISOString(),
    });
    setNewEntry({ balance: "", pendingYield: "", sol: "", usdc: "" });
    setShowEntryForm(false);
    setMessage("✅ Entrada adicionada com sucesso!");
    fetchEntries();
    setTimeout(() => setMessage(""), 3000);
  };

  const addDeposit = async () => {
    await addDoc(collection(db, "deposits"), {
      poolId: id,
      total: newDeposit.total,
      sol: newDeposit.sol,
      usdc: newDeposit.usdc,
      timestamp: new Date().toISOString(),
    });
    setNewDeposit({ total: "", sol: "", usdc: "" });
    setShowDepositForm(false);
    setMessage("✅ Depósito adicionado com sucesso!");
    fetchDeposits();
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-primary text-white p-6">
      <h1 className="text-2xl font-bold text-center">📌 Detalhes da Pool</h1>

      {message && (
        <div className="text-center text-green-400 mt-4 font-medium">
          {message}
        </div>
      )}

      {/* 🔹 RESUMO TOTAL */}
      <div className="mt-6 p-6 bg-gray-900 rounded-lg text-center">
        <h2 className="text-lg font-bold">💰 Resumo Total</h2>
        <p className="text-xl mt-2">💵 Pending Yield: <span className="text-yellow-400">${lastEntry?.pendingYield || "0.00"}</span></p>
        <p className="text-xl">📥 Balance Total: <span className="text-green-400">${lastEntry?.balance || "0.00"}</span></p>
        <p className="text-xl">💵 Total de Depósitos: <span className="text-blue-400">${deposits.reduce((acc, deposit) => acc + parseFloat(deposit.total || 0), 0).toFixed(2)}</span></p>
      </div>

      {/* 🔹 ÚLTIMA ENTRADA DETALHADA */}
      {lastEntry && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg text-center">
          <h2 className="text-lg font-bold">📊 Última Atualização</h2>
          <p>Balance: <span className="text-green-400">${lastEntry.balance}</span> | Pending Yield: <span className="text-yellow-400">${lastEntry.pendingYield}</span></p>
          <p>SOL: <span className="text-blue-400">{lastEntry.sol}</span> | USDC: <span className="text-blue-400">{lastEntry.usdc}</span></p>
          <p className="text-gray-400">
            📅 {new Date(lastEntry.timestamp).toLocaleString()} /{" "}
            <span className={percentageChange >= 0 ? "text-green-400" : "text-red-400"}>
              {percentageChange >= 0 ? "+" : ""}
              {percentageChange}%
            </span>
          </p>
        </div>
      )}

      {/* 🔹 GRÁFICO */}
      {entries.length > 0 && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-bold text-center">📈 Histórico de Entradas</h2>
          <CandlestickChart entries={entries} />
        </div>
      )}

      {/* 🔹 FORMULÁRIO ENTRADA */}
      <div className="mt-6 p-6 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">➕ Nova Entrada</h2>
          <button
            className="bg-blue-600 px-4 py-2 rounded"
            onClick={() => setShowEntryForm(!showEntryForm)}
          >
            {showEntryForm ? "❌ Fechar" : "➕ Add Entrada"}
          </button>
        </div>

        {showEntryForm && (
          <div className="p-4 bg-gray-700 rounded-lg mb-4">
            <input type="number" placeholder="Balance ($)" className="input-field mb-2 w-full" value={newEntry.balance} onChange={(e) => setNewEntry({ ...newEntry, balance: e.target.value })} />
            <input type="number" placeholder="Pending Yield ($)" className="input-field mb-2 w-full" value={newEntry.pendingYield} onChange={(e) => setNewEntry({ ...newEntry, pendingYield: e.target.value })} />
            <input type="number" placeholder="SOL" className="input-field mb-2 w-full" value={newEntry.sol} onChange={(e) => setNewEntry({ ...newEntry, sol: e.target.value })} />
            <input type="number" placeholder="USDC" className="input-field mb-2 w-full" value={newEntry.usdc} onChange={(e) => setNewEntry({ ...newEntry, usdc: e.target.value })} />
            <button className="bg-green-600 px-4 py-2 rounded w-full" onClick={addEntry}>✅ Salvar Entrada</button>
          </div>
        )}
      </div>

      {/* 🔹 FORMULÁRIO DEPÓSITO */}
      <div className="mt-6 p-6 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">💰 Novo Depósito</h2>
          <button
            className="bg-green-600 px-4 py-2 rounded"
            onClick={() => setShowDepositForm(!showDepositForm)}
          >
            {showDepositForm ? "❌ Fechar" : "💰 Deposit"}
          </button>
        </div>

        {showDepositForm && (
          <div className="p-4 bg-gray-700 rounded-lg mb-4">
            <input type="number" placeholder="Total ($)" className="input-field mb-2 w-full" value={newDeposit.total} onChange={(e) => setNewDeposit({ ...newDeposit, total: e.target.value })} />
            <input type="number" placeholder="SOL" className="input-field mb-2 w-full" value={newDeposit.sol} onChange={(e) => setNewDeposit({ ...newDeposit, sol: e.target.value })} />
            <input type="number" placeholder="USDC" className="input-field mb-2 w-full" value={newDeposit.usdc} onChange={(e) => setNewDeposit({ ...newDeposit, usdc: e.target.value })} />
            <button className="bg-green-600 px-4 py-2 rounded w-full" onClick={addDeposit}>✅ Confirmar Depósito</button>
          </div>
        )}
      </div>

      {/* 🔹 HISTÓRICO DE ENTRADAS */}
      <div className="mt-6 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-bold">📜 Histórico de Entradas</h2>
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 bg-gray-700 rounded-lg mt-2">
            <p><strong>Balance:</strong> ${entry.balance} | <strong>Pending Yield:</strong> ${entry.pendingYield}</p>
          </div>
        ))}
        {entries.length >= entriesLimit && (
          <button className="bg-gray-600 px-4 py-2 rounded mt-4 w-full" onClick={() => setEntriesLimit(entriesLimit + 10)}>🔽 Mostrar Mais</button>
        )}
      </div>

      {/* 🔹 HISTÓRICO DE DEPÓSITOS */}
      <div className="mt-6 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-bold">💰 Histórico de Depósitos</h2>
        {deposits.map((deposit) => (
          <div key={deposit.id} className="p-4 bg-gray-700 rounded-lg mt-2">
            <p><strong>Total:</strong> ${deposit.total} | <strong>SOL:</strong> {deposit.sol} | <strong>USDC:</strong> {deposit.usdc}</p>
          </div>
        ))}
        {deposits.length >= depositsLimit && (
          <button className="bg-gray-600 px-4 py-2 rounded mt-4 w-full" onClick={() => setDepositsLimit(depositsLimit + 10)}>🔽 Mostrar Mais</button>
        )}
      </div>
    </div>
  );
}
