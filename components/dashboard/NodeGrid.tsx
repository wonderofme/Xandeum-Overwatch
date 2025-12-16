"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { PNode } from "@/services/nodeService";
import { MapPin, HardDrive, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeCardProps {
  node: PNode;
  index: number;
}

function NodeCard({ node, index }: NodeCardProps) {
  const storagePercentage = (node.storage / 500) * 100; // Assuming 500TB is max

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <GlassCard className="h-full">
        <div className="space-y-4">
          {/* Header with Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white/90 font-semibold truncate mb-1">
                {node.pubkey.slice(0, 16)}...
              </p>
              <p className="text-white/40 text-sm font-mono">{node.ip}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {node.status === "active" ? (
                <div className="relative flex items-center justify-center">
                  {/* Pulsing ring */}
                  <div className="absolute w-3 h-3 rounded-full bg-white animate-ping opacity-75" />
                  {/* Solid center dot */}
                  <div className="relative w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-white/40" />
              )}
              <span className="text-white/60 text-xs uppercase">
                {node.status}
              </span>
            </div>
          </div>

          {/* Storage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <HardDrive className="w-4 h-4" />
                <span>Storage</span>
              </div>
              <span className="text-white/90 font-medium">
                {node.storage.toFixed(1)} TB
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-white/30 via-white/20 to-white/10 shimmer-bar"
                initial={{ width: 0 }}
                animate={{ width: `${storagePercentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Activity className="w-4 h-4" />
              <span>Uptime</span>
            </div>
            <span className="text-white/90 font-medium">{node.uptime.toFixed(2)}%</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-white/40 text-xs pt-2 border-t border-white/10">
            <MapPin className="w-3 h-3" />
            <span>
              {node.lat.toFixed(2)}°, {node.lng.toFixed(2)}°
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface NodeGridProps {
  nodes: PNode[];
}

export function NodeGrid({ nodes }: NodeGridProps) {
  return (
    <div className="px-4 pb-12">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-6 text-white/90"
      >
        Network Nodes
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nodes.map((node, index) => (
          <NodeCard key={node.pubkey} node={node} index={index} />
        ))}
      </div>
    </div>
  );
}

