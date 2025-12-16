"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { PNode } from "@/services/nodeService";
import { cn } from "@/lib/utils";
import { useBookmarkStore } from "@/stores/useBookmarkStore";

interface DataGridProps {
  nodes: PNode[];
  onNodeHover: (node: PNode | null) => void;
}

type ViewMode = "all" | "favorites";

export function DataGrid({ nodes, onNodeHover }: DataGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Limit to 25 nodes per page for performance
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarkStore();

  // Reset to page 1 when view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Filter nodes based on view mode
  const allDisplayedNodes =
    viewMode === "favorites"
      ? nodes.filter((node) => isBookmarked(node.pubkey))
      : nodes;

  // Paginate nodes
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedNodes = allDisplayedNodes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allDisplayedNodes.length / itemsPerPage);

  const activeCount = allDisplayedNodes.filter((n) => n.status === "active").length;

  return (
    <div className="space-y-4">
      {/* Header with LIVE indicator and filter toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4" data-no-expand>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-sans font-bold text-white/90 tracking-tight">NETWORK NODES</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              LIVE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter Toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all",
                viewMode === "all"
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/60 hover:text-white/80"
              )}
            >
              All Nodes
            </button>
            <button
              onClick={() => setViewMode("favorites")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all",
                viewMode === "favorites"
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/60 hover:text-white/80"
              )}
            >
              Favorites Only
            </button>
          </div>
          <div className="text-sm text-white/60 font-mono">
            {activeCount} / {allDisplayedNodes.length} Active
          </div>
        </div>
      </div>

      {/* Scrollable container for mobile */}
      <div className="overflow-x-auto md:overflow-x-visible -mx-4 md:mx-0">
        <div className="min-w-[600px] md:min-w-0">
          {/* Table Header */}
          <div
            className="grid gap-4 px-4 py-2 text-xs font-sans font-semibold text-white/40 uppercase tracking-widest border-b border-white/10"
            style={{
              gridTemplateColumns: "50px repeat(12, minmax(0, 1fr))",
            }}
          >
            <div>⭐</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-3 md:col-span-4">PubKey</div>
            <div className="hidden md:block md:col-span-2">Location</div>
            <div className="col-span-2">Storage</div>
            <div className="col-span-1">Uptime</div>
            <div className="hidden md:block md:col-span-2">IP</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
            {displayedNodes.length === 0 && viewMode === "favorites" ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Star className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/60 text-sm font-mono">No bookmarks yet</p>
                <p className="text-white/40 text-xs mt-2">Click the star icon to bookmark your favorite nodes</p>
              </div>
            ) : (
              displayedNodes.map((node, index) => {
          const storagePercentage = (node.storage / 500) * 100;
          return (
            <motion.div
              key={node.pubkey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => onNodeHover(node)}
              onMouseLeave={() => onNodeHover(null)}
              className={cn(
                "grid gap-4 px-4 py-3 rounded-lg",
                "bg-white/[0.02] border border-white/5",
                "hover:bg-white/[0.05] hover:border-white/10",
                "transition-all"
              )}
              style={{
                gridTemplateColumns: "50px repeat(12, minmax(0, 1fr))",
              }}
            >
              {/* Star Bookmark */}
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(node);
                  }}
                  className={cn(
                    "p-1.5 rounded transition-all hover:scale-110",
                    "focus:outline-none focus:ring-2 focus:ring-white/20"
                  )}
                >
                  <Star
                    className={cn(
                      "w-4 h-4 transition-all",
                      isBookmarked(node.pubkey)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-600"
                    )}
                  />
                </button>
              </div>

              {/* Status */}
              <div
                className="flex items-center cursor-pointer"
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {node.status === "active" ? (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                )}
              </div>

              {/* PubKey */}
              <div
                className="col-span-3 md:col-span-4 font-mono text-sm text-white/90 cursor-pointer"
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-4)}
              </div>

              {/* Location - Hidden on mobile */}
              <div
                className="hidden md:block md:col-span-2 text-sm text-white/70 cursor-pointer"
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {node.location}
              </div>

              {/* Storage */}
              <div
                className="col-span-2 space-y-1 cursor-pointer"
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
              >
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
              <div
                className="text-sm text-white/80 font-mono cursor-pointer"
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {node.uptime.toFixed(1)}%
              </div>

              {/* IP - Hidden on mobile */}
              <div
                className="hidden md:block md:col-span-2 font-mono text-xs text-white/80 cursor-pointer"
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {node.ip}
              </div>
            </motion.div>
              );
            })
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-white/60 font-mono">
                Page {currentPage} of {totalPages} ({allDisplayedNodes.length} total nodes)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all",
                    "bg-white/5 border border-white/10",
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/10 text-white"
                  )}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all",
                    "bg-white/5 border border-white/10",
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/10 text-white"
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

