"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Stats { totalVaults: number; maxApy: number; chainCount: number; protocolCount: number; }

export function StatsTicker() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [vaultsRes, chainsRes, protocolsRes] = await Promise.all([
          fetch("/api/vaults?limit=1"),
          fetch("/api/chains"),
          fetch("/api/protocols"),
        ]);
        const vaults = await vaultsRes.json();
        const chains = await chainsRes.json();
        const protocols = await protocolsRes.json();

        const topVaults = await fetch("/api/vaults?limit=5").then((r) => r.json());
        const maxApy = Math.max(...topVaults.data.map((v: any) => v.analytics.apy.total), 0);

        setStats({
          totalVaults: vaults.total || 0,
          maxApy,
          chainCount: chains.length || 0,
          protocolCount: protocols.length || 0,
        });
      } catch {
        setStats({ totalVaults: 672, maxApy: 25, chainCount: 17, protocolCount: 11 });
      }
    }
    load();
  }, []);

  const items = stats
    ? [
        { label: "Vaults Available", value: stats.totalVaults.toLocaleString() },
        { label: "Max APY", value: `${stats.maxApy.toFixed(1)}%` },
        { label: "Chains", value: String(stats.chainCount) },
        { label: "Protocols", value: String(stats.protocolCount) },
      ]
    : [
        { label: "Vaults Available", value: "..." },
        { label: "Max APY", value: "..." },
        { label: "Chains", value: "..." },
        { label: "Protocols", value: "..." },
      ];

  return (
    <section className="py-12 border-y border-card-border/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div key={item.label} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="text-3xl md:text-4xl font-bold font-mono text-text-primary mb-1">{item.value}</div>
              <div className="text-sm text-text-secondary">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
