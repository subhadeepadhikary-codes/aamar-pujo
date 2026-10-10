import React from "react";
import logoImg from "../assets/logo.png";
import { 
  PhoneCall, 
  Shield, 
  Train, 
  Heart, 
  MapPin, 
  Sparkles,
  ExternalLink 
} from "lucide-react";

export default function Footer() {
  const helplines = [
    { label: "Kolkata Police Control", number: "100 / 112" },
    { label: "Traffic Police Helpline", number: "1073" },
    { label: "Emergency Ambulance", number: "102" },
    { label: "Women Safety Helpline", number: "1091" },
    { label: "Disaster Management", number: "1077" }
  ];

  return (
    <footer className="bg-[#050307] border-t border-amber-500/15 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Emergency Helplines Strip */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-3">
            <Shield className="w-4 h-4 text-rose-500" />
            <span>Kolkata Police & Pujo Emergency Numbers (24x7)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {helplines.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.number.split("/")[0].trim()}`}
                className="bg-[#120B18] p-2.5 rounded-xl border border-white/5 hover:border-rose-500/40 transition group"
              >
                <span className="text-[10px] text-slate-400 block group-hover:text-slate-200">
                  {h.label}
                </span>
                <span className="text-xs font-bold text-rose-300 font-mono flex items-center space-x-1 mt-0.5">
                  <PhoneCall className="w-3 h-3 text-rose-400 mr-1" />
                  {h.number}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Main Footer Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Dedication */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImg} 
                alt="Aamar Pujo Logo" 
                className="w-12 h-12 object-contain rounded-2xl border border-amber-400/40 p-1 bg-[#100B17]" 
              />
              <div>
                <span className="font-heritage text-xl font-black text-white">
                  Aamar<span className="text-amber-400">Pujo</span>
                </span>
                <p className="text-[11px] font-bengali text-amber-300 font-semibold">
                  এবার পুজো, অন্য ভাবে
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Crafted with devotion for millions of devotees, explorers, and pandal hoppers across Bengal. 
              Connecting people to every sacred idol and artistic installation with one-click Google Maps navigation.
            </p>

            <div className="pt-1">
              <p className="font-bengali text-sm text-amber-200 font-bold">
                “শুভ শারদীয়া ও শুভ বিজয়ার আন্তরিক প্রীতি, শুভেচ্ছা ও ভালোবাসা!”
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heritage text-sm font-bold text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#pipeline" className="hover:text-amber-300 transition">
                  ⏳ 11-Day Pipeline Countdown
                </a>
              </li>
              <li>
                <a href="#pandals" className="hover:text-amber-300 transition">
                  🏛️ 504+ Pandals Directory
                </a>
              </li>
              <li>
                <a href="#map" className="hover:text-amber-300 transition">
                  🗺️ Interactive Google/Leaflet Map
                </a>
              </li>
              <li>
                <a href="#melodies" className="hover:text-amber-300 transition">
                  🎵 Daily Bengali Pujo Melodies
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-300 transition">
                  👤 Subhadeep's Story ("Keno banalam eta?")
                </a>
              </li>
              <li>
                <a 
                  href="https://forms.gle/qpq8CS3kgwwcpkri7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-300 transition text-amber-400 font-semibold flex items-center gap-1"
                >
                  📝 Share Feedback & Suggestions
                </a>
              </li>
            </ul>
          </div>

          {/* Metro Corridor Tips */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-heritage text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <Train className="w-4 h-4 text-blue-400 mr-1.5" />
              <span>Kolkata Metro Night Advice</span>
            </h4>
            <div className="bg-[#0F0A15] p-3.5 rounded-2xl border border-white/5 space-y-2 text-xs">
              <p className="text-slate-300">
                <strong>Blue Line (North-South):</strong> Dakshineswar to Kavi Subhash operates special night-long trains during Saptami, Ashtami, and Navami.
              </p>
              <p className="text-slate-300">
                <strong>Green Line (East-West):</strong> Connects Howrah Station, Esplanade & Salt Lake Sector V till late midnight.
              </p>
              <span className="text-[10px] text-amber-400/80 block pt-1">
                Tip: Keep smart tokens or UPI Metro recharge ready to avoid counter queues.
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Credits Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-3">
          <p className="text-center sm:text-left">
            © 2026 <strong>Aamar Pujo</strong> · Non-commercial cultural community portal. Media & music shared under Section 52 Fair Dealing for cultural preservation.
          </p>
          <p className="flex items-center space-x-1">
            <span>Built with passion & pride by</span>
            <a 
              href="mailto:subhadeepadhikary30@gmail.com" 
              title="Email Subhadeep Adhikary" 
              className="text-white hover:text-amber-400 transition cursor-pointer font-bold underline decoration-amber-500/40"
            >
              Subhadeep Adhikary
            </a>
            <span className="text-rose-500">❤️</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
