"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <motion.div className="relative z-10 text-center max-w-4xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-sm text-primary">Powered by LI.FI Earn</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your AI{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Fund Manager</span>
          <br />for DeFi Yield
        </h1>

        <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Analyze vaults across 20+ protocols and 17 chains. AI generates your optimal yield strategy. Execute with one click.
        </p>

        <motion.div className="flex gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link href="/app" className="px-8 py-3.5 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 text-lg">
            Launch App
          </Link>
          <a href="https://docs.li.fi/earn/overview" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 border border-card-border hover:border-primary/50 rounded-xl text-text-secondary hover:text-text-primary transition-all text-lg">
            Learn More
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
