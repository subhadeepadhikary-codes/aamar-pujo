import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Settings, 
  Sparkles, 
  Train, 
  Navigation, 
  Compass, 
  Utensils, 
  ShieldCheck, 
  Bot, 
  User, 
  RotateCcw,
  Flame,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

// Pre-packaged Kolkata Puja Transit Knowledge Base for instantaneous offline replies
const TRANSIT_KNOWLEDGE_BASE = [
  {
    keywords: ["sreebhumi", "sribhumi", "lake town", "howrah to sreebhumi"],
    title: "Howrah Station / Central to Sreebhumi Sporting Club (Lake Town)",
    route: [
      { type: "metro", text: "Take Green Line Metro from Howrah Station to Sealdah (underwater tunnel route, ~8 mins) OR from Central take Blue Line to Dum Dum Metro." },
      { type: "auto", text: "From Dum Dum Metro (Platform 1 Exit), take direct auto/shuttle to VIP Road / Lake Town Clock Tower crossing (₹20-₹25)." },
      { type: "walk", text: "Walk 450m down Lake Town VIP Road entrance corridor. Follow police one-way pedestrian ropes to Sreebhumi pandal." },
      { type: "food", text: "Food Pitstop: Stop at VIP Sweets or Lake Town fast food stalls for egg-chicken rolls & kachori." },
      { type: "tip", text: "Pro-Tip: Sreebhumi gets massive crowds after 5 PM. Best time to visit is afternoon 1:30 PM - 4:00 PM!" }
    ]
  },
  {
    keywords: ["bagbazar", "kumartuli", "ahiritola", "north kolkata route", "sovabazar"],
    title: "Classic North Kolkata Heritage Trail (Bagbazar -> Kumartuli -> Ahiritola)",
    route: [
      { type: "metro", text: "Take Blue Line Metro to Shyambazar Station (Exit Gate 1) or Shobhabazar Sutanuti (Exit Gate 2)." },
      { type: "walk", text: "Start at Bagbazar Sarbojanin (6 min walk from Shyambazar down Girish Avenue). Pure traditional sabeki pratima." },
      { type: "walk", text: "Walk 10 mins south along Rabindra Sarani to Kumartuli Park & Kumartuli Sarbojanin." },
      { type: "walk", text: "Continue 6 mins towards Ganges ghat to reach Ahiritola Jubak Brinda & Beniatola." },
      { type: "food", text: "Food Pitstop: Mitra Cafe (Sovabazar) for legendary Diamond Fish Fry & Mutton Kabiraji, or Golbari for Kosha Mangsho!" },
      { type: "tip", text: "Bonus: Shobhabazar Rajbari is right next door (entry free during daytime)." }
    ]
  },
  {
    keywords: ["kalighat to gariahat", "deshapriya", "tridhara", "ekdalia", "ballygunge", "south kolkata"],
    title: "South Kolkata Mega Circuit (Deshapriya Park -> Tridhara -> Ekdalia -> Singhi Park)",
    route: [
      { type: "metro", text: "Take Blue Line Metro to Kalighat Metro Station (Exit Gate 2 - Rashbehari Avenue)." },
      { type: "walk", text: "Walk 400m east along Rashbehari Avenue to reach Deshapriya Park & Priya Cinema junction." },
      { type: "walk", text: "Cross over to Manohar Pukur Road (3 mins walk) for Tridhara Sammilani." },
      { type: "walk", text: "Walk 6 mins through Gariahat under the flyover to Ekdalia Evergreen Club & Singhi Park." },
      { type: "food", text: "Food Pitstop: Campari (Gariahat) for Fish Roll, Bedouin for King Rolls, or Maharani for Hing Kochuri & Jalebi." },
      { type: "tip", text: "Pro-Tip: Avoid cabs along Rashbehari; police closes vehicle movement. Walking this trail takes only ~20 mins total." }
    ]
  },
  {
    keywords: ["esplanade", "dharmatala", "central", "new market", "college square", "md ali park"],
    title: "Central Kolkata Aquatic & Royal Illuminations Trail",
    route: [
      { type: "metro", text: "Get down at Esplanade Metro Station (Interchange for Blue Line & Green Line)." },
      { type: "walk", text: "Walk 5 mins (450m) to Rani Rashmoni Family Rajbari Puja at Janbazar (SN Banerjee Road)." },
      { type: "walk", text: "Walk 400m north to Subodh Mallick Square (Wellington Nagarik Kalyan)." },
      { type: "metro", text: "Hop onto Blue Line from Central / Chandni Chowk 1 stop north to MG Road Metro." },
      { type: "walk", text: "Visit Muhammad Ali Park (famous for palatial replicas) and College Square (grand illuminated reflections on the lake)." },
      { type: "food", text: "Food Pitstop: Chitto Babur Dokan (Dacres Lane) for Chicken Stew & Toast, Anadi Cabin for Mughlai Paratha, or Putiram for Radhaballabhi." }
    ]
  },
  {
    keywords: ["salt lake", "fd block", "bj block", "sealdah to salt lake", "city centre"],
    title: "Salt Lake Mega Pandals (FD Block, BJ Block, AK Block)",
    route: [
      { type: "metro", text: "Take Green Line Metro to City Centre Station or Central Park Station." },
      { type: "walk", text: "From City Centre Metro, walk 5 mins to BJ Block or take a local toto/rickshaw (₹15) to FD Block." },
      { type: "walk", text: "FD Block is Salt Lake's most famous grand theme pandal with massive open park space." },
      { type: "food", text: "Food Pitstop: Saptapadi (Salt Lake Sector 1), Oudh 1590 (near FD Block), or Chowman Sector 2." }
    ]
  },
  {
    keywords: ["behala", "south west", "barisha", "taratala"],
    title: "South-West Kolkata & Behala Circuit",
    route: [
      { type: "metro", text: "Take Purple Line Metro to Behala Chowrasta or Taratala Metro Station." },
      { type: "walk", text: "Visit Barisha Club, Behala Nutan Dal, and Behala Club (all within 5-10 mins walk from Chowrasta)." },
      { type: "auto", text: "Take auto from Chowrasta to Parnasree Pally (₹15) for award-winning theme pujos." },
      { type: "food", text: "Food Pitstop: Mitra Cafe Behala Chowrasta for Fish Fry, Parnasree Roll Corner for Chicken Rolls, or Haji Saheb for Biryani." }
    ]
  },
  {
    keywords: ["roll", "rolls", "food", "kathi roll", "street food", "eat"],
    title: "Kolkata's Legendary Street Food & Roll Trail",
    route: [
      { type: "metro", text: "Park Street Metro: Kusum Rolls (flaky Kathi rolls) and Hot Kathi Roll." },
      { type: "metro", text: "Esplanade Metro: Nizam's (the 1932 birthplace of Kathi Rolls) and Dacres Lane Chicken Stew." },
      { type: "metro", text: "Gariahat / Kalighat: Bedouin King Rolls & Campari Fried Cutlets." },
      { type: "metro", text: "College Street: Kalika Mukhorochak for Fish Chop and Mutton Chop with pungent Kasundi." }
    ]
  }
];

export default function DawonChatbot({ userLocation, onNavigateToPandal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Ollama Settings
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem("aamar_pujo_ollama_url") || "http://localhost:11434");
  const [ollamaApiKey, setOllamaApiKey] = useState(() => localStorage.getItem("aamar_pujo_ollama_key") || "");
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem("aamar_pujo_ollama_model") || "llama3.2");

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "msg-welcome",
      sender: "dawon",
      text: "Nomoshkar! Ami Dawon 🦁 — Maa Durga-r bahon ar tomader AI Pujo Transit Guide! Kothay jabe bolo? Metro, auto, walk koto door — step-by-step best rasta bole debo!",
      time: "Just now"
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle Ollama Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("aamar_pujo_ollama_url", ollamaUrl.trim());
    localStorage.setItem("aamar_pujo_ollama_key", ollamaApiKey.trim());
    localStorage.setItem("aamar_pujo_ollama_model", ollamaModel.trim());
    setShowSettings(false);
    
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "dawon",
        text: `⚙️ Settings updated! Connected to Ollama at "${ollamaUrl}" using model "${ollamaModel}".`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Local Knowledge Route Matcher
  const findLocalRoute = (query) => {
    const q = query.toLowerCase();
    for (const item of TRANSIT_KNOWLEDGE_BASE) {
      if (item.keywords.some((kw) => q.includes(kw))) {
        return item;
      }
    }
    return null;
  };

  // Send message handler (Ollama with Smart Local Fallback)
  const handleSendMessage = async (textToSend = inputMessage) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // 1. Try local knowledge first for instant accurate routing
    const localMatch = findLocalRoute(text);

    // 2. Attempt Ollama API call if configured
    let aiResponse = null;
    const cleanUrl = (ollamaUrl || "http://localhost:11434").replace(/\/+$/, "");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const headers = { "Content-Type": "application/json" };
      if (ollamaApiKey) {
        headers["Authorization"] = `Bearer ${ollamaApiKey}`;
      }

      const prompt = `You are Dawon, a friendly Bengali AI Durga Puja transit navigator for Kolkata. 
The user asks: "${text}".
Explain the best path to reach there using Kolkata Metro, auto-rickshaw routes, and walking distance. 
Highlight any famous food or roll stops nearby. Be concise, cheerful, and use colloquial Benglish phrases.`;

      const res = await fetch(`${cleanUrl}/api/generate`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: ollamaModel || "llama3.2",
          prompt,
          stream: false
        })
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.response) {
          aiResponse = data.response;
        }
      }
    } catch (err) {
      // Ollama not reachable / CORS / offline: fallback seamlessly
      console.log("Ollama call skipped or offline, using Dawon internal transit engine:", err.message);
    }

    setIsTyping(false);

    if (aiResponse) {
      setMessages((prev) => [
        ...prev,
        {
          id: `dawon-${Date.now()}`,
          sender: "dawon",
          text: aiResponse,
          source: `Ollama (${ollamaModel})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (localMatch) {
      setMessages((prev) => [
        ...prev,
        {
          id: `dawon-${Date.now()}`,
          sender: "dawon",
          routeData: localMatch,
          source: "Dawon Kolkata Transit Engine",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      // General Transit Advice
      setMessages((prev) => [
        ...prev,
        {
          id: `dawon-${Date.now()}`,
          sender: "dawon",
          text: `Eita cover korar shobcheye shundor rasta holo:\n1. 🚇 Kolkata Metro dhore nearest station-e nambo (Blue Line for North-South, Green Line for East-West).\n2. 🛺 Platform exit gate-er baire theke shared auto pabe (pujo fare ₹15-₹20).\n3. 🚶 Bamboo barricade one-way line follow kore 5-10 mins walk.\n\nSpecific kono pandal (e.g. Sreebhumi, Bagbazar, Deshapriya Park, FD Block, Behala) ba food trail jante chaile niche click koro!`,
          source: "Dawon Smart Guide",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const quickPrompts = [
    "How to reach Sreebhumi from Howrah?",
    "North Kolkata trail: Bagbazar to Kumartuli",
    "South Kolkata: Kalighat to Gariahat pandals",
    "Central: Esplanade to College Square & Md Ali Park",
    "Where to eat best rolls near Park Street?"
  ];

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 font-sans">
      
      {/* Floating Action Mascot Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="relative group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-slate-950 font-black shadow-2xl shadow-rose-600/50 border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Open Dawon - AI Pujo Transit Guide"
        >
          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-lg flex-shrink-0 border border-amber-300/40 shadow-inner">
            🦁
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-black tracking-wide leading-tight text-slate-950">
              Ask Dawon
            </span>
            <span className="block text-[9px] font-bold text-slate-900/80 leading-tight">
              AI Transit & Pandal Guide
            </span>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          className={`w-[92vw] sm:w-[410px] bg-[#120A1A] border-2 border-amber-400/60 rounded-3xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[540px] max-h-[85vh]"
          }`}
        >
          {/* Top Bar Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#211130] via-[#1A0B27] to-[#211130] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-md">
                🦁
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-heritage text-sm font-black text-white">
                    Dawon <span className="font-bengali text-amber-300 text-xs">(ডাওন)</span>
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Ollama AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Kolkata Pujo Transit & Path Navigator
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-amber-300 transition"
                title="Ollama API Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-rose-600/30 hover:text-white transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Drawer */}
          {!isMinimized && showSettings && (
            <div className="p-4 bg-[#190E24] border-b border-amber-500/20 text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center space-x-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ollama AI Configuration</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Optional / Auto-fallback
                </span>
              </div>
              
              <form onSubmit={handleSaveSettings} className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Ollama Server Base URL:</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full py-1.5 px-2.5 bg-black/50 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Ollama Model Name:</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3.2, mistral, gemma2..."
                    className="w-full py-1.5 px-2.5 bg-black/50 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Ollama API Key / Bearer Token (if hosted):</label>
                  <input
                    type="password"
                    value={ollamaApiKey}
                    onChange={(e) => setOllamaApiKey(e.target.value)}
                    placeholder="Optional token for remote Ollama servers"
                    className="w-full py-1.5 px-2.5 bg-black/50 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chat Messages Body */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isUser ? "You" : "🦁 Dawon"}
                      </span>
                      {m.source && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono">
                          {m.source}
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isUser
                          ? "bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-medium rounded-tr-sm"
                          : "bg-[#1C1226] border border-amber-500/25 text-slate-200 rounded-tl-sm space-y-2"
                      }`}
                    >
                      {/* Render Structured Route if Available */}
                      {m.routeData ? (
                        <div className="space-y-2.5">
                          <div className="font-bold text-amber-300 text-xs pb-1 border-b border-white/10 flex items-center space-x-1">
                            <Compass className="w-3.5 h-3.5 text-amber-400" />
                            <span>{m.routeData.title}</span>
                          </div>
                          <div className="space-y-2">
                            {m.routeData.route.map((step, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-[11px]">
                                <span className="font-mono text-amber-400 font-bold mt-0.5">
                                  {step.type === "metro" && "🚇"}
                                  {step.type === "auto" && "🛺"}
                                  {step.type === "walk" && "🚶"}
                                  {step.type === "food" && "🍽️"}
                                  {step.type === "tip" && "💡"}
                                </span>
                                <span className="text-slate-300 leading-snug">
                                  {step.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{m.text}</p>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                      {m.time}
                    </span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">
                    🦁
                  </div>
                  <span className="flex items-center space-x-1 font-mono text-[11px] text-amber-300">
                    <span>Dawon is planning the route</span>
                    <span className="animate-pulse">...</span>
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick Prompt Suggestions Strip */}
          {!isMinimized && (
            <div className="px-3 py-1.5 bg-[#140C1D] border-t border-white/5 overflow-x-auto flex items-center space-x-1.5 scrollbar-thin">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 text-[10px] transition whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Form */}
          {!isMinimized && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#1A0E26] border-t border-white/10 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask route (e.g. Sreebhumi from Howrah)..."
                className="flex-1 py-2 px-3 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
