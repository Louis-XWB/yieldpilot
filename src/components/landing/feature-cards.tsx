"use client";

import { motion } from "framer-motion";

const features = [
  { icon: "🧠", title: "AI Strategy Engine", description: "Advanced AI analyzes 672+ vaults across risk, yield, and diversification to build your optimal portfolio." },
  { icon: "⚡", title: "One-Click Execute", description: "Swap, bridge, and deposit in a single transaction. Powered by LI.FI Composer's cross-chain infrastructure." },
  { icon: "📊", title: "Portfolio Monitor", description: "Track all positions in real-time. Get AI-powered rebalancing suggestions when better opportunities appear." },
];

export function FeatureCards() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          DeFi Yield,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-positive">Simplified</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} className="glass-card p-8 hover:border-primary/30 transition-all group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
