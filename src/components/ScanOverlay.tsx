

export default function ScanOverlay() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      <div className="relative w-full max-w-sm h-1 bg-gray-800 rounded mb-8 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-primary animate-progress w-full origin-left"></div>
      </div>

      {/* Grid Scan Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(black,transparent)] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-x-0 h-1 bg-secondary/50 blur shadow-[0_0_10px_#22D3EE] animate-scan-y top-0"></div>

      {/* Character */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-secondary rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <img src="/assets/moon_cat_scan.png" alt="Scanning..." className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

        {/* Magic Circle Ring */}
        <div className="absolute inset-0 border-4 border-secondary/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
      </div>

      <div className="text-center space-y-2 relative z-10">
        <h2 className="text-2xl font-bold text-white animate-pulse">解析中だぞ...</h2>
        <p className="text-secondary font-mono text-sm">魔力を使って深層心理（ピクセル）を覗くぞ</p>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes scan-y {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-progress { animation: progress 3s ease-in-out infinite; }
        .animate-scan-y { animation: scan-y 2s linear infinite; }
      `}</style>
    </div>
  );
}
