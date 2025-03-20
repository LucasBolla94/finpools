"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegister && !acceptTerms) {
      setError("Você deve aceitar os termos para continuar.");
      return;
    }

    setError("");
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Salvar usuário no Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        setMessage("Conta criada com sucesso! Agora você pode fazer login.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login efetuado com sucesso!");
        setTimeout(() => {
          router.push("/dashboard"); // Redireciona após 2 segundos
        }, 2000);
      }
    } catch (error) {
      setError("Erro: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary text-white">
      <div className="p-6 bg-primary rounded-lg shadow-lg w-80 border border-white">
        <h2 className="text-xl font-bold text-center">{isRegister ? "Registrar" : "Login"}</h2>

        {message && <p className="text-green-400 text-center mt-2">{message}</p>}
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}

        <form onSubmit={handleAuth} className="mt-4 flex flex-col">
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-secondary border border-white mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="p-2 rounded bg-secondary border border-white mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isRegister && (
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-sm">
                Aceito os <span className="underline cursor-pointer">termos e condições</span>
              </label>
            </div>
          )}

          <button type="submit" className="bg-blue-600 p-2 rounded mt-4">
            {isRegister ? "Registrar" : "Entrar"}
          </button>
        </form>

        <button
          className="text-sm mt-4 underline w-full text-center"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
            setError("");
          }}
        >
          {isRegister ? "Já tem uma conta? Login" : "Criar nova conta"}
        </button>
      </div>
    </div>
  );
}
