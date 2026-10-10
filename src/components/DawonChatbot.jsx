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

import { 
  parseRouteQuery, 
  generateDynamicRoute, 
  handleOpenEndedQuery,
  identifyHub 
} from "../utils/transitEngine";

export default function DawonChatbot({ userLocation, onNavigateToPandal, isAudioPlaying }) {
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

  // Dynamic Route Resolver using Transit Engine
  const resolveQueryRoute = (query) => {
    // 1. Try parsing origin and destination (e.g. "how to reach sreebhumi from behala thana")
    const parsed = parseRouteQuery(query);
    if (parsed) {
      const dynamicRoute = generateDynamicRoute(parsed.originQuery, parsed.destinationQuery, userLocation);
      if (dynamicRoute) {
        return dynamicRoute;
      }
    }

    // 2. Try identifying single hub or pandal mentioned in query (e.g. "sreebhumi" or "bagbazar")
    const hub = identifyHub(query);
    if (hub) {
      const dynamicRoute = generateDynamicRoute(null, hub.name, userLocation);
      if (dynamicRoute) {
        return dynamicRoute;
      }
    }

    return null;
  };

  // Send message handler (Ollama with Dynamic Local Fallback)
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

    // 1. Attempt Ollama API call if configured
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
      return;
    }

    // 2. Check for Open-Ended Puja Knowledge Query (Anjali, Sandhi Puja, Metro timing, VIP passes, Biryani)
    const openEndedAnswer = handleOpenEndedQuery(text);
    if (openEndedAnswer) {
      setMessages((prev) => [
        ...prev,
        {
          id: `dawon-${Date.now()}`,
          sender: "dawon",
          text: openEndedAnswer.text,
          source: "Dawon Pujo Guide",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // 3. Check for Dynamic Transit Route (Parses exact origin & destination)
    const dynamicRoute = resolveQueryRoute(text);
    if (dynamicRoute) {
      setMessages((prev) => [
        ...prev,
        {
          id: `dawon-${Date.now()}`,
          sender: "dawon",
          routeData: dynamicRoute,
          source: "Dawon Kolkata Transit Engine",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // 4. Conversational General Fallback
    setMessages((prev) => [
      ...prev,
      {
        id: `dawon-${Date.now()}`,
        sender: "dawon",
        text: `Kolkata-r kono specific pandal ba station-e jete chao? 
Bolo: "How to reach Sreebhumi from Behala Thana" ba "Bagbazar from Garia". 
Ami tomake exact Metro line, feeder auto, walk distance ar food pitstop bole debo!

Ba jiggesh korte paro: "Ashtami anjali timing", "Metro night timings", ba "Where to eat best biryani?"`,
        source: "Dawon Smart Guide",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    "How to reach Sreebhumi from Behala Thana?",
    "How to reach Bagbazar from Garia?",
    "Maha Ashtami Anjali Timings & Rules",
    "Midnight Metro schedule during Pujo",
    "Where to eat best biryani and rolls?"
  ];

  return (
    <div className={`fixed z-50 font-sans transition-all duration-300 ${
      isAudioPlaying 
        ? "bottom-20 right-3 sm:bottom-6 sm:right-6" 
        : "bottom-5 right-3 sm:bottom-6 sm:right-6"
    }`}>
      
      {/* Floating Action Mascot Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="relative group flex items-center space-x-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-slate-950 font-black shadow-2xl shadow-rose-600/50 border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Open Dawon - AI Pujo Transit Guide"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 flex items-center justify-center text-base sm:text-lg flex-shrink-0 border border-amber-300/40 shadow-inner">
            🦁
          </div>
          <div className="text-left">
            <span className="block text-xs font-black tracking-wide leading-tight text-slate-950">
              Dawon AI
            </span>
            <span className="hidden sm:block text-[9px] font-bold text-slate-900/80 leading-tight">
              Transit & Pandal Guide
            </span>
          </div>
          <span className="relative flex h-2.5 w-2.5 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          className={`w-[94vw] sm:w-[410px] max-w-md bg-[#120A1A] border-2 border-amber-400/60 rounded-3xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[540px] max-h-[82vh]"
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
