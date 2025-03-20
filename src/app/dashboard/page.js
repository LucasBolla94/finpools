"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
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

  return (
    <div className="min-h-screen bg-primary text-white p-6">
      <h1 className="text-3xl font-bold text-center">📊 Painel de Liquidez</h1>
      <p className="text-center text-gray-300 mt-2">Gerencie suas pools de liquidez de forma simples e rápida.</p>

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
