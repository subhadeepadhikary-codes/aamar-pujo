import React, { useState, useEffect } from "react";
import { Download, X, Share2, Rocket, ExternalLink, CheckCircle2 } from "lucide-react";
import logoImg from "../assets/logo.png";

const BANNER_DISMISSED_KEY = "aamar_pwa_dismissed_until";
const PWA_INSTALLED_KEY = "aamar_pwa_installed";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until checked
  const [isInstalledPreviously, setIsInstalledPreviously] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showOpenAppHelp, setShowOpenAppHelp] = useState(false);

  useEffect(() => {
    // 1. Detect if running inside standalone PWA mode
    const standaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches || 
      window.navigator.standalone === true;
    
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Check if previously installed
    try {
      const installedFlag = localStorage.getItem(PWA_INSTALLED_KEY);
      if (installedFlag === "true") {
        setIsInstalledPreviously(true);
      }
    } catch {
      // storage fallback
    }

    // 3. Check persistent dismissal in localStorage (14 days cooldown)
    try {
      const dismissedUntil = localStorage.getItem(BANNER_DISMISSED_KEY);
      if (dismissedUntil) {
        const expiry = parseInt(dismissedUntil, 10);
        if (Date.now() < expiry) {
          setIsDismissed(true);
          return;
        }
      }
    } catch {
      // storage fallback
    }

    // If not in standalone and not within dismissal cooldown, show banner
    setIsDismissed(false);

    // 4. Capture Chromium / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standaloneMode) {
        setIsDismissed(false);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalledPreviously(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, "true");
      } catch {}
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
      // Remember dismissal for 14 days so returning users aren't nagged
      const expiry = Date.now() + 14 * 24 * 60 * 60 * 1000;
      localStorage.setItem(BANNER_DISMISSED_KEY, expiry.toString());
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
          setIsInstalledPreviously(true);
          try {
            localStorage.setItem(PWA_INSTALLED_KEY, "true");
          } catch {}
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("PWA install error:", err);
      }
      return;
    }

    // iOS Safari or browser without beforeinstallprompt
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIos) {
      setShowIosGuide(true);
    } else {
      alert("To install Aamar Pujo: Tap your browser's menu (⋮ or share icon) and select 'Install app' or 'Add to Home screen'.");
    }
  };

  const handleOpenAppClick = () => {
    setShowOpenAppHelp(true);
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* 
        Sleek Compact Floating Banner:
        - Anchored right above bottom taskbar (bottom-[62px])
        - Stops at right-[74px] to guarantee 12px+ clearance before Dawon mascot (right-3, w-12)
        - Zero overlap with Dawon!
      */}
      <aside 
        className="fixed left-2.5 right-[74px] bottom-[62px] z-40 md:hidden bg-[#160D22]/95 backdrop-blur-xl border border-amber-400/35 rounded-2xl py-1.5 px-2.5 shadow-xl shadow-black/80 flex items-center justify-between gap-1.5 animate-fadeIn select-none"
        role="alert"
        aria-label="App Notification Banner"
      >
        {/* Left: App Logo + Text Info */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-sm">
              <img 
                src={logoImg} 
                alt="Aamar Pujo Logo" 
                className="w-full h-full object-contain rounded-[6px] bg-[#120D17]"
              />
            </div>
            {isInstalledPreviously && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-slate-950"></span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-[11px] font-bold text-white truncate leading-tight">
              {isInstalledPreviously ? "Aamar Pujo App" : "Install Aamar Pujo"}
            </h4>
            <p className="text-[9px] text-amber-200/80 truncate leading-tight">
              {isInstalledPreviously ? "Installed on device" : "Full screen & zero bars"}
            </p>
          </div>
        </div>

        {/* Right: Action Button & Dismiss */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {isInstalledPreviously ? (
            <button
              onClick={handleOpenAppClick}
              className="px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-[10px] shadow-sm active:scale-95 transition flex items-center space-x-1 cursor-pointer"
              title="Open installed app on Home Screen"
            >
              <Rocket className="w-3 h-3" />
              <span>Open</span>
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-[10px] shadow-sm active:scale-95 transition flex items-center space-x-0.5 cursor-pointer"
              title="Add to Home Screen"
            >
              <Download className="w-3 h-3 stroke-[2.5]" />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Dismiss for 14 days"
            aria-label="Dismiss banner"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* "Open in App" Guidance Modal */}
      {showOpenAppHelp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowOpenAppHelp(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#140C20] border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">Open Aamar Pujo App</h4>
              </div>
              <button
                onClick={() => setShowOpenAppHelp(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
              <p className="flex items-center space-x-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Aamar Pujo is already installed on your phone!</span>
              </p>
              <p className="text-slate-300">
                To experience the edge-to-edge full-screen view without browser bars, simply open the <strong className="text-amber-300">"Aamar Pujo"</strong> icon from your phone's Home Screen or App Drawer.
              </p>
            </div>

            <button
              onClick={() => {
                setShowOpenAppHelp(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-xs hover:from-emerald-400 hover:to-emerald-500 transition cursor-pointer shadow-lg"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

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
