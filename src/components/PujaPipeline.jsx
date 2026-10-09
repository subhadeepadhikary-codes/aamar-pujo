import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Flame, 
  Compass, 
  Music, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const PIPELINE_DAYS = [
  {
    id: "mahalaya",
    bengaliName: "মহালয়া",
    englishName: "Mahalaya",
    tithi: "Amavasya",
    dateStr: "Oct 10, 2026",
    targetDate: new Date("2026-10-10T04:00:00+05:30"),
    tag: "The Sacred Awakening",
    rituals: "Pitru Tarpan at Ganges Ghats, 4 AM Birendra Krishna Bhadra Chandipath on Radio, Chokhudan of Durga idols in Kumartuli.",
    hoppingTip: "Visit Kumartuli in the morning to witness master sculptors applying divine eye strokes. Evening pandal light testing begins.",
    audioTrackId: "mahalaya"
  },
  {
    id: "prothoma",
    bengaliName: "প্রথমা",
    englishName: "Prothoma",
    tithi: "Pratipada · Devi Paksha 1",
    dateStr: "Oct 11, 2026",
    targetDate: new Date("2026-10-11T06:00:00+05:30"),
    tag: "Ghat Sthapana & Welcome",
    rituals: "Kalash Sthapana, Shailaputri worship, early morning temple conch blowing.",
    hoppingTip: "Enjoy quiet walks around North Kolkata Rajbari areas. Pandals are almost finished, crowd is peaceful.",
    audioTrackId: "prothoma"
  },
  {
    id: "dwitiya",
    bengaliName: "দ্বিতীয়া",
    englishName: "Dwitiya",
    tithi: "Dwitiya · Devi Paksha 2",
    dateStr: "Oct 12, 2026",
    targetDate: new Date("2026-10-12T06:00:00+05:30"),
    tag: "Autumn Shiuli & Kash",
    rituals: "Brahmacharini worship, traditional devotional Agomoni singing in households.",
    hoppingTip: "Check out South Kolkata clubs (Chetla, Suruchi) doing their first test illuminations.",
    audioTrackId: "dwitiya"
  },
  {
    id: "tritiya",
    bengaliName: "তৃতীয়া",
    englishName: "Tritiya",
    tithi: "Tritiya · Devi Paksha 3",
    dateStr: "Oct 13, 2026",
    targetDate: new Date("2026-10-13T06:00:00+05:30"),
    tag: "Theme Unveilings",
    rituals: "Chandraghanta worship, final structural inspections by Kolkata Police.",
    hoppingTip: "Prime time for photography enthusiasts before barricades and giant queue queues get locked.",
    audioTrackId: "tritiya"
  },
  {
    id: "chaturthi",
    bengaliName: "চতুর্থী",
    englishName: "Chaturthi",
    tithi: "Chaturthi · Devi Paksha 4",
    dateStr: "Oct 14, 2026",
    targetDate: new Date("2026-10-14T06:00:00+05:30"),
    tag: "Grand Pre-Opening",
    rituals: "Kushmanda Puja, official VIP inaugurations by Chief Minister and artists.",
    hoppingTip: "Cover mega pandals like Sreebhumi and Santosh Mitra Square tonight to skip 5-hour weekend lines!",
    audioTrackId: "chaturthi"
  },
  {
    id: "panchami",
    bengaliName: "পঞ্চমী",
    englishName: "Panchami",
    tithi: "Panchami · Anandodhara",
    dateStr: "Oct 15, 2026",
    targetDate: new Date("2026-10-15T06:00:00+05:30"),
    tag: "Festival Frenzy Commences",
    rituals: "Skandamata Puja, Anandamoyee invocation, welcoming thousands of food stalls.",
    hoppingTip: "South Kolkata belt (Ekdalia, Singhi Park, Tridhara) opens fully to the public tonight.",
    audioTrackId: "panchami"
  },
  {
    id: "shasthi",
    bengaliName: "ষষ্ঠী",
    englishName: "Maha Shasthi",
    tithi: "Shasthi · Akalbodhan",
    dateStr: "Oct 16, 2026",
    targetDate: new Date("2026-10-16T08:00:00+05:30"),
    tag: "Devi Bodhon & Amontron",
    rituals: "Bodhon under the sacred Bel tree, Amontron & Adhibas rites. The veil is officially removed from Maa Durga's face.",
    hoppingTip: "Dress up in new clothes! Metro starts running frequent services. Perfect for family evening hopping.",
    audioTrackId: "shasthi"
  },
  {
    id: "saptami",
    bengaliName: "সপ্তমী",
    englishName: "Maha Saptami",
    tithi: "Saptami · Nabapatrika",
    dateStr: "Oct 17, 2026",
    targetDate: new Date("2026-10-17T06:00:00+05:30"),
    tag: "Kola Bou Snan & Pran Pratishtha",
    rituals: "Dawn Kola Bou (Nabapatrika) bath at Babughat/Bagbazar ghats, Pran Pratishtha, Maha Snan with mirrors and sacred waters.",
    hoppingTip: "Start early at 6 AM at Bagbazar to see the traditional Kola Bou procession, then hop North Kolkata till 2 PM.",
    audioTrackId: "saptami"
  },
  {
    id: "ashtami",
    bengaliName: "অষ্টমী",
    englishName: "Maha Ashtami",
    tithi: "Ashtami · Sandhi Puja",
    dateStr: "Oct 18, 2026",
    targetDate: new Date("2026-10-18T09:00:00+05:30"),
    tag: "Pushpanjali & 108 Diyas Climax",
    rituals: "Maha Ashtami Anjali (morning in traditional sarees & kurtas), Kumari Puja (Belur Math), Sandhi Puja with 108 blue lotuses & 108 oil lamps.",
    hoppingTip: "Morning is strictly for para Anjali & Bhog (Khichuri, Labra, Payesh). Hop Central & South Kolkata all night!",
    audioTrackId: "ashtami"
  },
  {
    id: "navami",
    bengaliName: "নবমী",
    englishName: "Maha Navami",
    tithi: "Navami · Maha Arati",
    dateStr: "Oct 19, 2026",
    targetDate: new Date("2026-10-19T06:00:00+05:30"),
    tag: "Dhunuchi Dance & All-Night Hopping",
    rituals: "Maha Navami Homa, Navami Bhog, evening ecstatic Dhunuchi Naach competitions with dhakis.",
    hoppingTip: "The ultimate all-night pandal hopping night! Metro runs 24 hours. Hop between 11 PM and 5 AM for magical lighting.",
    audioTrackId: "navami"
  },
  {
    id: "dashami",
    bengaliName: "দশমী",
    englishName: "Bijoya Dashami",
    tithi: "Dashami · Bisorjon",
    dateStr: "Oct 20, 2026",
    targetDate: new Date("2026-10-20T10:00:00+05:30"),
    tag: "Sindur Khela & Subho Bijoya",
    rituals: "Debi Boron, Sindur Khela by married women, tearful Bisorjon (immersion) in Hooghly river, touching elders' feet for blessings.",
    hoppingTip: "Head to Babughat or Judges Ghat to watch the grand immersion processions. Exchange sweets: 'Subho Bijoya!'",
    audioTrackId: "dashami"
  }
];

export default function PujaPipeline({ onPlayDaySong }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const activeDay = PIPELINE_DAYS[selectedIndex];

  // Live countdown calculation to the currently selected day
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const target = activeDay.targetDate.getTime();
      const diff = target - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // If the date has arrived
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [selectedIndex, activeDay]);

  return (
    <section id="pipeline" className="py-16 md:py-24 bg-[#0A070D] border-t border-b border-amber-500/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Devi Paksha Flow · মহালয়া থেকে দশমী</span>
          </div>
          <h2 className="font-heritage text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
            Pujo <span className="text-gold-gradient">Pipeline Countdown</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Interactive 11-stage journey through Durga Puja. Click any day node to explore its rituals, 
            auspicious timings, and night-hopping guidance.
          </p>
        </div>

        {/* Horizontal Pipeline Stepper (Scrollable on mobile) */}
        <div className="relative mb-10 overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-center justify-between min-w-[960px] px-4 py-2 relative">
            
            {/* Connecting Track Line */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#1A1222] border-t border-b border-amber-500/20 z-0"></div>
            
            {/* Active Progress Highlight */}
            <div 
              className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 z-0 transition-all duration-500"
              style={{ width: `${(selectedIndex / (PIPELINE_DAYS.length - 1)) * 94}%` }}
            ></div>

            {PIPELINE_DAYS.map((day, idx) => {
              const isSelected = selectedIndex === idx;
              const isPast = idx < selectedIndex;

              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedIndex(idx)}
                  className="flex flex-col items-center group relative z-10 focus:outline-none"
                >
                  {/* Node Circle */}
                  <div 
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl ${
                      isSelected
                        ? "bg-gradient-to-br from-amber-400 to-rose-600 text-slate-950 scale-115 ring-4 ring-amber-400/30 ring-offset-2 ring-offset-[#0A070D]"
                        : isPast
                        ? "bg-[#1E1528] text-amber-300 border border-amber-500/40 hover:scale-105"
                        : "bg-[#120D18] text-slate-400 border border-white/10 hover:border-amber-400/40 hover:text-white"
                    }`}
                  >
                    <span className="font-bengali text-xs sm:text-sm">{idx === 0 ? "মহা" : idx}</span>
                  </div>

                  {/* Day Label */}
                  <div className="mt-2.5 text-center">
                    <p className={`text-xs font-semibold whitespace-nowrap transition ${
                      isSelected ? "text-amber-300 font-bold" : "text-slate-400 group-hover:text-slate-200"
                    }`}>
                      {day.englishName}
                    </p>
                    <p className="text-[10px] font-bengali text-slate-400 whitespace-nowrap">
                      {day.bengaliName}
                    </p>
                  </div>
                </button>
              );
            })}

          </div>
        </div>

        {/* Selected Stage Detail Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 border border-amber-500/25 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left: Day Info & Live Countdown */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold">
                  Stage {selectedIndex + 1} of 11
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                  {activeDay.tithi}
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {activeDay.dateStr}
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-3">
                  <h3 className="font-heritage text-3xl sm:text-4xl font-extrabold text-white">
                    {activeDay.englishName}
                  </h3>
                  <span className="font-bengali text-2xl sm:text-3xl font-black text-amber-400">
                    ({activeDay.bengaliName})
                  </span>
                </div>
                <p className="text-base font-medium text-amber-300/90 mt-1">
                  {activeDay.tag}
                </p>
              </div>

              {/* Countdown Clock Display */}
              <div className="bg-[#100B17] border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                  Live Countdown to {activeDay.englishName}
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                  <div className="bg-[#181122] rounded-xl p-2.5 sm:p-3 border border-white/5">
                    <span className="font-heritage text-2xl sm:text-3xl font-black text-white block">
                      {timeLeft.days}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Days</span>
                  </div>
                  <div className="bg-[#181122] rounded-xl p-2.5 sm:p-3 border border-white/5">
                    <span className="font-heritage text-2xl sm:text-3xl font-black text-amber-400 block">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-[#181122] rounded-xl p-2.5 sm:p-3 border border-white/5">
                    <span className="font-heritage text-2xl sm:text-3xl font-black text-amber-300 block">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="bg-[#181122] rounded-xl p-2.5 sm:p-3 border border-white/5">
                    <span className="font-heritage text-2xl sm:text-3xl font-black text-rose-400 block">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                  disabled={selectedIndex === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center space-x-1 border border-white/10 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setSelectedIndex((prev) => Math.min(PIPELINE_DAYS.length - 1, prev + 1))}
                  disabled={selectedIndex === PIPELINE_DAYS.length - 1}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 text-xs font-semibold text-amber-300 flex items-center space-x-1 border border-amber-500/40 transition"
                >
                  <span>Next Day</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Audio Trigger for this Day */}
                {onPlayDaySong && (
                  <button
                    onClick={() => onPlayDaySong(activeDay.audioTrackId)}
                    className="ml-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-rose-600/30 transition"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Play {activeDay.englishName} Track</span>
                  </button>
                )}
              </div>

            </div>

            {/* Right: Rituals, Hopping Tips & Cultural Insights */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="bg-[#120D1A] rounded-2xl p-5 border border-white/10">
                <div className="flex items-center space-x-2 text-amber-400 mb-2 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sacred Rituals & Tithi Timing</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {activeDay.rituals}
                </p>
              </div>

              <div className="bg-[#120D1A] rounded-2xl p-5 border border-rose-500/20">
                <div className="flex items-center space-x-2 text-rose-400 mb-2 font-semibold text-sm">
                  <Compass className="w-4 h-4 text-rose-400" />
                  <span>Night-Hopper's Route Advice</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {activeDay.hoppingTip}
                </p>
              </div>

              <div className="bg-[#160E21] rounded-2xl p-4 border border-amber-500/15 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Kolkata Metro Service Status</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {selectedIndex >= 6 ? "Night Long Services Operational (Blue & Green Lines)" : "Standard Schedule (6:50 AM to 10:45 PM)"}
                  </span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
