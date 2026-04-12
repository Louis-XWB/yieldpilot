"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Allocation } from "@/lib/types";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function AllocationChart({ allocations }: { allocations: Allocation[] }) {
  const data = allocations.map((a) => ({
    name: `${a.vault_name} (${a.chain})`,
    value: a.percentage,
    protocol: a.protocol,
  }));

  return (
    <div className="flex items-center gap-8">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1A1A2E", border: "1px solid #2A2A4A", borderRadius: "8px", color: "#F8FAFC" }}
              formatter={(value) => [`${value}%`, "Allocation"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {allocations.map((a, i) => (
          <div key={a.vault_slug} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <div className="flex-1 text-sm">
              <span className="text-text-primary">{a.vault_name}</span>
              <span className="text-text-muted ml-2">{a.chain}</span>
            </div>
            <span className="font-mono text-sm text-text-secondary">{a.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
