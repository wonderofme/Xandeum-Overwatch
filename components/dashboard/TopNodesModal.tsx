"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { useEffect } from "react";
import { PNode } from "@/services/nodeService";
import { cn } from "@/lib/utils";

interface TopNodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: PNode[];
}

export function TopNodesModal({ isOpen, onClose, nodes }: TopNodesModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white/90">Top 25 Network Leaders</h2>
                    <p className="text-sm text-white/60 mt-1">Highest performing nodes by storage and uptime</p>
                  </div>
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
                <div className="space-y-2">
                  {nodes.map((node, index) => {
                    const storagePercentage = (node.storage / 500) * 100;
                    return (
                      <motion.div
                        key={node.pubkey}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className={cn(
                          "grid grid-cols-12 gap-4 px-4 py-3 rounded-lg",
                          "bg-white/[0.02] border border-white/5",
                          "hover:bg-white/[0.05] hover:border-white/10",
                          "transition-all",
                          index === 0 && "border-amber-500/50 bg-amber-500/5"
                        )}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex items-center justify-center">
                          {index === 0 ? (
                            <Trophy className="w-5 h-5 text-amber-400" />
                          ) : (
                            <span className="text-white/40 text-sm font-mono">#{index + 1}</span>
                          )}
                        </div>

                        {/* PubKey */}
                        <div className="col-span-4 font-mono text-sm text-white/90">
                          {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-4)}
                        </div>

                        {/* Location */}
                        <div className="col-span-2 text-sm text-white/70">{node.location}</div>

                        {/* Storage */}
                        <div className="col-span-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60">{node.storage.toFixed(1)} TB</span>
                            <span className="text-white/40">{storagePercentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-white/30 to-white/10 rounded-full"
                              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Uptime */}
                        <div className="col-span-2 text-sm text-white/70 font-mono">
                          {node.uptime.toFixed(1)}%
                        </div>

                        {/* IP */}
                        <div className="col-span-1 font-mono text-xs text-white/50">{node.ip}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

