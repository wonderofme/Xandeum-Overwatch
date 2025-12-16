"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "bg-[#0a0a0f]/80 backdrop-blur-xl",
        "border-t border-white/10 border-b border-white/5",
        "rounded-xl p-6",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
        onClick && "cursor-pointer",
        className
      )}
      whileHover={
        hover
          ? {
              scale: 1.01,
              backgroundColor: "rgba(10, 10, 15, 0.9)",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.05)",
            }
          : {}
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

