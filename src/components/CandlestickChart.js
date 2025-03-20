"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export default function CandlestickChart({ entries }) {
  if (!entries || entries.length === 0) return <p className="text-center text-gray-400">Nenhuma entrada registrada.</p>;

  // Ordenar entradas por timestamp
  const sortedEntries = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Criar os dados formatados para o gráfico
  const chartData = sortedEntries.map((entry, index, arr) => {
    const balance = parseFloat(entry.balance) || 0;
    const pendingYield = parseFloat(entry.pendingYield) || 0;
    const totalValue = balance + pendingYield;

    // Valor anterior para comparação
    const prevTotalValue = index > 0 ? parseFloat(arr[index - 1].balance) + parseFloat(arr[index - 1].pendingYield) : totalValue;

    return {
      name: new Date(entry.timestamp).toLocaleDateString(),
      value: totalValue,
      color: totalValue >= prevTotalValue ? "#4CAF50" : "#FF5252", // Verde se subiu, vermelho se caiu
    };
  });

  return (
    <div className="w-full h-64">
      <h3 className="text-center text-sm text-gray-300 mb-2">
        📊 O gráfico exibe a evolução do saldo (Balance + Pending Yield). Se o valor atual for maior que o anterior, a barra será verde; caso contrário, será vermelha.
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
