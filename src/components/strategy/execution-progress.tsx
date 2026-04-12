"use client";

import { motion } from "framer-motion";
import { ExecutionStep } from "@/lib/types";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-text-muted", bg: "bg-text-muted/20" },
  quoting: { label: "Getting Quote...", color: "text-primary", bg: "bg-primary/20" },
  approving: { label: "Approve in Wallet", color: "text-warning", bg: "bg-warning/20" },
  executing: { label: "Executing...", color: "text-primary", bg: "bg-primary/20" },
  completed: { label: "Completed", color: "text-positive", bg: "bg-positive/20" },
  failed: { label: "Failed", color: "text-danger", bg: "bg-danger/20" },
};

export function ExecutionProgress({ steps }: { steps: ExecutionStep[] }) {
  const completed = steps.filter((s) => s.status === "completed").length;
  const progress = (completed / steps.length) * 100;

  return (
    <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Executing Strategy</h3>
        <span className="text-sm text-text-secondary font-mono">{completed}/{steps.length} complete</span>
      </div>

      <div className="w-full h-2 bg-card-border rounded-full mb-6 overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const config = STATUS_CONFIG[step.status];
          return (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-background/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                  {step.status === "completed" ? (
                    <span className="text-positive text-sm">✓</span>
                  ) : step.status === "failed" ? (
                    <span className="text-danger text-sm">✗</span>
                  ) : step.status === "pending" ? (
                    <span className="text-text-muted text-xs">{i + 1}</span>
                  ) : (
                    <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{step.allocation.vault_name}</div>
                  <div className="text-xs text-text-muted">{step.allocation.chain} · ${step.allocation.amount_usd.toLocaleString()} · {step.allocation.percentage}%</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                {step.txHash && (
                  <a href={`https://basescan.org/tx/${step.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Tx</a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {steps.every((s) => s.status === "completed") && (
        <motion.div className="mt-6 p-4 rounded-xl bg-positive/10 border border-positive/20 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-positive font-semibold">Strategy executed successfully!</p>
          <a href="/app/dashboard" className="text-sm text-primary hover:underline mt-1 inline-block">View Dashboard →</a>
        </motion.div>
      )}
    </motion.div>
  );
}
