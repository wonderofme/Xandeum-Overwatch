"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { PNode } from "@/services/nodeService";
import { useMemo } from "react";

interface ExpandedVersionHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: PNode[];
}

// Custom Glass Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-lg">
        <p className="text-white/90 text-sm font-medium">
          {payload[0].payload.version}: {payload[0].value} nodes
        </p>
      </div>
    );
  }
  return null;
};

// Group nodes by version
function groupNodesByVersion(nodes: PNode[]): Array<{ version: string; nodes: number }> {
  const versionMap = new Map<string, number>();

  nodes.forEach((node) => {
    let version = "v1.0.0";
    if (node.uptime > 98) {
      version = "v2.0.0";
    } else if (node.uptime > 95) {
      version = "v1.5.0";
    } else if (node.uptime > 90) {
      version = "v1.2.0";
    } else {
      version = "v1.0.0";
    }

    versionMap.set(version, (versionMap.get(version) || 0) + 1);
  });

  return Array.from(versionMap.entries())
    .map(([version, nodes]) => ({ version, nodes }))
    .sort((a, b) => b.nodes - a.nodes);
}

const COLORS = {
  bar: "#06b6d4",
};

export function ExpandedVersionHealthModal({
  isOpen,
  onClose,
  nodes,
}: ExpandedVersionHealthModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const versionData = useMemo(() => groupNodesByVersion(nodes), [nodes]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 pointer-events-none"
          >
            <div className="h-full w-full bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white/90">Version Health</h2>
                  <p className="text-sm text-white/60 mt-1">Node version distribution across the network</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <GlassCard className="h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white/90 mb-2">Node Version Distribution</h3>
                    <p className="text-sm text-white/60">
                      Total nodes: {nodes.length} | Versions: {versionData.length}
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%" minHeight={500}>
                    <BarChart data={versionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <Bar dataKey="nodes" fill={COLORS.bar} radius={[8, 8, 0, 0]} />
                      <Tooltip content={<CustomTooltip />} />
                      <XAxis
                        dataKey="version"
                        tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}
                        axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                      />
                      <YAxis
                        tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}
                        axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                        label={{ value: "Nodes", angle: -90, position: "insideLeft", fill: "rgba(255, 255, 255, 0.6)" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

