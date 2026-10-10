import React from "react";
import creatorImg from "../assets/subhadeep.jpg";
import { 
  Heart, 
  MapPin, 
  Compass, 
  AlertTriangle, 
  Footprints, 
  Sparkles, 
  Code2, 
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  MessageSquareHeart,
  ExternalLink,
  Mail
} from "lucide-react";

export default function AboutSection() {
  const problemsSolved = [
    {
      title: "The Bamboo Barricade & One-Way Maze",
      bengali: "বাঁশের ব্যারিকেড আর ওয়ান-ওয়ের গোলকধাঁধা",
      problem: "During Pujo, Kolkata's traffic police convert familiar streets into strict one-way human corridors. If you miss a turn, you're forced to walk 3 extra kilometers in the humid crowd just to loop back.",
      solution: "Aamar Pujo provides direct Google Maps routing to exact entry checkpoints and highlights nearest metro gates to save your feet."
    },
    {
      title: "Missing Out on Incredible 'Hidden Gem' Art",
      bengali: "হাইপের আড়ালে হারিয়ে যাওয়া খাঁটি শিল্প",
      problem: "People from outside Kolkata, students, and tourists only hear about 2 or 3 heavily televised pandals. They wait 4 hours in a single queue and completely miss the breathtaking, award-winning artisan themes in North Kolkata paras.",
      solution: "Our curated 503-pandal directory puts both iconic giants and intimate neighborhood masterpieces side-by-side with theme categories."
    },
    {
      title: "Metro & Transport Guesswork",
      bengali: "কোন মেট্রো স্টেশনে নামবো? কোনটা কাছে?",
      problem: "Hopping blindly at night often leaves devotees stranded when local autos charge 5x rates or when they exit at the wrong metro station on the opposite side of the road.",
      solution: "Every pandal card clearly shows the nearest Metro station (Blue Line / Green Line) with walking minutes and crowd rush meter."
    },
    {
      title: "The Real-Time Distance Dilemma",
      bengali: "'আর কত দূর?' — এই প্রশ্নের সমাধান",
      problem: "In massive crowds, asking pedestrians often leads to conflicting directions. Hoppers waste precious festive hours wandering between distant clubs.",
      solution: "One-tap 'Near Me' GPS filter instantly recalculates and sorts all 503 pandals by real-time walking proximity from your live phone location."
    }
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-[#0A070D] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Creator Bio Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/25 mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Creator Photo Frame */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-600 to-amber-400 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden bg-[#181122] border-2 border-amber-400/40 shadow-2xl">
                  <img 
                    src={creatorImg} 
                    alt="Subhadeep Adhikary" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#120D1A]/90 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
                    <span className="text-xs font-bold text-white flex items-center justify-center space-x-1">
                      <Code2 className="w-3.5 h-3.5 text-amber-400 mr-1" />
                      <span>Subhadeep Adhikary</span>
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-medium block">
                      Creator & Developer · Aamar Pujo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Story & Quote */}
            <div className="md:col-span-7 lg:col-span-8 space-y-5">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                <span>The Story Behind Aamar Pujo</span>
              </div>

              <div>
                <h3 className="font-heritage text-2xl sm:text-4xl font-extrabold text-white">
                  Subhadeep Adhikary
                </h3>
                <p className="text-amber-400 font-heritage font-bold text-sm sm:text-lg mt-1 italic">
                  “About? Tomader motoi pujo lover ar kichu noi!”
                </p>
              </div>

              <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                <p>
                  Ami Subhadeep Adhikary — tomader motoi ekjon hardcore pujo pagol Bangali! 
                  Je shara bochor adhīr aggrohe opekkha kore thake kashful-er dola, shiuli phool-er gondho, 
                  ar vore akashvani-r shei jadukori Mahalaya-r shur-er jonno.
                </p>
                <p>
                  Pujo-r charte din notun jama pore bondhuder sathe raat jege thakur dekha, goli-r more fuchka 
                  ar roll-er line-e darano, ar dhak-er taale pagol hoye nacha — ei anondo-ta-i to amader pujo! 
                  Kintu prottek bochor thakur dekhte giye rasta bhule jaowa, bamboo barricade-e atke ghure morā, 
                  ar kon metro kothay ache khuje na paowa — ei jhamela gulo dekhlei mone hoto, amader Kolkata-r 
                  jonno ekta proper, smart pujo guide platform thaka khub dorkar.
                </p>
                <p className="text-amber-200 font-medium">
                  Shei bhabna thekei banalam <strong>Aamar Pujo</strong> — <em>“Ebar pujo, onno bhabe!”</em> 
                  Eta kono corporate platform noy, tomader motoi ekjon pujo lover-er banano mon theke ekta chhotto gift. 
                  Shobai khub bhalo bhabe pujo katao, Maa Durga-r ashirbaad shobar jibone thakuk!
                </p>

                <div className="pt-2">
                  <a 
                    href="mailto:subhadeepadhikary30@gmail.com"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>subhadeepadhikary30@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  📍 Kolkata, West Bengal
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  🎓 Tech & Design Enthusiast
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold">
                  ❤️ 100% Pujo Hopper at Heart
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Section: "Keno banalam eta?" (Why I Built This) */}
        <div className="space-y-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Real Hopper Pain Points Solved</span>
            </div>
            <h3 className="font-heritage text-3xl sm:text-4xl font-black text-white">
              Keno banalam eta? <span className="font-bengali text-gold-gradient">(কেন বানালাম এটা?)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              The everyday struggles faced by newcomers, out-of-town visitors, and students who want to experience 
              Bengal's greatest festival effectively without exhaustion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemsSolved.map((item, idx) => (
              <div 
                key={idx}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-amber-400/30 transition-all duration-300 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-heritage text-base sm:text-lg font-bold text-white">
                      {item.title}
                    </h4>
                    <span className="font-bengali text-xs text-amber-300/80 font-medium block">
                      {item.bengali}
                    </span>
                  </div>
                </div>

                <div className="bg-[#140E1B] rounded-xl p-3.5 border border-white/5 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" />
                    <span>The Problem</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {item.problem}
                  </p>
                </div>

                <div className="bg-amber-500/10 rounded-xl p-3.5 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    <span>How Aamar Pujo Solves It</span>
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
                    {item.solution}
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* User Feedback & Suggestions Card (Google Form) */}
        <div className="mt-14 glass-card rounded-3xl p-6 sm:p-10 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#1B1126] via-[#130B1C] to-[#0A070D]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <MessageSquareHeart className="w-4 h-4 text-rose-500 fill-current" />
                <span>Tomader Motamot & Suggestions (তোমাদের মতামত)</span>
              </div>
              
              <h3 className="font-heritage text-2xl sm:text-3xl font-black text-white">
                Help Us Make <span className="text-gold-gradient">Aamar Pujo</span> Even Better!
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Kono pandal ki miss hoye geche? Kono rasta ba metro route-e vul ache? Ba notun kono feature chai? 
                Please share your honest feedback, pandal updates, or ideas with Subhadeep directly through this Google Form. 
                Every single response is read and valued!
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-amber-200/80 font-medium">
                <span className="flex items-center gap-1">✨ 1-Minute Quick Form</span>
                <span>•</span>
                <span className="flex items-center gap-1">📍 Request New Pandals</span>
                <span>•</span>
                <span className="flex items-center gap-1">💡 Suggest Features</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <a
                href="https://forms.gle/qpq8CS3kgwwcpkri7"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white font-heritage font-bold text-sm sm:text-base shadow-xl shadow-rose-950/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-300/40"
              >
                <span>Share Your Feedback</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal, Fair Use & Non-Commercial Heritage Notice */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#100B17] border border-amber-500/20 text-slate-400 text-xs leading-relaxed space-y-2.5 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Copyright, Fair Use & Non-Commercial Cultural Heritage Notice</span>
          </div>
          <p>
            <strong>Aamar Pujo</strong> is an independent, 100% free, non-commercial cultural community initiative created solely to assist devotees, families, and tourists in navigating Kolkata’s UNESCO-recognized Intangible Cultural Heritage — Durga Puja.
          </p>
          <p>
            All musical audio recordings, compositions, lyrics, logos, and cultural media belong entirely to their respective original copyright holders, musicians, recording artists, and authorized music labels. Audio is provided strictly for educational appreciation, cultural continuity, and non-commercial festive celebration under <strong>Section 52 of the Indian Copyright Act, 1957 (Fair Dealing for non-commercial research & education)</strong> and international Fair Use doctrines.
          </p>
          <p className="text-slate-400">
            No monetization, commercial ads, subscription fees, or revenue generation exist on this portal. If you are an artist, copyright holder, or organization and wish to request updated attribution or immediate removal of any piece of media, please contact the creator directly at <a href="mailto:subhadeepadhikary30@gmail.com" className="text-amber-300 underline font-semibold hover:text-amber-200">subhadeepadhikary30@gmail.com</a> and we will promptly comply.
          </p>
        </div>

      </div>
    </section>
  );
}
