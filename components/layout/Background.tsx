"use client";

export function Background() {
  return (
    <>
      <div className="void-bg" />
      {/* Orb 1: Light gray at top-left */}
      <div
        className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px] opacity-15 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
      />
      {/* Orb 2: Medium gray at bottom-right */}
      <div
        className="fixed bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] opacity-15 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
      />
      <div className="noise-overlay" />
    </>
  );
}

