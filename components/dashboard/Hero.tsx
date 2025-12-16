"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, Network, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
      {/* Gradient background element */}
      <div className="pointer-events-none absolute inset-0 top-[-25%] z-0 scale-150 select-none sm:scale-125">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
          }}
        />
      </div>

      <main className="container relative z-20 mx-auto flex flex-1 flex-col items-center justify-center">
        <section className="z-20 flex flex-col items-center justify-center gap-[18px] sm:gap-6">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.02] px-[18px] py-2 text-sm font-normal leading-5 text-white/60 backdrop-blur-sm transition-all hover:bg-white/[0.05] hover:text-white/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>New network analytics dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-[clamp(40px,10vw,64px)] leading-[1.2] font-bold tracking-tighter sm:text-[clamp(64px,12vw,96px)]"
          >
            <div className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
              Explore the <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Xandeum Network
              </span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-white/60 leading-7 font-normal sm:w-[600px] sm:text-lg"
          >
            Monitor, analyze, and explore the decentralized storage network. Track node performance,
            capacity, and health in real-time across the globe.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button className="group relative overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-medium text-[#030712] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button className="group relative overflow-hidden rounded-full border border-white/20 bg-white/[0.02] px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/[0.05] hover:border-white/30">
              <span className="relative z-10 flex items-center gap-2">
                <Network className="h-4 w-4" />
                View Network Map
              </span>
            </button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 w-full max-w-2xl relative"
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
                  type="text"
                  placeholder="Search by node address, IP, or location..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-base sm:text-lg"
                />
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

