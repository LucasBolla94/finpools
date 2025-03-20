"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [pools, setPools] = useState([]); // ✅ Declarado corretamente
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState({
    priceMin: "",
    priceMax: "",
    pair: "",
    balance: "",
    sol: "",
    usdc: "",
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchPools(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPools = async (userId) => {
    try {
      const q = query(collection(db, "pools"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      console.log("Pools encontradas:", data); // ✅ Verificar no console
      setPools(data);
    } catch (error) {
      console.error("Erro ao buscar pools:", error);
    }
  };

  const createPool = async () => {
    if (!user) return;

    if (pools.length >= 3) {
      setError("❌ Você só pode criar até 3 pools.");
      return;
    }

    try {
      await addDoc(collection(db, "pools"), {
        userId: user.uid,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        pair: data.pair,
        balance: data.balance,
        sol: data.sol,
        usdc: data.usdc,
        lastUpdate: new Date().toISOString(),
      });

      setMessage("✅ Pool criada com sucesso!");
      setError("");
      setData({ priceMin: "", priceMax: "", pair: "", balance: "", sol: "", usdc: "" });
      fetchPools(user.uid);

      setTimeout(() => {
        setMessage("");
        setShowForm(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao criar pool:", error);
      setError("❌ Erro ao criar pool. Tente novamente.");
    }
  };

  const isFormFilled = Object.values(data).every((value) => value.trim() !== "");

  return (
    <div className="min-h-screen bg-primary text-white p-6">
      <h1 className="text-3xl font-bold text-center">📊 Painel de Liquidez</h1>
      <p className="text-center text-gray-300 mt-2">Gerencie suas pools de liquidez de forma simples e rápida.</p>

      {/* Botão para adicionar uma nova Pool */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 px-6 py-3 rounded-lg text-lg font-semibold"
          disabled={pools.length >= 3}
        >
          {showForm ? "❌ Fechar Formulário" : "➕ Criar Pool"}
        </button>
        {pools.length >= 3 && <p className="text-red-400 text-sm mt-2">❌ Limite de 3 pools atingido.</p>}
      </div>

      {/* Mensagem de erro ou sucesso */}
      {message && <p className="text-green-400 text-center mt-4">{message}</p>}
      {error && <p className="text-red-400 text-center mt-4">{error}</p>}

      {/* Formulário Criar Pool */}
      {showForm && pools.length < 3 && (
        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <h2 className="text-lg font-semibold text-center">🎯 Defina sua Pool</h2>
          <p className="text-sm text-gray-400 text-center mb-4">Preencha os dados abaixo.</p>
          <div className="grid gap-2">
            <input type="text" placeholder="Preço Min ($)" className="input-field"
              value={data.priceMin} onChange={(e) => setData({ ...data, priceMin: e.target.value })} />
            <input type="text" placeholder="Preço Max ($)" className="input-field"
              value={data.priceMax} onChange={(e) => setData({ ...data, priceMax: e.target.value })} />
            <input type="text" placeholder="Par (ex: SOL/USDC)" className="input-field"
              value={data.pair} onChange={(e) => setData({ ...data, pair: e.target.value })} />
            <input type="text" placeholder="Balance Total ($)" className="input-field"
              value={data.balance} onChange={(e) => setData({ ...data, balance: e.target.value })} />
            <input type="text" placeholder="Quantidade SOL" className="input-field"
              value={data.sol} onChange={(e) => setData({ ...data, sol: e.target.value })} />
            <input type="text" placeholder="Quantidade USDC" className="input-field"
              value={data.usdc} onChange={(e) => setData({ ...data, usdc: e.target.value })} />
          </div>

          {isFormFilled && (
            <button onClick={createPool} className="bg-green-600 px-4 py-2 rounded mt-4 w-full">
              ✅ Salvar Pool
            </button>
          )}
        </div>
      )}

      {/* Listagem das Pools */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-center">📌 Minhas Pools</h2>
        {pools.length === 0 ? (
          <p className="text-center text-gray-400 mt-2">Nenhuma pool criada ainda. Comece adicionando uma acima!</p>
        ) : (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            {pools.map((pool) => (
              <Link href={`/dashboard/pool/${pool.id}`} key={pool.id}>
                <div className="p-4 bg-gray-800 rounded-lg mb-2 cursor-pointer hover:bg-gray-700 transition">
                  <h3 className="text-lg font-bold">{pool.pair}</h3>
                  <p>Última Entrada: ${pool.balance} | SOL: {pool.sol} | USDC: {pool.usdc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
