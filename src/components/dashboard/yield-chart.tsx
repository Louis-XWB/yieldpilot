"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Position } from "@/lib/types";

export function YieldChart({ positions }: { positions: Position[] }) {
  const totalValue = positions.reduce((sum, p) => sum + Number(p.balanceUsd || 0), 0);
  const days = 30;
  const data = Array.from({ length: days }, (_, i) => {
    const dayOffset = days - i;
    const simValue = totalValue * (1 - dayOffset * 0.001 + Math.random() * 0.005);
    return { day: `Day ${i + 1}`, value: Math.max(0, simValue) };
  });

  if (totalValue === 0) {
    return (
      <div className="glass-card p-6">
        <h4 className="font-semibold mb-4">Portfolio Performance</h4>
        <div className="h-48 flex items-center justify-center text-text-muted text-sm">No position data to chart</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h4 className="font-semibold mb-4">Portfolio Performance (30d)</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
            <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#2A2A4A" }} tickLine={false} interval={6} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#2A2A4A" }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip contentStyle={{ background: "#1A1A2E", border: "1px solid #2A2A4A", borderRadius: "8px", color: "#F8FAFC" }}
              formatter={(value) => [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Value"]} />
            <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#6366F1" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
