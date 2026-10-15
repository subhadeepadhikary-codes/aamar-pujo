import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, Share2, Check } from "lucide-react";
import logoImg from "../assets/logo.png";

const BANNER_DISMISSED_KEY = "aamar_pwa_banner_dismissed";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until verified
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Detect if already running in standalone PWA mode
    const standaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches || 
      window.navigator.standalone === true;
    
    setIsStandalone(standaloneMode);

    // 2. Check if dismissed for current session
    try {
      const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
      if (!dismissed && !standaloneMode) {
        setIsDismissed(false);
      }
    } catch {
      if (!standaloneMode) setIsDismissed(false);
    }

    // 3. Capture Android / Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standaloneMode) {
        setIsDismissed(false);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch {
      // storage fallback
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsDismissed(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("PWA install error:", err);
      }
      return;
    }

    // iOS Safari or browsers without beforeinstallprompt
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos) {
      setShowIosGuide(true);
    } else {
      alert("To install Aamar Pujo: Tap your browser's menu (⋮ or share) and select 'Install app' or 'Add to Home screen'.");
    }
  };

  if (isStandalone || isDismissed || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Pill Banner directly above the mobile bottom taskbar */}
      <div 
        className="fixed left-2.5 right-2.5 bottom-[64px] z-40 md:hidden bg-gradient-to-r from-[#1A0E28]/95 via-[#12081C]/95 to-[#1A0E28]/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl p-2.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-2 animate-fadeIn select-none"
        role="alert"
        aria-label="Install Aamar Pujo App"
      >
        {/* Left: App Icon & Info */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-md">
              <img 
                src={logoImg} 
                alt="Aamar Pujo App Icon" 
                className="w-full h-full object-contain rounded-[10px] bg-[#120D17]"
              />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <h4 className="text-xs font-black text-white truncate tracking-tight">
                Install Aamar Pujo App
              </h4>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold flex-shrink-0">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-amber-200/80 truncate">
              Edge-to-edge full screen & zero browser bars!
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center space-x-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>Install</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Dismiss"
            aria-label="Dismiss app install banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Safari 3-Step Guide Modal */}
      {showIosGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowIosGuide(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#120B1C] border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-sm">Add to Home Screen (iOS)</h4>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs text-slate-200 space-y-3 list-decimal list-inside leading-relaxed">
              <li>
                Tap the <span className="font-bold text-amber-300">Share button</span> (square with arrow ⎋) at the bottom of Safari.
              </li>
              <li>
                Scroll down the share sheet and tap <span className="font-bold text-amber-300">"Add to Home Screen"</span> (+).
              </li>
              <li>
                Tap <span className="font-bold text-amber-300">"Add"</span> in the top right corner.
              </li>
            </ol>

            <button
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs hover:from-amber-300 hover:to-amber-400 transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
