"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CandlestickChart({ entries }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (entries.length > 0) {
      const formattedData = entries.map((entry) => ({
        name: new Date(entry.timestamp).toLocaleDateString(),
        balance: parseFloat(entry.balance),
        pendingYield: parseFloat(entry.pendingYield),
      }));
      setChartData(formattedData);
    }
  }, [entries]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#ffffff" />
        <YAxis stroke="#ffffff" />
        <Tooltip />
        <Bar dataKey="balance" fill="#52c41a" /> {/* Verde para saldo positivo */}
        <Bar dataKey="pendingYield" fill="#ff4d4f" /> {/* Vermelho para yield pendente */}
      </BarChart>
    </ResponsiveContainer>
  );
}
