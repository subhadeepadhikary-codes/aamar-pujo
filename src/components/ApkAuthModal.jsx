import React, { useState } from "react";
import { Sparkles, ShieldCheck, X } from "lucide-react";
import { loginWithGoogleMock } from "../utils/firebaseAuth";
import { isApkPlatform } from "../utils/platform";

export default function ApkAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [loading, setLoading] = useState(false);

  // Strictly disabled on Web/PWA
  if (!isOpen || !isApkPlatform()) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogleMock();
      if (onAuthSuccess) onAuthSuccess(user);
      if (onClose) onClose();
    } catch (err) {
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm p-6 rounded-3xl bg-[#160C22] border-2 border-amber-400 text-center space-y-4 shadow-2xl shadow-rose-950/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-md">
          📱
        </div>

        <div>
          <h3 className="text-base font-heritage font-bold text-white tracking-wide">
            Aamar Pujo Android App
          </h3>
          <p className="text-xs text-amber-300 font-bengali mt-0.5">
            গুগল দিয়ে সাইন ইন করুন
          </p>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Sync your visited pandals passport, live GPS route plans, and offline itineraries across your devices.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-slate-400 hover:text-white"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
