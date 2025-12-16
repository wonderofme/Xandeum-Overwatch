"use client";

import { NetworkStatus as StatusType } from "@/services/xandeum";
import { motion } from "framer-motion";

interface NetworkStatusProps {
  status: StatusType;
  nodeCount: number;
  lastUpdated: Date;
}

export function NetworkStatus({ status, nodeCount, lastUpdated }: NetworkStatusProps) {
  const isLive = status === "live";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isLive ? (
              <>
                <div className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
              {isLive ? "LIVE FEED" : "SIMULATION"}
            </span>
            <span className="text-xs text-white/50 font-mono">
              {nodeCount} nodes • {formatTime(lastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  } else {
    return `${Math.floor(seconds / 3600)}h ago`;
  }
}

