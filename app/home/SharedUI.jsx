// ─────────────────────────────────────────────────────────────────────────────
// SHARED DESIGN TOKENS (green-dark theme)
// bg:        #080E08   surface: #0E1A0E   card: #111C11
// border:    #1A2E1A   accent:  #22C55E   accent-dim: #16A34A
// text:      #F0FDF4   muted:   #6B7280   faint: #1F2D1F
// ─────────────────────────────────────────────────────────────────────────────

export function GreenDot({ active }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" : "bg-red-500"}`} />
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] bg-green-950 border border-green-700/60 text-green-300 text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl shadow-green-950/60 flex items-center gap-2 pointer-events-none">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      {msg}
    </div>
  );
}

export function Spinner({ sm }) {
  return (
    <span className={`inline-block border-2 border-green-900 border-t-green-400 rounded-full animate-spin flex-shrink-0 ${sm ? "w-3.5 h-3.5" : "w-5 h-5"}`} />
  );
}

export function PageLoader({ text = "Loading…" }) {
  return (
    <div className="min-h-screen bg-[#080E08] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-green-900/50">L</div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-[#080E08] border-t-green-400 rounded-full animate-spin" />
      </div>
      <p className="text-xs text-green-800 font-semibold tracking-widest uppercase animate-pulse">{text}</p>
    </div>
  );
}
