/**
 * Bengali-English Phonetic & Homophone Search Engine
 * Handles transliteration differences between how devotees speak/type 
 * and official pandal/restaurant names (e.g., sribhumi vs sreebhumi, kumortuli vs kumartuli).
 */

// Phonetic normalizer: simplifies Bengali transliteration into comparable sound keys
export function normalizePhonetic(str) {
  if (!str) return "";
  let s = str.toLowerCase().trim();

  // 1. Common Bengali-English vowel and diphthong variations
  s = s.replace(/ee|ea|y/g, "i");
  s = s.replace(/oo|ou/g, "u");
  s = s.replace(/ae|ai|ei/g, "e");
  s = s.replace(/o/g, "a"); // In Bengali, 'o' and 'a' sounds (e.g. sovabazar vs shobhabazar, kumortuli vs kumartuli)

  // 2. Consonant clusters and aspirated consonants
  s = s.replace(/sh|sz/g, "s");
  s = s.replace(/v|w|bh/g, "b");
  s = s.replace(/dh/g, "d");
  s = s.replace(/th/g, "t");
  s = s.replace(/kh/g, "k");
  s = s.replace(/gh/g, "g");
  s = s.replace(/ph/g, "f");
  s = s.replace(/ch/g, "c");
  s = s.replace(/jh/g, "j");
  s = s.replace(/ng/g, "n");

  // 3. Remove non-alphanumeric characters
  s = s.replace(/[^a-z0-9]/g, "");

  // 4. Collapse consecutive duplicate consonants (e.g., 'tt' -> 't', 'll' -> 'l', 'ss' -> 's')
  s = s.replace(/([a-z])\1+/g, "$1");

  return s;
}

// Curated homophone & popular slang alias dictionary for famous pandals
export const HOMOPHONE_ALIASES = {
  // Sreebhumi variations
  "sribhumi": "Sreebhumi Sporting Club",
  "sribhumy": "Sreebhumi Sporting Club",
  "shreebhumi": "Sreebhumi Sporting Club",
  "shribhumi": "Sreebhumi Sporting Club",
  "sree bhumi": "Sreebhumi Sporting Club",
  "laketown": "Sreebhumi Sporting Club",
  "lake town": "Sreebhumi Sporting Club",

  // Suruchi variations
  "suruchi": "Suruchi Sangha",
  "shuruchi": "Suruchi Sangha",
  "suruci": "Suruchi Sangha",
  "suruchi sangho": "Suruchi Sangha",

  // Kumartuli variations
  "kumortuli": "Kumartuli Park",
  "kumortuli sarbojanin": "Kumartuli Sarbojanin",
  "kumartoli": "Kumartuli Park",
  "kumortuly": "Kumartuli Park",

  // Shobhabazar variations
  "sovabazar": "Shobhabazar Rajbari",
  "shovabazar": "Shobhabazar Rajbari",
  "sobhabazar": "Shobhabazar Rajbari",
  "shobha bazar": "Shobhabazar Rajbari",
  "sobhabaajar": "Shobhabazar Rajbari",

  // Kashi Bose Lane
  "kashibose": "Kashi Bose Lane",
  "kashi bose": "Kashi Bose Lane",
  "kasibose": "Kashi Bose Lane",
  "kashi basu": "Kashi Bose Lane",

  // Beleghata Karmi Sangha
  "beleghata": "Beleghata Karmi Sangha",
  "beliaghata": "Beleghata Karmi Sangha",
  "beleghata karmi": "Beleghata Karmi Sangha",
  "karmi sangha": "Beleghata Karmi Sangha",
  "karmi sangho": "Beleghata Karmi Sangha",

  // Bagbazar
  "bagbazar": "Bagbazar Sarbojanin",
  "baghbazar": "Bagbazar Sarbojanin",
  "baagbazar": "Bagbazar Sarbojanin",

  // Ekdalia
  "ekdalia": "Ekdalia Evergreen Club",
  "ekdaliya": "Ekdalia Evergreen Club",
  "ekdalia evergreen": "Ekdalia Evergreen Club",

  // Chetla Agrani
  "chetla": "Chetla Agrani Club",
  "cetla": "Chetla Agrani Club",
  "chetla agrani": "Chetla Agrani Club",

  // Deshapriya
  "deshapriya": "Deshapriya Park",
  "deshopriyo": "Deshapriya Park",
  "deshpriya": "Deshapriya Park",

  // Tridhara
  "tridhara": "Tridhara Sammilani",
  "tridhora": "Tridhara Sammilani",

  // Santosh Mitra Square / Lebutala
  "santosh mitra": "Santosh Mitra Square",
  "santoshmitra": "Santosh Mitra Square",
  "lebutala": "Santosh Mitra Square",
  "lebutola": "Santosh Mitra Square",

  // College Square
  "college square": "College Square",
  "collegesquare": "College Square",
  "college squar": "College Square",

  // Chaltabagan
  "chaltabagan": "Manicktala Chaltabagan",
  "chalta bagan": "Manicktala Chaltabagan",
  "caltabagan": "Manicktala Chaltabagan",

  // Behala pandals
  "behala nutan dal": "Behala Nutan Dal",
  "notun dal": "Behala Nutan Dal",
  "barisha": "Barisha Club",
  "barisha club": "Barisha Club",
  "parnasree": "Parnasree Pally",
  "parnashree": "Parnasree Pally",

  // Iconic Bonedi Bari aliases & homophones
  "shamul dhone": "Shamul Dhone Dutta Bari (Girish Park)",
  "shamuldhone": "Shamul Dhone Dutta Bari (Girish Park)",
  "shyamal dhone": "Shamul Dhone Dutta Bari (Girish Park)",
  "shyamaldhone": "Shamul Dhone Dutta Bari (Girish Park)",
  "shib krishna daw": "Jorasanko Shib Krishna Daw Bari",
  "shibkrishna daw": "Jorasanko Shib Krishna Daw Bari",
  "shib krishna dawn": "Jorasanko Shib Krishna Daw Bari",
  "jorasanko daw bari": "Jorasanko Shib Krishna Daw Bari",
  "daw bari": "Jorasanko Shib Krishna Daw Bari",
  "narasingha dawn": "Jorasanko Narasingha Dawn Bari",
  "narsingha dawn": "Jorasanko Narasingha Dawn Bari",
  "narasimha dawn": "Jorasanko Narasingha Dawn Bari",
  "dawn bari": "Jorasanko Narasingha Dawn Bari",
  "thanthania lahabari": "Thanthania Laha Bari",
  "thanthania laha": "Thanthania Laha Bari",
  "lahabari": "Thanthania Laha Bari",
  "laha bari": "Thanthania Laha Bari",
  "khelat ghosh": "Pathuriaghata Khelat Ghosh Bari",
  "khelat ghosh bari": "Pathuriaghata Khelat Ghosh Bari",
  "khelat chunder ghosh": "Pathuriaghata Khelat Ghosh Bari",
  "bhukailash": "Bhukailash Rajbari",
  "bhukailas": "Bhukailash Rajbari",
  "khidirpur rajbari": "Bhukailash Rajbari",
  "basu mallick": "Basu Mallick Thakurbari",
  "bosu mallick": "Basu Mallick Thakurbari",
  "basu mullick": "Basu Mallick Thakurbari",
  "motilal seal": "Motilal Seal's Bari",
  "motilal sil": "Motilal Seal's Bari",
  "mutty lall seal": "Motilal Seal's Bari",
  "seal bari": "Motilal Seal's Bari",
  "rakhaldas halder": "Rakhaldas Halder Bari",
  "rakhal das halder": "Rakhaldas Halder Bari",
  "chatu babu": "Chhatu Babu Latu Babu Thakur Bari",
  "chhatu babu": "Chhatu Babu Latu Babu Thakur Bari",
  "latu babu": "Chhatu Babu Latu Babu Thakur Bari",
  "ramdulal nibas": "Chhatu Babu Latu Babu Thakur Bari",
  "rani rashmoni": "Rani Rashmoni Family's Durga Puja (Janbazar)",
  "janbazar rani rashmoni": "Rani Rashmoni Family's Durga Puja (Janbazar)",
  "sonar durga": "Behala Jagat Ram Mukherjee Bari (Sonar Durga)",
  "jagatram mukherjee": "Behala Jagat Ram Mukherjee Bari (Sonar Durga)",
  "aatchala": "Sabarna Roy Choudhury Aatchala Bari (Barisha)",
  "aatchala bari": "Sabarna Roy Choudhury Aatchala Bari (Barisha)",
  "sabarna roy": "Sabarna Roy Choudhury Aatchala Bari (Barisha)",
  "sabarna aatchala": "Sabarna Roy Choudhury Aatchala Bari (Barisha)",
  "balaram dey": "Balaram Dey Street Dutta Bari",
  "balaram dey dutta bari": "Balaram Dey Street Dutta Bari",
  "hathkhola dutta": "Hathkhola Dutta Bari",
  "darjipara mitra": "Darjipara Mitra Bari",
  "bhawanipore mallick": "Bhawanipore Mallick Bari",
  "ranjit mallick bari": "Bhawanipore Mallick Bari",
  "kundu bari": "Bhawanipore Kundu Bari"
};

/**
 * Levenshtein distance for fuzzy matching typos
 */
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Get dynamic smart search suggestions (including homophones & aliases)
 */
export function getSmartSearchSuggestions(query, pandalsList, maxSuggestions = 4) {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const suggestions = new Set();
  const qNorm = normalizePhonetic(q);

  // 1. Direct homophone map check
  for (const [alias, targetName] of Object.entries(HOMOPHONE_ALIASES)) {
    if (alias.includes(q) || q.includes(alias) || normalizePhonetic(alias).includes(qNorm)) {
      suggestions.add(targetName);
    }
  }

  // 2. Phonetic comparison with pandal names
  for (const p of pandalsList) {
    if (suggestions.size >= maxSuggestions) break;

    const pName = p.name;
    const pNorm = normalizePhonetic(pName);

    // Substring or phonetic containment
    if (pName.toLowerCase().includes(q)) {
      suggestions.add(pName);
    } else if (pNorm.includes(qNorm)) {
      suggestions.add(pName);
    } else if (q.length >= 4) {
      // Fuzzy match first word or key token
      const pWords = pName.toLowerCase().split(/\s+/);
      for (const w of pWords) {
        if (w.length >= 4 && levenshteinDistance(q, w) <= 1) {
          suggestions.add(pName);
          break;
        }
      }
    }
  }

  return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Filter pandals using exact, alias, and phonetic matching
 */
export function filterPandalsPhonetically(pandalsList, query) {
  const q = query.trim().toLowerCase();
  if (!q) return pandalsList;

  const qNorm = normalizePhonetic(q);

  // Check if query matches a known homophone alias
  let targetAlias = null;
  for (const [alias, targetName] of Object.entries(HOMOPHONE_ALIASES)) {
    if (alias === q || normalizePhonetic(alias) === qNorm) {
      targetAlias = targetName.toLowerCase();
      break;
    }
  }

  return pandalsList.filter(p => {
    const nameLower = p.name.toLowerCase();
    const zoneLower = (p.zoneLabel || "").toLowerCase();
    const areaLower = (p.area || "").toLowerCase();
    const localityLower = (p.locality || "").toLowerCase();
    const metroLower = (p.metro || "").toLowerCase();

    // 1. Exact or partial substring match
    if (
      nameLower.includes(q) ||
      (p.bengaliName && p.bengaliName.toLowerCase().includes(q)) ||
      zoneLower.includes(q) ||
      areaLower.includes(q) ||
      localityLower.includes(q) ||
      metroLower.includes(q)
    ) {
      return true;
    }

    // 1b. Aliases array match
    if (p.aliases && Array.isArray(p.aliases)) {
      const aliasMatch = p.aliases.some(a => {
        const aLower = a.toLowerCase();
        return aLower.includes(q) || normalizePhonetic(a).includes(qNorm);
      });
      if (aliasMatch) return true;
    }

    // 1c. Bonedi Bari / Rajbari category intent search
    if (
      (q === "bonedi" || q === "bonedi bari" || q === "bonedi pujo" || q === "rajbari" || q === "bonedi baris") &&
      p.isBonediBari
    ) {
      return true;
    }

    // 2. Homophone alias target match
    if (targetAlias && nameLower.includes(targetAlias)) {
      return true;
    }

    // 3. Phonetic normalizer match
    const pNameNorm = normalizePhonetic(p.name);
    const pLocNorm = normalizePhonetic(p.locality || "");
    if (pNameNorm.includes(qNorm) || (qNorm.length >= 4 && pLocNorm.includes(qNorm))) {
      return true;
    }

    // 4. Fuzzy distance for typos
    if (q.length >= 4) {
      const words = nameLower.split(/\s+/);
      for (const w of words) {
        if (w.length >= 4 && levenshteinDistance(q, w) <= 1) {
          return true;
        }
      }
    }

    return false;
  });
}
