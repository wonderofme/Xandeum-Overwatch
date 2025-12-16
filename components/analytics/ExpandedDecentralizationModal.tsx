"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { PNode } from "@/services/nodeService";
import { useMemo } from "react";

interface ExpandedDecentralizationModalProps {
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
          {payload[0].name}: {payload[0].value} nodes
        </p>
      </div>
    );
  }
  return null;
};

// Group nodes by region
function groupNodesByRegion(nodes: PNode[]): Array<{ name: string; value: number }> {
  const regionMap = new Map<string, number>();

  nodes.forEach((node) => {
    let region = "Unknown";
    
    if (node.location) {
      const parts = node.location.split(",");
      if (parts.length > 1) {
        const country = parts[parts.length - 1].trim();
        if (country === "US" || country === "MX" || country === "BR" || country === "CA") {
          region = "North America";
        } else if (country === "GB" || country === "DE" || country === "FR" || country === "RU") {
          region = "Europe";
        } else if (country === "JP" || country === "CN" || country === "SG" || country === "AU") {
          region = "Asia Pacific";
        } else {
          region = "Other";
        }
      }
    } else {
      const firstOctet = parseInt(node.ip.split(".")[0]);
      if (firstOctet >= 0 && firstOctet < 64) {
        region = "North America";
      } else if (firstOctet >= 64 && firstOctet < 128) {
        region = "Europe";
      } else if (firstOctet >= 128 && firstOctet < 192) {
        region = "Asia Pacific";
      } else {
        region = "Other";
      }
    }

    regionMap.set(region, (regionMap.get(region) || 0) + 1);
  });

  return Array.from(regionMap.entries()).map(([name, value]) => ({ name, value }));
}

const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export function ExpandedDecentralizationModal({
  isOpen,
  onClose,
  nodes,
}: ExpandedDecentralizationModalProps) {
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

  const regionData = useMemo(() => groupNodesByRegion(nodes), [nodes]);

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
                  <h2 className="text-2xl font-bold text-white/90">Node Decentralization</h2>
                  <p className="text-sm text-white/60 mt-1">Geographic distribution of network nodes</p>
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
                    <h3 className="text-xl font-semibold text-white/90 mb-2">Geographic Distribution</h3>
                    <p className="text-sm text-white/60">
                      Total nodes: {nodes.length} | Active nodes: {nodes.filter(n => n.status === "active").length}
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%" minHeight={500}>
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={150}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                        labelLine={false}
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={50}
                        iconType="circle"
                        wrapperStyle={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}
                      />
                    </PieChart>
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

