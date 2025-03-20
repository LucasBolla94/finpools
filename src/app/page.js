"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-white p-6">
      <h1 className="text-4xl font-bold text-center">FinPools</h1>
      <p className="text-lg text-center mt-4 max-w-md">
        Controle seus investimentos em pools de liquidez de forma simples e segura.
      </p>
      <div className="mt-6 w-full max-w-xs flex flex-col gap-4">
        <Link href="/login">
          <button className="bg-blue-600 px-6 py-3 rounded w-full text-lg font-semibold">
            Entrar
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="bg-gray-700 px-6 py-3 rounded w-full text-lg font-semibold">
            Explorar
          </button>
        </Link>
      </div>
    </div>
  );
}
