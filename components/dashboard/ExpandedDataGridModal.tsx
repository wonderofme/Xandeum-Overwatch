"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { DataGrid } from "./DataGrid";
import { PNode } from "@/services/nodeService";

interface ExpandedDataGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: PNode[];
  onNodeHover: (node: PNode | null) => void;
}

export function ExpandedDataGridModal({
  isOpen,
  onClose,
  nodes,
  onNodeHover,
}: ExpandedDataGridModalProps) {
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
                  <h2 className="text-2xl font-bold text-white/90">Network Nodes</h2>
                  <p className="text-sm text-white/60 mt-1">Complete network node listing with detailed information</p>
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
                <DataGrid nodes={nodes} onNodeHover={onNodeHover} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

