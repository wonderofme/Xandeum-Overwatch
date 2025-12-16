"use client";

import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export interface SearchBarRef {
  focus: () => void;
}

export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  function SearchBar({ value, onChange, resultCount, totalCount }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasResults = value && resultCount !== undefined;

    useImperativeHandle(ref, () => ({
      focus: () => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // Scroll to search bar smoothly
            inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      },
    }));
  
  return (
    <motion.div
      id="search"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full relative ${hasResults ? 'mb-10' : 'mb-6'} scroll-mt-24`}
    >
      {/* Centered glow behind search bar */}
      <div
        className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          transform: "scale(1.2)",
        }}
      />
      <div className="bg-white/[0.02] backdrop-blur-2xl rounded-full p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border-0 transition-all hover:bg-white/[0.03]">
        <div className="flex items-center gap-4 px-2">
          <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search by node address, IP, or location..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-base sm:text-lg"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
      </div>
      {/* Search results count */}
      {value && resultCount !== undefined && totalCount !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-3 text-center text-sm text-white/60 z-10"
        >
          {resultCount === 0 ? (
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10">
              No nodes found
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {resultCount} of {totalCount} nodes
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});

