"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Database, Server, Activity, Trophy } from "lucide-react";
import { PNode } from "@/services/nodeService";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ label, value, unit, icon, delay = 0 }: StatCardProps) {
  const count = useMotionValue(0);
  const spring = useSpring(count, { damping: 50, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(0);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplayValue(Math.round(latest * 100) / 100);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      count.set(value);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, count, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-cyan-500/70 mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl text-white drop-shadow-[0_0_5px_rgba(6,182,212,0.6)]">
                {displayValue.toLocaleString()}
              </span>
              <span className="text-white/60 text-lg font-mono">{unit}</span>
            </div>
          </div>
          <div className="text-white/20">{icon}</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface StatsRowProps {
  totalCapacity: number; // in PB
  activeNodes: number;
  networkHealth: number; // percentage
  topNode: PNode | null;
  onTopNodesClick?: () => void;
}

export function StatsRow({ totalCapacity, activeNodes, networkHealth, topNode, onTopNodesClick }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <StatCard
        label="Total Capacity"
        value={totalCapacity}
        unit="PB"
        icon={<Database className="w-8 h-8" />}
        delay={0.2}
      />
      <div className="relative">
        {/* Green glow behind Active Nodes */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-xl -z-10" />
        <StatCard
          label="Active Nodes"
          value={activeNodes}
          unit=""
          icon={<Server className="w-8 h-8" />}
          delay={0.4}
        />
      </div>
      <StatCard
        label="Network Health"
        value={networkHealth}
        unit="%"
        icon={<Activity className="w-8 h-8" />}
        delay={0.6}
      />
      
      {/* Top Performing Node - Golden Card */}
      {topNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative"
        >
          {/* Golden glow behind Top Node */}
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-xl -z-10" />
          <div
            onClick={onTopNodesClick ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Top Nodes clicked");
              onTopNodesClick();
            } : undefined}
            className={cn(
              "bg-[#0a0a0f]/80 backdrop-blur-xl border border-amber-500/50 rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.2),0_0_20px_rgba(251,191,36,0.1)] relative overflow-hidden",
              onTopNodesClick && "cursor-pointer hover:border-amber-400/70 transition-colors"
            )}
          >
            {/* Subtle golden inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <p className="text-amber-400/80 text-sm font-sans font-semibold">Network Leader</p>
                </div>
                <div className="mb-2">
                  <p className="text-2xl md:text-3xl font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(6,182,212,0.6)]">
                    {topNode.pubkey.slice(0, 4)}...{topNode.pubkey.slice(-4)}
                  </p>
                </div>
                <p className="text-white/60 text-xs font-mono">
                  {topNode.storage.toFixed(1)} TB • {topNode.uptime.toFixed(1)}% Uptime
                </p>
              </div>
              <div className="text-amber-400/20">
                <Trophy className="w-8 h-8" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

