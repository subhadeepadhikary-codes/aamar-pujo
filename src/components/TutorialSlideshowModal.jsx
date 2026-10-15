import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Utensils,
  Footprints,
  Train,
  Clock,
  Bus,
  ZoomIn,
  Download,
  CheckCircle2,
  Share2,
  Smartphone
} from "lucide-react";

export const TOUR_STORAGE_KEY = "aamar_pujo_tour_seen_v1";

const SLIDES = [
  {
    id: "home",
    tag: "Home & Search",
    title: "Home & Instant Discovery",
    bengali: "সহজে খুঁজুন আপনার প্রিয় পুজো",
    subtitle: "Spotlight carousel, universal search & 1-tap category filters",
    icon: Sparkles,
    gradient: "from-amber-500 via-rose-600 to-amber-500",
    image: "/screenshots/guide_step_1.webp",
    imageAlt: "Aamar Pujo Home Screen Spotlight & Search",
    highlights: [
      {
        num: "①",
        bold: "Hero Spotlight Carousel:",
        text: "Swipe through top trending pandals with 1-tap Google Maps directions."
      },
      {
        num: "②",
        bold: "Universal Search Bar:",
        text: "Search instantly across all 541+ pandals by name, locality, or metro station."
      },
      {
        num: "③",
        bold: "1-Tap Quick Filters:",
        text: "Filter instantly by Live GPS Near Me, Blue/Green Metro, or city zones."
      },
      {
        num: "④",
        bold: "4 Core Categories:",
        text: "Jump straight to Mega Pandals, Heritage Bonedi Baris, Eco-Friendly, or Art Theme."
      }
    ]
  },
  {
    id: "discovery-hub",
    tag: "Dual Discovery",
    title: "Smart Map & Directory Hub",
    bengali: "প্যান্ডেল এবং রেস্তোরাঁ নির্দেশিকা",
    subtitle: "Toggle between interactive geospatial map and proximity directory grid",
    icon: Utensils,
    gradient: "from-rose-500 via-amber-500 to-orange-500",
    isDualView: true,
    views: {
      map: {
        label: "Map View",
        icon: "🗺️",
        image: "/screenshots/guide_step_2_map.webp",
        imageAlt: "Interactive Map with 228 Food Layer and Focus Route",
        highlights: [
          {
            num: "①",
            bold: "Food Layer ON (228):",
            text: "Tap to reveal 228+ iconic Kolkata eateries marked with fork & knife pins (🍴)."
          },
          {
            num: "②",
            bold: "Focus Route Mode:",
            text: "Hide unrelated pins to isolate your active puja itinerary clearly."
          },
          {
            num: "③",
            bold: "Zone Filter Pills:",
            text: "Filter pins across North, South, Central, East, Behala, or Howrah."
          },
          {
            num: "④",
            bold: "District Legend & Drawer:",
            text: "Color-coded density guide + tap any pin to view timing and '+ Add to Plan'."
          }
        ]
      },
      directory: {
        label: "Directory View",
        icon: "📋",
        image: "/screenshots/guide_step_2_directory.webp",
        imageAlt: "541 Pandals vs 228 Eateries Proximity Directory",
        highlights: [
          {
            num: "①",
            bold: "541+ Pandals vs 228+ Eateries:",
            text: "Switch tabs instantly between puja pandals and Kolkata's legendary eateries."
          },
          {
            num: "②",
            bold: "Near Me GPS & Radius:",
            text: "Auto-sort spots within 2 km up to 20 km of your live GPS coordinates."
          },
          {
            num: "③",
            bold: "Metro & Locality Chips:",
            text: "1-tap quick filters for nearest Blue/Green metro stations and districts."
          },
          {
            num: "④",
            bold: "Detail Action Cards:",
            text: "View opening hours, crowd levels, direct Google Maps link, and add to plan."
          }
        ]
      }
    }
  },
  {
    id: "travel-modes",
    tag: "Multi-Modal Travel",
    title: "Pedestrian, Road & Metro Modes",
    bengali: "হাঁটা পথ, গাড়ি ও মেট্রো রুট",
    subtitle: "Smart road-snapped walking, vehicular routes & rail integration",
    icon: Footprints,
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    image: "/screenshots/guide_step_3_modes.webp",
    imageAlt: "Multi-modal travel options Foot, Road, Metro and Smart Mode",
    highlights: [
      {
        num: "①",
        bold: "🚶 Foot Mode:",
        text: "Road-snapped pedestrian routes through Kolkata alleys (no straight lines cutting buildings)."
      },
      {
        num: "②",
        bold: "🛵 Road Mode:",
        text: "Fast vehicular and scooter corridors for long-distance city cruising."
      },
      {
        num: "③",
        bold: "🚇 Metro Mode:",
        text: "Rail corridors linking Blue Line (Dakshineswar-Kavi Subhash) & Green Line."
      },
      {
        num: "④",
        bold: "🧠 Smart AI Transit:",
        text: "Automatically picks whether walking or taking the metro is faster per leg."
      }
    ]
  },
  {
    id: "pujo-by-metro",
    tag: "Pujo by Metro",
    title: "24 Metro Stations Network",
    bengali: "মেট্রো দিয়ে পুজো পরিক্রমা",
    subtitle: "Filter all 541+ pandals by your nearest Blue or Green Line station",
    icon: Train,
    gradient: "from-emerald-500 via-teal-600 to-cyan-500",
    image: "/screenshots/guide_step_4_metro.webp",
    imageAlt: "Pujo by Metro 24 Stations network selector",
    highlights: [
      {
        num: "①",
        bold: "Metro Line Tabs:",
        text: "Filter by All Stations (24), 🔵 Blue Line (North-South), or 🟢 Green Line (East-West)."
      },
      {
        num: "②",
        bold: "24 Station Grid:",
        text: "Displays walking distance and exact count of pandals surrounding each station."
      },
      {
        num: "③",
        bold: "1-Tap Station Filter:",
        text: "Tap any station (e.g. Girish Park, Kalighat, Sovabazar) to instantly isolate nearby pandals."
      }
    ]
  },
  {
    id: "ai-optimizer",
    tag: "AI Scheduling",
    title: "Lighting Optimizer & Route Anchors",
    bengali: "আলোকসজ্জা ও সময়ভিত্তিক রুট",
    subtitle: "Night illuminations, zero backtracking & 25-step undo history",
    icon: Clock,
    gradient: "from-purple-500 via-pink-600 to-amber-500",
    image: "/screenshots/guide_step_5_optimizer.webp",
    imageAlt: "Route Anchors, Lighting Optimizer and Undo controls",
    highlights: [
      {
        num: "①",
        bold: "Custom Route Anchors:",
        text: "Anchor your start and end to Live GPS, Howrah, Sealdah, Airport, or your home address."
      },
      {
        num: "②",
        bold: "🌙 Time & Lighting AI:",
        text: "Schedules lighting spectacles for night & century-old Bonedi Baris for daytime."
      },
      {
        num: "③",
        bold: "↩️ 25-Step Undo (Ctrl+Z):",
        text: "Accidentally removed or reordered a spot? Click Undo anytime to restore previous state."
      },
      {
        num: "④",
        bold: "↕️ Touch Drag & Order Sliding:",
        text: "Reorder stops smoothly with touch-friendly handles to build your custom sequence."
      }
    ]
  },
  {
    id: "transit-export",
    tag: "Transit & Offline PDF",
    title: "Live Kolkata Buses & PDF Export",
    bengali: "বাসের রুট এবং অফলাইন গাইড",
    subtitle: "Real-time bus numbers, Google Transit navigation & printable guide",
    icon: Bus,
    gradient: "from-amber-400 via-orange-500 to-rose-600",
    image: "/screenshots/guide_step_6_transit.webp",
    imageAlt: "Live Kolkata bus numbers 78/1, 219 and Google Transit integration",
    highlights: [
      {
        num: "①",
        bold: "Live Corridor Map:",
        text: "Visual bus and public transport corridor line connecting your selected pandals."
      },
      {
        num: "②",
        bold: "1-Tap Google Transit:",
        text: "Launches Google Maps public transport mode directly from your active itinerary."
      },
      {
        num: "③",
        bold: "Live Bus Numbers:",
        text: "Corridor recommendations (78/1, 219, 234/1, 240, 30B) connecting your stops."
      },
      {
        num: "④",
        bold: "Scheduled Departures & Stops:",
        text: "Shows boarding stops (Hedua More, Karbala) and scheduled departure intervals."
      }
    ]
  }
];

export default function TutorialSlideshowModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slide2SubView, setSlide2SubView] = useState("map"); // "map" | "directory"
  const [zoomedImage, setZoomedImage] = useState(null);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  // Capture beforeinstallprompt for PWA install
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Close on Escape, navigate with Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (zoomedImage) {
          setZoomedImage(null);
        } else if (showIosTip) {
          setShowIosTip(false);
        } else {
          handleDismiss();
        }
      } else if (e.key === "ArrowRight") {
        if (!zoomedImage && !showIosTip) {
          setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
        }
      } else if (e.key === "ArrowLeft") {
        if (!zoomedImage && !showIosTip) {
          setCurrentSlide((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, zoomedImage, showIosTip]);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const isFirst = currentSlide === 0;

  const handleDismiss = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // storage unavailable fallback
    }
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleDismiss();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleInstallApp = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPromptEvent(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        setShowIosTip(true);
      } else {
        alert("To install Aamar Pujo on your device, tap your browser's menu (⋮) and select 'Add to Home screen' or 'Install App'.");
      }
    }
  };

  const IconComp = slide.icon;

  // Active view & highlights for current slide
  const activeImage = slide.isDualView
    ? slide.views[slide2SubView].image
    : slide.image;
  const activeImageAlt = slide.isDualView
    ? slide.views[slide2SubView].imageAlt
    : slide.imageAlt;
  const activeHighlights = slide.isDualView
    ? slide.views[slide2SubView].highlights
    : slide.highlights;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div
          className="w-full max-w-lg bg-gradient-to-b from-[#120B1D] via-[#0D0814] to-black rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Aamar Pujo Visual Feature Guide"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 bg-slate-950/80 shrink-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl bg-gradient-to-tr ${slide.gradient} text-slate-950 shadow-md shrink-0`}
              >
                <IconComp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block truncate">
                  {slide.tag} • Step {currentSlide + 1} of {SLIDES.length}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {slide.title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 ml-2"
              title="Skip Guide / Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Content Scrollable Body */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 overflow-y-auto space-y-3.5 flex-1">
            {/* Bengali & Subtitle Banner */}
            <div className="text-center space-y-0.5 p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              {slide.bengali && (
                <p className="text-xs sm:text-sm text-amber-200 font-bengali font-bold">
                  {slide.bengali}
                </p>
              )}
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                {slide.subtitle}
              </p>
            </div>

            {/* Slide 2 Dual Discovery Sub-View Pill Toggle */}
            {slide.isDualView && (
              <div className="flex items-center justify-center">
                <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/15 shadow-inner">
                  <button
                    onClick={() => setSlide2SubView("map")}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      slide2SubView === "map"
                        ? "bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>🗺️</span>
                    <span>Map View</span>
                    <span className="text-[10px] opacity-80">(Food & Route)</span>
                  </button>
                  <button
                    onClick={() => setSlide2SubView("directory")}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      slide2SubView === "directory"
                        ? "bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>📋</span>
                    <span>Directory View</span>
                    <span className="text-[10px] opacity-80">(GPS & Tabs)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Phone Mockup Frame with Screenshot */}
            <div className="relative group mx-auto max-w-[340px] sm:max-w-[380px] rounded-2xl p-1 bg-gradient-to-b from-amber-500/30 via-slate-800/40 to-slate-900 border border-amber-500/40 shadow-xl overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={activeImageAlt}
                  className="w-full max-h-[220px] sm:max-h-[260px] object-contain cursor-zoom-in transition transform group-hover:scale-[1.02]"
                  onClick={() => setZoomedImage(activeImage)}
                  loading="eager"
                />

                {/* Tap to expand hint */}
                <button
                  onClick={() => setZoomedImage(activeImage)}
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-[10px] font-bold text-amber-300 border border-amber-500/40 flex items-center space-x-1 backdrop-blur-sm transition"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>Tap to expand</span>
                </button>
              </div>
            </div>

            {/* Feature Callouts List */}
            <div className="space-y-2 pt-1">
              {activeHighlights.map((h, i) => (
                <div
                  key={i}
                  className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition flex items-start space-x-2.5 text-xs sm:text-sm text-slate-200"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-black flex items-center justify-center shrink-0 text-xs mt-0.5 shadow-md">
                    {h.num}
                  </span>
                  <div className="space-y-0.5 leading-snug">
                    <span className="font-bold text-amber-300">{h.bold} </span>
                    <span className="text-slate-300 text-[11px] sm:text-xs">
                      {h.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* On Last Slide: PWA "Add to Home Screen / Install App" Card */}
            {isLast && (
              <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border-2 border-amber-400/50 shadow-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black shadow-md">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-white">
                      📲 Add Aamar Pujo to Home Screen
                    </h4>
                    <p className="text-[10px] text-amber-200/90 font-medium">
                      Enjoy the 100% full-screen app experience with zero browser bars!
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handleInstallApp}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-slate-950 font-black text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Installed on Home Screen</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Install / Add to Home</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Bar */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-white/10 bg-slate-950/95 flex items-center justify-between gap-2 shrink-0">
            {/* Dot Indicators */}
            <div className="flex items-center space-x-1.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all rounded-full ${
                    idx === currentSlide
                      ? "w-6 h-2 bg-gradient-to-r from-amber-400 to-rose-500"
                      : "w-2 h-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  aria-label={`Jump to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg transition active:scale-95 cursor-pointer ${
                  isLast
                    ? "bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-slate-950 hover:from-amber-300 hover:to-rose-400"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
              >
                <span>{isLast ? "🎉 Start Exploring" : "Next"}</span>
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Zoom Lightbox */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-3 sm:p-6 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 sm:-right-10 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
              title="Close Zoom"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Enlarged guide screenshot"
              className="max-h-[85vh] w-auto object-contain rounded-2xl border border-amber-500/40 shadow-2xl"
            />
            <p className="mt-3 text-xs text-amber-300/80 font-medium text-center">
              Tap anywhere outside or press ESC to return to guide
            </p>
          </div>
        </div>
      )}

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      {showIosTip && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4 animate-fadeIn"
          onClick={() => setShowIosTip(false)}
        >
          <div
            className="w-full max-w-sm bg-[#120B1C] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-sm">Add to Home Screen (iOS)</h4>
              </div>
              <button
                onClick={() => setShowIosTip(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs text-slate-200 space-y-2.5 list-decimal list-inside leading-relaxed">
              <li>Tap the <span className="font-bold text-amber-300">Share button</span> at the bottom of Safari.</li>
              <li>Scroll down and tap <span className="font-bold text-amber-300">"Add to Home Screen"</span> (+).</li>
              <li>Tap <span className="font-bold text-amber-300">"Add"</span> in the top right corner.</li>
            </ol>

            <button
              onClick={() => setShowIosTip(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
