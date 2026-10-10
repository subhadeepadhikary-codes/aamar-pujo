/**
 * Dawon AI Transit & Knowledge Engine
 * Provides dynamic Kolkata origin-to-destination routing (Metro -> Auto -> Walking -> Food)
 * and rich contextual answers for Durga Puja queries.
 */

// 1. Kolkata Geographic Transit Hubs & Connectivity Matrix
export const KOLKATA_TRANSIT_HUBS = {
  // --- South-West Kolkata ---
  "behala": {
    name: "Behala",
    aliases: ["behala", "behala thana", "behala chowrasta", "behala tram depot", "sakher bazar", "thakurpukur", "taratala", "james long", "diamond harbour road", "dh road", "kadamtala behala"],
    zone: "South-West Kolkata",
    nearestMetro: "Kalighat / Rabindra Sarobar (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take a shared auto or bus down Diamond Harbour Road to Kalighat Metro or Rabindra Sarobar Metro (~12-15 mins, ₹15-₹20).",
    lastMileFromMetro: "From Kalighat / Rabindra Sarobar Metro, take a shared auto or bus down DH Road to Behala Chowrasta / Behala Thana (~15 mins, ₹18).",
    famousFoods: "Mitra Cafe (Behala Chowrasta) for Diamond Fish Fry, Haji Saheb for Biryani, Parnasree Roll Corner.",
    topPandals: ["Barisha Club", "Behala Nutan Dal", "Behala Club", "Parnasree Pally"]
  },
  "taratala": {
    name: "Taratala / New Alipore",
    aliases: ["taratala", "taratola", "new alipore", "majerhat", "alipore"],
    zone: "South-West Kolkata",
    nearestMetro: "Rabindra Sarobar / Kalighat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take shared auto or bus along Taratala crossing to Rabindra Sarobar Metro (~10 mins, ₹15).",
    lastMileFromMetro: "Take auto from Rabindra Sarobar Metro to Taratala crossing / New Alipore (~10 mins, ₹15).",
    famousFoods: "New Alipore roll stalls, Chai Break, local street cutlets.",
    topPandals: ["Suruchi Sangha (New Alipore)", "Chetla Agrani"]
  },

  // --- North-East & Lake Town ---
  "sreebhumi": {
    name: "Sreebhumi Sporting Club",
    aliases: ["sreebhumi", "sribhumi", "sree bhumi", "lake town", "laketown", "dakshin dari", "vip road sreebhumi"],
    zone: "North-East Kolkata",
    nearestMetro: "Dum Dum / Belgachia (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk out to VIP Road and take shared auto to Dum Dum Metro (~10 mins, ₹20).",
    lastMileFromMetro: "Get down at Dum Dum Metro (Platform 1 exit). Take a direct shared auto or bus along VIP Road to Lake Town Clock Tower / Sreebhumi crossing (~10 mins, ₹20).",
    walkCorridor: "Walk 400 meters down Lake Town VIP Road corridor following Kolkata Police barricaded one-way pedestrian lanes to Sreebhumi gate.",
    famousFoods: "VIP Sweets for baked sandesh, Lake Town crossing egg-chicken rolls, Milan Sweets.",
    tip: "Sreebhumi attracts massive crowds with 2-3 hour queues after 6 PM. Visit in the afternoon between 1:30 PM - 4:00 PM for fast entry!",
    topPandals: ["Sreebhumi Sporting Club", "Lake Town Adhibasi Brinda", "Dum Dum Park Tarun Dal"]
  },
  "dumdum_park": {
    name: "Dum Dum Park",
    aliases: ["dum dum park", "dumdum park", "tarun dal", "bharat chakra", "dumdum park tarun dal"],
    zone: "North-East Kolkata",
    nearestMetro: "Dum Dum / Belgachia (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take auto from Dum Dum Park Tank No. 1 to Dum Dum Metro (~10 mins, ₹15).",
    lastMileFromMetro: "From Dum Dum Metro or Belgachia, take auto along Jessore Road to Dum Dum Park VIP entry (~10 mins, ₹15-₹20).",
    walkCorridor: "Walk through the park pathway to visit Tarun Dal, Bharat Chakra, and Tarun Sangha in one continuous walking loop.",
    famousFoods: "Park Sweets, local fuchka and chop corners.",
    topPandals: ["Dum Dum Park Tarun Dal", "Dum Dum Park Bharat Chakra"]
  },

  // --- North Kolkata ---
  "bagbazar": {
    name: "Bagbazar Sarbojanin",
    aliases: ["bagbazar", "baghbazar", "girish avenue", "bagbazar ghat"],
    zone: "North Kolkata",
    nearestMetro: "Shyambazar (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 6 mins (500m) east along Girish Avenue to Shyambazar 5-point crossing metro gates.",
    lastMileFromMetro: "Get down at Shyambazar Metro Station (Exit Gate 1). Walk 6 mins down Girish Avenue directly to Bagbazar Sarbojanin ground.",
    walkCorridor: "Walk 6 mins west from Shyambazar 5-point crossing towards the Hooghly riverbank.",
    famousFoods: "Bagbazar confectionery, Putiram sandesh, local Radhaballabhi stalls.",
    tip: "Bagbazar is famous for 100+ years of pristine traditional Sabeki Ekchala idol and Bijoya Dashami Sindur Khela.",
    topPandals: ["Bagbazar Sarbojanin", "Mayer Bari (Sri Sarada Devi's House)"]
  },
  "kumartuli": {
    name: "Kumartuli & Ahiritola",
    aliases: ["kumartuli", "kumortuli", "ahiritola", "sovabazar", "shobhabazar", "beniatola", "rabindra sarani"],
    zone: "North Kolkata",
    nearestMetro: "Shobhabazar Sutanuti (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 5-8 mins east through Rabindra Sarani to Shobhabazar Sutanuti Metro gate.",
    lastMileFromMetro: "Get down at Shobhabazar Sutanuti Metro (Exit Gate 2). Walk 7 mins west down Rabindra Sarani into Kumartuli artisan lanes and Ahiritola Jubak Brinda.",
    walkCorridor: "Take the artisan heritage trail: Kumartuli Park -> Kumartuli Sarbojanin -> Ahiritola Ghat.",
    famousFoods: "Mitra Cafe (Sovabazar) for Diamond Fish Fry & Mutton Kabiraji, Chittaranjan German Rosogolla.",
    topPandals: ["Ahiritola Jubak Brinda", "Kumartuli Park", "Shobhabazar Rajbari"]
  },
  "hatibagan": {
    name: "Hatibagan / Kashi Bose Lane",
    aliases: ["hatibagan", "kashi bose lane", "kashi bose", "nalin sarkar", "chaltabagan", "maniktala"],
    zone: "North Kolkata",
    nearestMetro: "Girish Park / Shyambazar (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 8 mins down Cornwallis Street / Bidhan Sarani to Girish Park Metro.",
    lastMileFromMetro: "Get down at Girish Park or Shyambazar Metro. Walk 7-10 mins along Bidhan Sarani to Kashi Bose Lane and Nalin Sarkar Street.",
    walkCorridor: "Follow one-way pedestrian ropes connecting Hatibagan Sarbojanin to Nalin Sarkar and Kashi Bose Lane.",
    famousFoods: "Girish Chandra Dey & Nakur Chandra Nandy for Jalbhara Sandesh, Golbari for Kosha Mangsho.",
    topPandals: ["Kashi Bose Lane", "Hatibagan Sarbojanin", "Manicktala Chaltabagan"]
  },

  // --- Central Kolkata ---
  "college_square": {
    name: "College Square & Md Ali Park",
    aliases: ["college square", "college street", "md ali park", "mohammad ali park", "presidency", "calcutta university"],
    zone: "Central Kolkata",
    nearestMetro: "MG Road / Central (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 5 mins down College Street / Surya Sen St to MG Road Metro or Central Metro.",
    lastMileFromMetro: "Get down at Central or MG Road Metro Station. Walk 5 mins down College Street to the College Square lake premises.",
    walkCorridor: "Cross MG Road crossing to visit Mohammad Ali Park, then walk 4 mins to College Square illuminated lake.",
    famousFoods: "Putiram for Hing Kochuri & Radhaballabhi, Paramount for Daab Sarbat & Malai Cream, Kalika for Mutton Chop.",
    topPandals: ["College Square Sarbojanin", "Mohammad Ali Park"]
  },
  "santosh_mitra": {
    name: "Santosh Mitra Square (Bowbazar)",
    aliases: ["santosh mitra", "santosh mitra square", "lebutala", "bowbazar", "sealdah santosh mitra"],
    zone: "Central Kolkata",
    nearestMetro: "Central (Blue Line) / Sealdah (Green Line)",
    metroLine: "blue",
    feederToMetro: "Walk 8 mins west to Central Metro or 8 mins east to Sealdah Railway / Green Line Metro.",
    lastMileFromMetro: "From Central Metro (Exit Gate 3), walk 8 mins east down BB Ganguly Street into Lebutala / Santosh Mitra Square.",
    walkCorridor: "Follow police barricades through Bowbazar lane directly to the grand architectural gate.",
    famousFoods: "Arsalan Sealdah, local Bowbazar sweet shops for Langcha and Pantua.",
    tip: "Famous for mind-blowing theme illumination and palatial replicas. Night queues can reach 1.5 hours.",
    topPandals: ["Santosh Mitra Square", "Muchipara Sarbojanin"]
  },
  "esplanade": {
    name: "Esplanade / New Market",
    aliases: ["esplanade", "dharmatala", "dharmatolla", "new market", "curzon park", "dacres lane", "janbazar"],
    zone: "Central Kolkata",
    nearestMetro: "Esplanade Interchange (Blue Line & Green Line)",
    metroLine: "interchange",
    feederToMetro: "Esplanade is the central metro interchange connecting North, South, Howrah, and Salt Lake directly.",
    lastMileFromMetro: "Exit Esplanade Metro gates. Janbazar Rani Rashmoni Rajbari is 5 mins walk down SN Banerjee Road.",
    famousFoods: "Nizam's (birthplace of Kathi Rolls), Dacres Lane (Chitto Da's Chicken Stew & Toast), Aminia New Market.",
    topPandals: ["Rani Rashmoni Family Puja (Janbazar)", "Subodh Mallick Square"]
  },
  "howrah": {
    name: "Howrah Station",
    aliases: ["howrah", "howrah station", "howrah railway station", "shibpur", "santragachi", "salkia", "howrah maidan"],
    zone: "Howrah / West",
    nearestMetro: "Howrah Metro (Green Line - Underwater Tunnel)",
    metroLine: "green",
    feederToMetro: "Take Green Line Metro directly from Howrah Station underground concourse under the Hooghly River to Esplanade (~5 mins) or Sealdah (~8 mins).",
    lastMileFromMetro: "Green Line Metro lands right inside Howrah Railway concourse.",
    famousFoods: "Howrah Station Balwant Singh counter, Shri Hari Sweets, Chhappan Bhog.",
    topPandals: ["Belur Math (Durga Puja Kumari Puja)", "Salkia Sarbojanin"]
  },
  "sealdah": {
    name: "Sealdah Station",
    aliases: ["sealdah", "sealdah station", "beliaghata", "kole market"],
    zone: "Central-East Kolkata",
    nearestMetro: "Sealdah Metro (Green Line)",
    metroLine: "green",
    feederToMetro: "Take Green Line Metro towards Howrah or Salt Lake Sector V, or walk 10 mins to Blue Line Central.",
    lastMileFromMetro: "Exit Sealdah Station onto APC Road.",
    famousFoods: "Kole Market Kochuri, Arsalan Sealdah, Jagannath Bhojanalaya.",
    topPandals: ["Santosh Mitra Square", "Chaltabagan"]
  },

  // --- South Kolkata ---
  "gariahat": {
    name: "Gariahat & Ballygunge",
    aliases: ["gariahat", "ekdalia", "singhi park", "ballygunge", "cornfield road", "ekdalia evergreen"],
    zone: "South Kolkata",
    nearestMetro: "Kalighat / Gariahat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take shared auto along Rashbehari Avenue to Kalighat Metro (~8 mins, ₹12).",
    lastMileFromMetro: "Get down at Kalighat Metro. Take auto down Rashbehari Avenue to Gariahat Flyover (₹12, 6 mins) or walk 15 mins enjoying street lighting.",
    walkCorridor: "Walk the golden triangle: Ekdalia Evergreen -> Singhi Park -> Ballygunge Cultural in under 12 mins.",
    famousFoods: "Campari (Fish Roll & Chicken Cutlet), Bedouin (King Kathi Roll), Maharani (Hing Kochuri & Jalebi).",
    topPandals: ["Ekdalia Evergreen Club", "Singhi Park", "Ballygunge Cultural", "Hindustan Park"]
  },
  "deshapriya": {
    name: "Deshapriya Park & Tridhara",
    aliases: ["deshapriya", "deshapriya park", "tridhara", "tridhara sammilani", "manohar pukur", "priya cinema"],
    zone: "South Kolkata",
    nearestMetro: "Kalighat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 6 mins west along Rashbehari Avenue to Kalighat Metro.",
    lastMileFromMetro: "Get down at Kalighat Metro (Exit Gate 2 - Rashbehari Ave). Walk 5 mins east past Lake Mall to Deshapriya Park & Tridhara Sammilani.",
    walkCorridor: "From Deshapriya Park, cross to Manohar Pukur Road (2 mins) for Tridhara Sammilani.",
    famousFoods: "Maharaja for Hing Kochuri, Bedouin rolls, Lake Mall food court.",
    topPandals: ["Deshapriya Park", "Tridhara Sammilani", "Maddox Square"]
  },
  "chetla": {
    name: "Chetla Agrani & Kalighat Temple",
    aliases: ["chetla", "chetla agrani", "kalighat", "kalighat temple", "hazra"],
    zone: "South Kolkata",
    nearestMetro: "Kalighat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 5 mins north to Kalighat Metro station.",
    lastMileFromMetro: "Get down at Kalighat Metro (Exit Gate 1). Walk 6 mins south towards Chetla Lock Gate for Chetla Agrani.",
    walkCorridor: "Walk along Govinda Auddy Road into Chetla Agrani's eco-clay themed pandal ground.",
    famousFoods: "Kalighat temple pera & peda sweets, Hazra crossing roll stalls.",
    topPandals: ["Chetla Agrani Club", "Badamtala Ashar Sangha", "66 Pally", "Nepal Bhattacharjee Street"]
  },
  "garia": {
    name: "Garia & Tollygunge",
    aliases: ["garia", "kavi subhash", "tollygunge", "ranikuthi", "kudghat", "patuli", "banshroni", "naktala"],
    zone: "South Kolkata",
    nearestMetro: "Kavi Subhash / Mahanayak Uttam Kumar / Netaji (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Direct access to southern Blue Line terminal stations.",
    lastMileFromMetro: "Exit at Netaji Metro for Naktala Udayan Sangha or Kudghat.",
    famousFoods: "Balaram Mullick Patuli, local sweets, Garia crossing roll joints.",
    topPandals: ["Naktala Udayan Sangha", "Kendua Shanti Sangha"]
  },

  // --- East & Salt Lake ---
  "salt_lake": {
    name: "Salt Lake (FD, BJ, AK Block)",
    aliases: ["salt lake", "saltlake", "fd block", "bj block", "ak block", "city centre", "karunamoyee", "sector v", "central park", "salt lake stadium"],
    zone: "East Kolkata",
    nearestMetro: "City Centre / Central Park (Green Line)",
    metroLine: "green",
    feederToMetro: "Take e-rickshaw (toto) to City Centre or Central Park Metro (~₹15).",
    lastMileFromMetro: "Get down at City Centre Metro (Green Line). Walk 5 mins to BJ Block, or take 5-min toto (₹15) to FD Block.",
    walkCorridor: "Spacious open Salt Lake park roads, easily navigable by walking or totos with minimal barricade bottlenecks.",
    famousFoods: "Oudh 1590 (FD Block) for Awadhi Biryani, Saptapadi (Sector 1) for Bengali Thali, Chowman.",
    topPandals: ["FD Block Sarbojanin", "BJ Block", "AK Block", "Labony Estate", "FD Park"]
  }
};

/**
 * Identify transit hub from user input text
 */
export function identifyHub(text) {
  if (!text) return null;
  const q = text.toLowerCase();
  
  // Specific checks with score
  let bestMatch = null;
  let maxScore = 0;

  for (const [key, hub] of Object.entries(KOLKATA_TRANSIT_HUBS)) {
    for (const alias of hub.aliases) {
      if (q.includes(alias)) {
        const score = alias.length; // longer alias match is more specific
        if (score > maxScore) {
          maxScore = score;
          bestMatch = { key, ...hub, matchedAlias: alias };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Parse origin and destination from user prompt
 */
export function parseRouteQuery(rawQuery) {
  const q = rawQuery.toLowerCase().trim();

  // Pattern 1: "how to reach Y from X" or "route to Y from X"
  const reachFromRegex = /(?:how to (?:reach|go to)|route to|path to|directions? to|going to)\s+([\w\s]+?)\s+(?:from|start from|starting from|theke)\s+([\w\s]+)/i;
  let match = q.match(reachFromRegex);
  if (match) {
    return {
      destinationQuery: match[1].trim(),
      originQuery: match[2].trim()
    };
  }

  // Pattern 2: "from X to Y" / "start from X to Y"
  const fromToRegex = /(?:from|starting from|start from)\s+([\w\s]+?)\s+(?:to|reach|jabo)\s+([\w\s]+)/i;
  match = q.match(fromToRegex);
  if (match) {
    return {
      originQuery: match[1].trim(),
      destinationQuery: match[2].trim()
    };
  }

  // Pattern 3: "X theke Y kivabe jabo" / "X theke Y" (Bengali)
  const bengaliFromToRegex = /([\w\s]+?)\s+(?:theke|thekhe|se)\s+([\w\s]+?)(?:\s+(?:kivabe|kibhabe|kemne)?\s*(?:jabo|reach|route|pouchabo))?$/i;
  match = q.match(bengaliFromToRegex);
  if (match && match[1] && match[2]) {
    return {
      originQuery: match[1].trim(),
      destinationQuery: match[2].trim()
    };
  }

  // Pattern 4: "X to Y"
  const simpleToRegex = /([\w\s]+?)\s+to\s+([\w\s]+)/i;
  match = q.match(simpleToRegex);
  if (match && !q.includes("welcome to") && !q.includes("happy")) {
    return {
      originQuery: match[1].trim(),
      destinationQuery: match[2].trim()
    };
  }

  // Single destination fallback: "how to reach X"
  const singleDestRegex = /(?:how to (?:reach|go to)|route to|path for|directions? for)\s+([\w\s]+)/i;
  match = q.match(singleDestRegex);
  if (match) {
    return {
      destinationQuery: match[1].trim(),
      originQuery: null
    };
  }

  return null;
}

/**
 * Generate step-by-step transit instructions between any two Kolkata locations
 */
export function generateDynamicRoute(originQuery, destinationQuery, userLocation = null) {
  const originHub = identifyHub(originQuery);
  const destHub = identifyHub(destinationQuery);

  if (!destHub) {
    return null;
  }

  // If origin not provided, use Central Kolkata or live userLocation
  const originName = originHub ? originHub.name : (originQuery ? originQuery.trim() : "Central Kolkata / Your Location");
  const destName = destHub.name;

  const title = `${originName} to ${destName}`;
  const steps = [];

  // 1. Feeder Leg from Origin
  if (originHub && originHub.key === destHub.key) {
    steps.push({
      type: "walk",
      text: `Both ${originName} and ${destName} are in the same neighborhood! You can walk or take a quick 5-minute local toto/rickshaw.`
    });
    if (destHub.walkCorridor) {
      steps.push({ type: "walk", text: destHub.walkCorridor });
    }
    if (destHub.famousFoods) {
      steps.push({ type: "food", text: `Food Pitstop: ${destHub.famousFoods}` });
    }
    return { title, route: steps };
  }

  // Step 1: Feeder to Metro
  if (originHub && originHub.feederToMetro) {
    steps.push({
      type: "auto",
      text: `Step 1 (Local Feeder): ${originHub.feederToMetro}`
    });
  } else {
    steps.push({
      type: "metro",
      text: `Step 1 (Start Point): Head to your nearest Kolkata Metro station (Blue Line or Green Line).`
    });
  }

  // Step 2: Metro Transit
  const originMetro = originHub ? originHub.nearestMetro : "Nearest Metro";
  const destMetro = destHub.nearestMetro;
  const originLine = originHub?.metroLine || "blue";
  const destLine = destHub.metroLine || "blue";

  if (originLine === destLine) {
    steps.push({
      type: "metro",
      text: `Step 2 (Metro Line): Board the Kolkata Metro at ${originMetro}. Ride directly towards ${destMetro} (~15-25 mins).`
    });
  } else {
    // Interchange required (e.g. Green Line to Blue Line at Esplanade)
    steps.push({
      type: "metro",
      text: `Step 2 (Metro Line): Take the ${originLine === 'green' ? 'Green Line' : 'Blue Line'} to Esplanade Interchange Station. Switch inside the subway corridor to the ${destLine === 'green' ? 'Green Line' : 'Blue Line'} and continue to ${destMetro}.`
    });
  }

  // Step 3: Last Mile from Destination Metro
  if (destHub.lastMileFromMetro) {
    steps.push({
      type: "auto",
      text: `Step 3 (Last Mile): ${destHub.lastMileFromMetro}`
    });
  }

  // Step 4: Walking Corridor
  if (destHub.walkCorridor) {
    steps.push({
      type: "walk",
      text: `Step 4 (Walking Corridor): ${destHub.walkCorridor}`
    });
  } else {
    steps.push({
      type: "walk",
      text: `Step 4 (Entry): Follow the Kolkata Police barricaded one-way pedestrian lanes into the pandal premises.`
    });
  }

  // Step 5: Food Recommendation
  if (destHub.famousFoods) {
    steps.push({
      type: "food",
      text: `Step 5 (Food Pitstop): ${destHub.famousFoods}`
    });
  }

  // Step 6: Pro-Tip
  if (destHub.tip) {
    steps.push({
      type: "tip",
      text: `💡 Dawon Pro-Tip: ${destHub.tip}`
    });
  } else {
    steps.push({
      type: "tip",
      text: `💡 Dawon Pro-Tip: Evening queues peak from 6:30 PM to 11:30 PM. Visit between 2:00 PM and 4:30 PM or after midnight for peaceful darshan!`
    });
  }

  return { title, route: steps };
}

/**
 * Handle Open-Ended Pujo Queries (Timings, Rituals, Food, Rules, Metro)
 */
export function handleOpenEndedQuery(query) {
  const q = query.toLowerCase();

  // 1. Ashtami Anjali & Pushpanjali
  if (q.includes("anjali") || q.includes("pushpanjali") || q.includes("ashtami timing") || q.includes("anjali time")) {
    return {
      text: `🌸 Maha Ashtami Pushpanjali Timings & Ritual:
• Auspicious Morning Window: Maha Ashtami pushpanjali is traditionally performed between 8:30 AM and 10:30 AM across paras and temples.
• Rules: Fasting is maintained until anjali is completed. Wear fresh traditional attire (dhoti-panjabi / saree).
• Sandhi Puja: Happens at the sacred 48-minute juncture between Ashtami and Navami. 108 lotus flowers (padma) and 108 earthen diyas are offered to Devi Chamunda!`
    };
  }

  // 2. Sandhi Puja
  if (q.includes("sandhi puja") || q.includes("sandhi pujo") || q.includes("108 diya") || q.includes("108 padma")) {
    return {
      text: `🪔 What is Sandhi Puja?
Sandhi Puja takes place in the exact 48-minute transition between Ashtami (last 24 minutes) and Navami (first 24 minutes).
• Significance: The fierce moment when Goddess Durga transformed into Devi Chamunda to slay the demons Chanda and Munda.
• Ritual: Exactly 108 red lotus flowers are sanctified, and 108 clay diyas are lit amidst electrifying dhak beats and conch shells (shonkho).`
    };
  }

  // 3. Sindur Khela & Bijoya Dashami
  if (q.includes("sindur khela") || q.includes("dashami") || q.includes("bisorjon") || q.includes("immersion")) {
    return {
      text: `🌺 Bijoya Dashami, Sindur Khela & Bisorjon:
• Sindur Khela: Performed on Dashami morning (around 10:00 AM - 1:00 PM) before the goddess departs for Mount Kailash. Married women offer sweets and vermilion to Maa Durga, then playfully smear sindur on each other celebrating womanhood and wishing long life.
• Bisorjon (Immersion): The idols are carried to the Hooghly river ghats (Babughat, Bagbazar Ghat, Baje Kadamtala Ghat) accompanied by dhol, dhak, and chants of 'Aschhe bochhor abar hobe!'`
    };
  }

  // 4. Metro Timings & Night Operations
  if (
    (q.includes("metro") && (q.includes("night") || q.includes("open") || q.includes("time") || q.includes("timing") || q.includes("schedule") || q.includes("train") || q.includes("overnight") || q.includes("late") || q.includes("midnight"))) ||
    q.includes("midnight metro") || q.includes("train timing") || q.includes("overnight train")
  ) {
    return {
      text: `🚇 Kolkata Metro Durga Puja Special Schedule:
• All-Night Service: On Saptami, Ashtami, and Navami nights, the Blue Line (Dakshineswar to Kavi Subhash) and Green Line (Howrah Station to Sealdah/Sector V) run overnight special trains till 4:00 AM at 15-20 minute intervals!
• Smart Token Tip: Purchase smart tokens or recharge smart cards beforehand via the Metro UPI app to bypass mile-long token queues at ticket counters.`
    };
  }

  // 5. VIP Passes & Tickets
  if (q.includes("vip pass") || q.includes("pass") || q.includes("ticket") || q.includes("paid entry")) {
    return {
      text: `🎟️ Durga Puja Entry & VIP Passes:
• 100% Free: All Durga Puja pandals in Kolkata are completely free and open to the public!
• Fast-Track Passes: Major high-rush clubs (Sreebhumi, Chetla Agrani, Suruchi Sangha, Ekdalia) distribute official passes to club sponsors and members that allow fast-track queue access.
• Kolkata Police App / Digital Map: Check the Kolkata Police official Durga Puja guide for emergency digital entry passes for senior citizens and differently-abled visitors.`
    };
  }

  // 6. Food, Biryani & Kathi Rolls
  if (q.includes("biryani") || q.includes("best food") || q.includes("roll") || q.includes("kathi roll") || q.includes("where to eat")) {
    return {
      text: `🍽️ Kolkata's Ultimate Pujo Food Checklist:
• Legendary Kolkata Biryani (with Aloo & Egg):
  - Arsalan (Park Circus 7-point / Ruby)
  - Shiraz Golden Restaurant (Mullick Bazar)
  - Aminia (New Market / Golpark)
  - Royal India Hotel (Chitpur - authentic Lucknowi mutton chaap)
• Authentic Kathi Rolls:
  - Kusum Rolls & Hot Kathi Roll (Park Street)
  - Nizam's (New Market - original 1932 inventor of rolls)
  - Campari (Gariahat) for Fish Roll & Kabiraji
• Midnight Eating: Dacres Lane, Park Street, and Lake Town street counters serve fresh rolls, momos, and chai till 4:00 AM!`
    };
  }

  // 7. Top Must-Visit Pandals
  if (q.includes("top 5") || q.includes("must visit") || q.includes("best pandal") || q.includes("famous pandal") || q.includes("recommend")) {
    return {
      text: `👑 Top 6 Must-Visit Pandals in Kolkata:
1. Sreebhumi Sporting Club (Lake Town) — Grand palace architecture & diamond-grade illumination.
2. Santosh Mitra Square (Bowbazar) — Mind-blowing laser shows & iconic themed pavilions.
3. Chetla Agrani Club (South) — Masterpiece eco-friendly clay idol craft by Subrata Banerjee.
4. Bagbazar Sarbojanin (North) — 100+ years of pristine traditional Sabeki Ekchala heritage.
5. Ekdalia Evergreen (Gariahat) — Royal South Indian temple replicas and German chandeliers.
6. College Square (Central) — Dazzling light reflection dancing over the heritage water lake!`
    };
  }

  // 8. Clothing & Pandal Hopping Tips
  if (q.includes("wear") || q.includes("dress") || q.includes("tips") || q.includes("shoes") || q.includes("weather")) {
    return {
      text: `👟 Pandal Hopping Survival Checklist:
• Footwear: Wear well-broken-in sneakers or comfortable flats. Never wear brand new heels; you will easily walk 12,000 to 20,000 steps per night!
• Clothing: Breathable cotton kurtas, lightweight sarees, or comfortable casuals for Kolkata's humid October weather.
• Essentials: Keep a compact umbrella, a bottle of ORS/water, wet wipes, and a power bank in a cross-body bag.`
    };
  }

  // 9. Emergency Helplines & Police
  if (q.includes("police") || q.includes("emergency") || q.includes("helpline") || q.includes("safety") || q.includes("lost")) {
    return {
      text: `🚨 24x7 Emergency Helplines:
• Kolkata Police Control: 100 / 112
• Traffic Police Helpline: 1073
• Women Safety Helpline: 1091
• Medical Ambulance: 102
• Kolkata Police has help booths with drinking water and first aid outside every major pandal gate.`
    };
  }

  // 10. Songs, Melodies & Mahalaya
  if (q.includes("song") || q.includes("music") || q.includes("gan") || q.includes("audio") || q.includes("benu") || q.includes("mahalaya")) {
    return {
      text: `🎵 Aamar Pujo Curated Melodies:
• Check out our 'Daily Melodies' tab for an 11-day spiritual music journey!
• Features iconic classics:
  - Mahalaya: 'Bajlo Tomar Alor Benu' (Aakashvani masterpiece)
  - Shashthi to Navami: 'Dugga Elo', 'Joy Maa Durga', 'Elo Re Dugga Elo'
  - Bijoya Dashami: 'Maa Go Tui' (from Durgeshgorer Guptodhon, SVF Music)
• High quality 320 kbps audio with background playback is built right into the app!`
    };
  }

  return null;
}
