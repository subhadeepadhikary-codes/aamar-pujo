/**
 * Dawon Smart Response Cache Engine
 * Caches Gemini AI queries locally with phonetic normalization, LRU pruning,
 * and high-frequency pre-seeded answers. Consumes 0 API quota on cache hits!
 */

import { normalizePhonetic } from "./phoneticSearch.js";

const CACHE_KEY = "aamar_pujo_dawon_cache";
const MAX_CACHE_ENTRIES = 150;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days freshness

// In-memory hot cache for synchronous <1ms lookups
let memoryCache = null;

// Normalize query to comparable sound/intent key
export function getQueryCacheKey(query) {
  if (!query || typeof query !== "string") return "";
  const cleaned = query
    .toLowerCase()
    .replace(/[?!.,;:"'(){}[\]\-+/*#@$%^&_=]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Combine standard clean string with phonetic representation
  return `${cleaned}__${normalizePhonetic(cleaned)}`;
}

// Pre-seeded high-frequency Durga Puja queries
const PRESEEDED_RESPONSES = [
  {
    pattern: /ashtami\s*(anjali|timing|rules)|maha\s*ashtami\s*anjali/i,
    text: `🌸 **Maha Ashtami Pushpanjali Timings & Guidelines**

• **Auspicious Timings**: Pushpanjali on Maha Ashtami is customarily offered between 09:30 AM and 11:30 AM (before Sandhi Puja).
• **Attire**: Traditional clean attire (Dhoti-Kurta / Saree) is reverently worn.
• **Offerings**: Devotees fast until offering Pushpanjali with fresh flowers (Jaba/Hibiscus, Bel leaves, and Chandan).
• **Mantra**: The priest chants the sacred Ashtami Dhyana and Pranam Mantra. Repeat each stanza with devotion and offer flowers at Maa Durga's lotus feet at the sound of the bell and shankha (conch shell)!`
  },
  {
    pattern: /sandhi\s*puja|108\s*(lotuses|diyas|pradip)|sandhi\s*pujo/i,
    text: `🔥 **Sandhi Puja Timings & Significance**

• **The Sacred Moment**: Sandhi Puja marks the precise celestial conjunction of the last 24 minutes of Maha Ashtami and the first 24 minutes of Maha Nabami (48 minutes total).
• **Mythological Triumph**: It was during this divine transition that Devi Durga took the formidable avatar of **Chamunda** to annihilate the demons Chanda and Munda.
• **Ritual Splendor**: 108 blue/pink lotuses (*Nilpadma*) and 108 earthen ghee lamps (*pradip*) are illuminated amidst continuous, thunderous Dhak rhythms and conch blowing.
• **Pro-Tip**: Arrive at major pandals (e.g., Bagbazar, Sovabazar Rajbari, Ekdalia) at least 1 hour early to witness this magnificent spectacle safely.`
  },
  {
    pattern: /midnight\s*metro|metro\s*(timing|schedule|night)|pujo\s*metro/i,
    text: `🚇 **Kolkata Metro Durga Puja Night Transit Schedule**

• **Blue Line (Dakshineswar ⇄ Kavi Subhash)**: Runs throughout the night from Saptami to Nabami! Special night services operate every 10–12 minutes until 04:00 AM.
• **Green Line (Howrah Maidan ⇄ Esplanade)**: Operational until midnight, providing quick underwater Hooghly river crossings in just 45 seconds!
• **Green Line (Sector V ⇄ Sealdah)**: Extended festive evening service connecting Salt Lake pandals to Sealdah Railway Station.
• **Tip**: Buy an open Smart Card or QR token in advance on your mobile to bypass long station ticket counter lines during peak puja nights (09 PM – 02 AM).`
  },
  {
    pattern: /best\s*(biryani|rolls|food|khabar)|where\s*to\s*eat\s*biryani/i,
    text: `🍽️ **Kolkata Pujo Food & Culinary Hotspots**

1. **Legendary Kolkata Biryani**:
   • **Arsalan** (Park Circus 7-Point / Ruby / Hatibagan) – Signature aromatic long-grain rice with melt-in-mouth aloo & mutton.
   • **Aminia** (New Market / Golpark / Behala) – Historic Mughlai classic.
   • **Royal Indian Hotel** (Chitpur / Park Circus) – Authentic Lucknowi mutton chaap & biryani.

2. **World-Famous Kolkata Kati Rolls**:
   • **Kusum Rolls** & **Nizam's** (Park Street & New Market) – The birthplace of kathi rolls.
   • **Campari** (Gariahat) & **Hot Kathi Roll** (Park Street).

3. **Heritage Cabins & Snacks**:
   • **Mitra Cafe** (Shobhabazar / Behala) – Diamond Fish Fry & Mutton Kabiraji.
   • **Peter Cat** (Park Street) – Famous Chelo Kebab with buttered rice & fried egg.`
  }
];

// Initialize memory cache from localStorage
function initCache() {
  if (memoryCache !== null) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      memoryCache = JSON.parse(raw);
    } else {
      memoryCache = {};
    }
  } catch (err) {
    console.warn("Failed to read Dawon cache:", err);
    memoryCache = {};
  }
  return memoryCache;
}

// Persist memory cache back to localStorage with LRU eviction
function persistCache() {
  try {
    const keys = Object.keys(memoryCache);
    if (keys.length > MAX_CACHE_ENTRIES) {
      // Sort by timestamp ascending (oldest first) and evict excess entries
      const sortedKeys = keys.sort((a, b) => (memoryCache[a]?.ts || 0) - (memoryCache[b]?.ts || 0));
      const toDelete = sortedKeys.slice(0, keys.length - MAX_CACHE_ENTRIES);
      toDelete.forEach(k => delete memoryCache[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch (err) {
    console.warn("Failed to persist Dawon cache to localStorage:", err);
  }
}

/**
 * Check cache for an existing verified answer.
 * Checks pre-seeded rules first, then localStorage dynamic cache.
 */
export function getCachedResponse(query) {
  if (!query || typeof query !== "string") return null;
  const trimmed = query.trim();

  // 1. Check pre-seeded rules (instant match)
  for (const item of PRESEEDED_RESPONSES) {
    if (item.pattern.test(trimmed)) {
      return {
        text: item.text,
        source: "Dawon Pujo Guide (Verified)",
        cached: true
      };
    }
  }

  // 2. Check dynamic cache
  const cache = initCache();
  const cacheKey = getQueryCacheKey(trimmed);

  if (cache[cacheKey]) {
    const entry = cache[cacheKey];
    // Check TTL
    if (Date.now() - (entry.ts || 0) < CACHE_TTL_MS) {
      // Update LRU hit count and timestamp
      entry.hits = (entry.hits || 1) + 1;
      entry.ts = Date.now();
      persistCache();
      return {
        text: entry.text,
        routeData: entry.routeData || null,
        source: "Dawon Smart Cache",
        cached: true
      };
    } else {
      // Stale entry
      delete cache[cacheKey];
      persistCache();
    }
  }

  return null;
}

/**
 * Save an AI-generated or dynamic response into the smart cache.
 */
export function setCachedResponse(query, responseData) {
  if (!query || !responseData || !responseData.text) return;
  const cache = initCache();
  const cacheKey = getQueryCacheKey(query);

  cache[cacheKey] = {
    text: responseData.text,
    routeData: responseData.routeData || null,
    ts: Date.now(),
    hits: 1
  };

  persistCache();
}
