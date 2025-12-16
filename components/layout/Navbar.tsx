"use client";

import { motion } from "framer-motion";
import { Radar, Menu, X, Search } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  liveStatus?: {
    isLive: boolean;
    nodeCount: number;
    lastUpdated: Date;
  };
  onSearchClick?: () => void;
}

export function Navbar({ liveStatus, onSearchClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-white/[0.02] backdrop-blur-md"
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Radar className="h-6 w-6 text-white/90" />
          </div>
          <span className="text-xl font-sans font-bold text-white">
            Xandeum <span className="font-light text-white/50">Overwatch</span>
          </span>
        </motion.button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#charts"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white/90"
          >
            Analytics
          </a>
          <a
            href="https://docs.xandeum.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white/60 transition-colors hover:text-white/90"
          >
            Xandeum Docs
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              onSearchClick?.();
            }}
            className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 transition-colors"
            title="Search nodes"
          >
            <Search className="w-4 h-4 text-white/60" />
          </button>
          
          {/* Live Feed Status Indicator */}
          {liveStatus && (
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="relative flex items-center justify-center">
                {liveStatus.isLive ? (
                  <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                  {liveStatus.isLive ? "LIVE FEED" : "SIMULATION"}
                </span>
                <span className="text-xs text-white/50 font-mono">
                  {liveStatus.nodeCount} nodes • {formatTime(liveStatus.lastUpdated)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white/60 hover:text-white/90"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/10 bg-white/[0.02] backdrop-blur-xl md:hidden"
        >
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <a
              href="#charts"
              className="text-sm font-medium text-white/60 transition-colors hover:text-white/90"
            >
              Analytics
            </a>
            <a
              href="https://docs.xandeum.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white/60 transition-colors hover:text-white/90"
            >
              Xandeum Docs
            </a>
            <button
              onClick={(e) => {
                e.preventDefault();
                onSearchClick?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white/90 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 w-full text-left"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
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

