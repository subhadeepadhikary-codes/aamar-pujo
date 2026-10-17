/**
 * Dawon AI Transit & Knowledge Engine for West Bengal & Kolkata
 * Provides dynamic origin-to-destination routing across West Bengal & Kolkata
 * (Rail/Intercity -> Kolkata Metro -> Shared Auto/Toto -> Walking Corridors -> Food)
 * and rich contextual answers for Durga Puja queries.
 */

import { PANDALS_DATA } from "../data/pandalsData";
import { RESTAURANTS_DATA } from "../data/restaurantsData";
import { normalizePhonetic, HOMOPHONE_ALIASES } from "./phoneticSearch";

// 1. Kolkata & West Bengal Transit Hubs Knowledge Graph
export const KOLKATA_TRANSIT_HUBS = {
  // ==========================================
  // --- South-West Kolkata (Strictly Segregated) ---
  // ==========================================
  "taratala": {
    name: "Taratala Crossing",
    aliases: [
      "taratala", "taratola", "taratala crossing", "majerhat bridge", "taratala mint", 
      "majerhat", "taratala auto stand", "taratala bus stand", "diamond harbour road taratala"
    ],
    zone: "South-West Kolkata",
    nearestMetro: "Rabindra Sarobar (Blue Line) / Taratala (Purple Line)",
    metroLine: "blue",
    feederToMetro: "Take a shared auto or bus from Taratala crossing down Diamond Harbour Road / Rashbehari connector directly to Rabindra Sarobar Metro Station (~8-10 mins, ₹15), or board Purple Line at Taratala Metro.",
    lastMileFromMetro: "From Rabindra Sarobar Metro, take an auto along the Rashbehari connector / DH Road straight to Taratala crossing (~8-10 mins, ₹15).",
    walkCorridor: "Walk across the pedestrian underpass or side road from Taratala crossing towards Majerhat / Alipore.",
    famousFoods: "Taratala crossing roll & chowmein stalls, Mint canteen tea, New Alipore Chai Break.",
    topPandals: ["Chetla Agrani (via Chetla Lock Gate)", "Suruchi Sangha (via New Alipore)", "Ajeyo Sanghati"]
  },

  "new_alipore": {
    name: "New Alipore (Suruchi Sangha Area)",
    aliases: [
      "new alipore", "newalipore", "triangular park new alipore", "suruchi sangha", 
      "suruchi sangho", "nalini ranjan avenue", "petrol pump new alipore", "chetla central road"
    ],
    zone: "South-West Kolkata",
    nearestMetro: "Kalighat Metro (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take a shared auto or cycle-rickshaw along Chetla Central Road / Tolly's Nullah bridge to Kalighat Metro (~7-8 mins, ₹12-₹15).",
    lastMileFromMetro: "From Kalighat Metro (Exit Gate 1), take a shared auto down Chetla Central Road to New Alipore Petrol Pump / Triangular Park (~7 mins, ₹12-₹15).",
    walkCorridor: "Walk 4 mins down Nalini Ranjan Avenue straight into Suruchi Sangha's illuminated cultural compound.",
    famousFoods: "Pravesh Fuchka (Triangular Park), New Alipore Frankie Corner, The Chai Bar.",
    tip: "Suruchi Sangha represents a distinct Indian state's folk art every year. Best visited during late afternoon before VIP crowds peak.",
    topPandals: ["Suruchi Sangha", "Chetla Agrani Club"]
  },

  "behala_thana": {
    name: "Behala Thana (Kadamtala)",
    aliases: [
      "behala thana", "kadamtala", "kadamtala behala", "14 no bus stand", "14 number bus stand", 
      "behala police station", "behala thana crossing", "behala nutan dal", "behala club"
    ],
    zone: "South-West Kolkata",
    nearestMetro: "Rabindra Sarobar / Kalighat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take a shared auto up Diamond Harbour Road north towards Taratala, then continue to Rabindra Sarobar Metro (~10-12 mins, ₹15).",
    lastMileFromMetro: "From Rabindra Sarobar or Kalighat Metro, take a DH Road shared auto heading south to Behala Thana / 14 No. Bus Stand (~10-12 mins, ₹15).",
    walkCorridor: "Walk 3 mins from 14 No. stand into Behala Nutan Dal ground and Behala Club along Banamali Naskar Road.",
    famousFoods: "Behala Thana crossing telebhaja, Haji Saheb Biryani (Kadamtala), Gupta Sweets.",
    tip: "Behala Nutan Dal is famed for intricate architectural installations. Queue moves smoothly through broad barricades.",
    topPandals: ["Behala Nutan Dal", "Behala Club", "Ajeya Sangha"]
  },

  "behala_chowrasta": {
    name: "Behala Chowrasta",
    aliases: [
      "behala chowrasta", "chowrasta", "behala", "sakher bazar", "james long sarani", 
      "barisha", "barisha club", "state bank park", "behala tram depot"
    ],
    zone: "South-West Kolkata",
    nearestMetro: "Mahanayak Uttam Kumar / Tollygunge (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take a shared auto along James Long Sarani / Karunamoyee connector to Tollygunge (Mahanayak Uttam Kumar) Metro (~15 mins, ₹18), or auto north up DH Road to Kalighat (~18 mins, ₹18).",
    lastMileFromMetro: "From Tollygunge Metro (Mahanayak Uttam Kumar), take a shared auto along Karunamoyee / James Long Sarani directly to Behala Chowrasta (~15 mins, ₹18).",
    walkCorridor: "From Chowrasta crossing, follow James Long Sarani for Barisha Club, or walk 5 mins down Bakultala lane for State Bank Park.",
    famousFoods: "Mitra Cafe (Behala Chowrasta) for Diamond Fish Fry & Kabiraji, Campari roll branch, Radhaballabhi at Sakher Bazar.",
    tip: "Barisha Club creates path-breaking contemporary socially conscious themes. Expect deep emotional art.",
    topPandals: ["Barisha Club", "State Bank Park", "Behala Adarsha Pally"]
  },

  "parnasree": {
    name: "Parnasree Pally",
    aliases: [
      "parnasree", "parnashree", "parnasree pally", "parnasree club", "upen banerjee road"
    ],
    zone: "South-West Kolkata",
    nearestMetro: "Rabindra Sarobar / Taratala",
    metroLine: "blue",
    feederToMetro: "Take a shared auto from Parnasree lake bus stand to Taratala crossing (~8 mins, ₹12), then transfer to Rabindra Sarobar Metro.",
    lastMileFromMetro: "From Rabindra Sarobar Metro, take auto to Taratala, then connect with Parnasree auto (~15 mins total).",
    walkCorridor: "Walk around Parnasree lake park to visit Parnasree Club and local community pandals.",
    famousFoods: "Parnasree Roll Corner, Banchharam sweets, Lake view tea.",
    topPandals: ["Parnasree Pally", "Parnasree Club"]
  },

  "thakurpukur": {
    name: "Thakurpukur & Joka",
    aliases: [
      "thakurpukur", "joka", "3a bus stand", "thakurpukur 3a", "kabikantichandra", "purple line joka"
    ],
    zone: "South-West Kolkata",
    nearestMetro: "Mahanayak Uttam Kumar / Joka Metro (Purple Line)",
    metroLine: "purple",
    feederToMetro: "Take auto from Thakurpukur 3A along James Long to Tollygunge Metro (~20 mins, ₹22) or board Purple Line.",
    lastMileFromMetro: "From Tollygunge Metro, take auto to Thakurpukur 3A stand (~20 mins).",
    famousFoods: "Local chop-cutlet stalls, Thakurpukur sweet counters.",
    topPandals: ["Thakurpukur SB Park", "Joka Sarbojanin"]
  },

  // ==========================================
  // --- Central & East Kolkata ---
  // ==========================================
  "beleghata": {
    name: "Beleghata (Rashmoni Bazar / Karmi Sangha)",
    aliases: [
      "beleghata", "beliaghata", "beleghata karmi sangha", "karmi sangha", "rashmoni bazar", 
      "beleghata main road", "subhas sarobar", "phoolbagan beleghata", "beleghata balakbrinda"
    ],
    zone: "Central & East Kolkata",
    nearestMetro: "Phoolbagan Metro (Green Line) / Sealdah Metro (Green Line)",
    metroLine: "green",
    feederToMetro: "Take a 5-6 min toto or shared auto down Beleghata Main Road directly to Phoolbagan Metro Station (Green Line, ₹12), or auto to Sealdah Railway Station (~10 mins, ₹15).",
    lastMileFromMetro: "From Phoolbagan Metro (Green Line), take a 5-min toto or auto down Beleghata Main Road to Rashmoni Bazar (~5 mins, ₹12). Walk 2 mins to Beleghata Karmi Sangha.",
    walkCorridor: "Walk from Rashmoni Bazar crossing along the canal road into Beleghata Karmi Sangha's grand thematic pandal complex.",
    famousFoods: "Rolls & Moglai at Rashmoni Bazar, Phoolbagan Mishti Hub, local Radhaballabhi stalls.",
    tip: "Beleghata Karmi Sangha is one of East Kolkata's most acclaimed award-winning theme pandals with grand installations and heritage lighting. Visit around 4 PM to avoid night rush.",
    topPandals: ["Beleghata Karmi Sangha", "Beleghata Balakbrinda", "Beleghata Mitra Sangha"]
  },

  "college_square": {
    name: "College Square & Md Ali Park",
    aliases: [
      "college square", "college street", "md ali park", "mohammad ali park", "presidency", 
      "calcutta university", "bhatpara", "surya sen street"
    ],
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
    aliases: [
      "santosh mitra", "santosh mitra square", "lebutala", "lebutola", "bowbazar", "sealdah santosh mitra"
    ],
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
    aliases: [
      "esplanade", "dharmatala", "dharmatolla", "new market", "curzon park", "dacres lane", "janbazar", "chowringhee"
    ],
    zone: "Central Kolkata",
    nearestMetro: "Esplanade Interchange (Blue Line & Green Line)",
    metroLine: "interchange",
    feederToMetro: "Esplanade is the central metro interchange connecting North, South, Howrah, and Salt Lake directly.",
    lastMileFromMetro: "Exit Esplanade Metro gates. Janbazar Rani Rashmoni Rajbari is 5 mins walk down SN Banerjee Road.",
    famousFoods: "Nizam's (birthplace of Kathi Rolls), Dacres Lane (Chitto Da's Chicken Stew & Toast), Aminia New Market.",
    topPandals: ["Rani Rashmoni Family Puja (Janbazar)", "Subodh Mallick Square"]
  },

  "sealdah": {
    name: "Sealdah Station",
    aliases: ["sealdah", "sealdah station", "sealdah railway station", "kole market", "apc road"],
    zone: "Central-East Kolkata",
    nearestMetro: "Sealdah Metro (Green Line)",
    metroLine: "green",
    feederToMetro: "Board Green Line Metro towards Howrah Maidan or Salt Lake Sector V, or walk 10 mins to Blue Line Central.",
    lastMileFromMetro: "Exit Sealdah Station onto APC Road or connect via Green Line Metro concourse.",
    famousFoods: "Kole Market Kochuri, Arsalan Sealdah, Jagannath Bhojanalaya.",
    topPandals: ["Santosh Mitra Square", "Chaltabagan", "Beleghata Karmi Sangha"]
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

  // ==========================================
  // --- North & North-East Kolkata ---
  // ==========================================
  "sreebhumi": {
    name: "Sreebhumi Sporting Club",
    aliases: [
      "sreebhumi", "sribhumi", "sree bhumi", "shreebhumi", "shribhumi", "lake town", 
      "laketown", "dakshin dari", "vip road sreebhumi", "clock tower lake town"
    ],
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
    aliases: [
      "dum dum park", "dumdum park", "tarun dal", "bharat chakra", "dumdum park tarun dal", "tarun sangha"
    ],
    zone: "North-East Kolkata",
    nearestMetro: "Dum Dum / Belgachia (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take auto from Dum Dum Park Tank No. 1 to Dum Dum Metro (~10 mins, ₹15).",
    lastMileFromMetro: "From Dum Dum Metro or Belgachia, take auto along Jessore Road to Dum Dum Park VIP entry (~10 mins, ₹15-₹20).",
    walkCorridor: "Walk through the park pathway to visit Tarun Dal, Bharat Chakra, and Tarun Sangha in one continuous walking loop.",
    famousFoods: "Park Sweets, local fuchka and chop corners.",
    topPandals: ["Dum Dum Park Tarun Dal", "Dum Dum Park Bharat Chakra"]
  },

  "bagbazar": {
    name: "Bagbazar Sarbojanin",
    aliases: ["bagbazar", "baghbazar", "girish avenue", "bagbazar ghat", "mayer bari"],
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
    aliases: [
      "kumartuli", "kumortuli", "ahiritola", "sovabazar", "shobhabazar", "beniatola", 
      "rabindra sarani", "kumartuli park", "ahiritola jubak brinda"
    ],
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
    aliases: [
      "hatibagan", "kashi bose lane", "kashi bose", "nalin sarkar", "chaltabagan", "maniktala", "bidhan sarani"
    ],
    zone: "North Kolkata",
    nearestMetro: "Girish Park / Shyambazar (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 8 mins down Cornwallis Street / Bidhan Sarani to Girish Park Metro.",
    lastMileFromMetro: "Get down at Girish Park or Shyambazar Metro. Walk 7-10 mins along Bidhan Sarani to Kashi Bose Lane and Nalin Sarkar Street.",
    walkCorridor: "Follow one-way pedestrian ropes connecting Hatibagan Sarbojanin to Nalin Sarkar and Kashi Bose Lane.",
    famousFoods: "Girish Chandra Dey & Nakur Chandra Nandy for Jalbhara Sandesh, Golbari for Kosha Mangsho.",
    topPandals: ["Kashi Bose Lane", "Hatibagan Sarbojanin", "Manicktala Chaltabagan"]
  },

  // ==========================================
  // --- South & South-East Kolkata ---
  // ==========================================
  "gariahat": {
    name: "Gariahat & Ballygunge",
    aliases: [
      "gariahat", "ekdalia", "singhi park", "ballygunge", "cornfield road", "ekdalia evergreen", "ballygunge cultural"
    ],
    zone: "South Kolkata",
    nearestMetro: "Kalighat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Take shared auto along Rashbehari Avenue to Kalighat Metro (~8 mins, ₹12).",
    lastMileFromMetro: "Get down at Kalighat Metro. Take auto down Rashbehari Avenue to Gariahat Flyover (₹12, 6 mins) or walk 15 mins enjoying street lighting.",
    walkCorridor: "Walk the golden triangle: Ekdalia Evergreen -> Singhi Park -> Ballygunge Cultural in under 12 mins.",
    famousFoods: "Campari (Fish Roll & Chicken Cutlet), Bedouin (King Kathi Roll), Maharani (Hing Kochuri & Jalebi).",
    topPandals: ["Ekdalia Evergreen Club", "Singhi Park", "Ballygunge Cultural", "Hindustan Park"]
  },

  "deshapriya": {
    name: "Deshapriya Park & Tridhara",
    aliases: ["deshapriya", "deshapriya park", "tridhara", "tridhara sammilani", "manohar pukur", "maddox square", "hazra road"],
    zone: "South Kolkata",
    nearestMetro: "Kalighat (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Walk 6 mins west along Rashbehari Avenue to Kalighat Metro.",
    lastMileFromMetro: "Get down at Kalighat Metro (Exit Gate 2 - Rashbehari Ave). Walk 5 mins east past Lake Mall to Deshapriya Park & Tridhara Sammilani.",
    walkCorridor: "From Deshapriya Park, cross to Manohar Pukur Road (2 mins) for Tridhara Sammilani, then walk 8 mins to Maddox Square.",
    famousFoods: "Maharaja for Hing Kochuri, Bedouin rolls, Lake Mall food court.",
    topPandals: ["Deshapriya Park", "Tridhara Sammilani", "Maddox Square"]
  },

  "chetla": {
    name: "Chetla Agrani & Kalighat Temple",
    aliases: ["chetla", "chetla agrani", "kalighat", "kalighat temple", "hazra", "badamtala", "66 pally"],
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
    aliases: [
      "garia", "kavi subhash", "tollygunge", "ranikuthi", "kudghat", "patuli", "banshroni", 
      "naktala", "naktala udayan sangha", "kendua shanti sangha"
    ],
    zone: "South Kolkata",
    nearestMetro: "Kavi Subhash / Mahanayak Uttam Kumar / Netaji (Blue Line)",
    metroLine: "blue",
    feederToMetro: "Direct access to southern Blue Line terminal stations.",
    lastMileFromMetro: "Exit at Netaji Metro for Naktala Udayan Sangha or Kudghat.",
    famousFoods: "Balaram Mullick Patuli, local sweets, Garia crossing roll joints.",
    topPandals: ["Naktala Udayan Sangha", "Kendua Shanti Sangha"]
  },

  "salt_lake": {
    name: "Salt Lake (FD, BJ, AK Block)",
    aliases: [
      "salt lake", "saltlake", "fd block", "bj block", "ak block", "city centre", 
      "karunamoyee", "sector v", "central park", "salt lake stadium", "bidhannagar"
    ],
    zone: "East Kolkata",
    nearestMetro: "City Centre / Central Park (Green Line)",
    metroLine: "green",
    feederToMetro: "Take e-rickshaw (toto) to City Centre or Central Park Metro (~₹15).",
    lastMileFromMetro: "Get down at City Centre Metro (Green Line). Walk 5 mins to BJ Block, or take 5-min toto (₹15) to FD Block.",
    walkCorridor: "Spacious open Salt Lake park roads, easily navigable by walking or totos with minimal barricade bottlenecks.",
    famousFoods: "Oudh 1590 (FD Block) for Awadhi Biryani, Saptapadi (Sector 1) for Bengali Thali, Chowman.",
    topPandals: ["FD Block Sarbojanin", "BJ Block", "AK Block", "Labony Estate", "FD Park"]
  },

  // ==========================================
  // --- West Bengal Regional Hubs ---
  // ==========================================
  "asansol": {
    name: "Asansol (Paschim Bardhaman)",
    aliases: ["asansol", "asansol junction", "raniganj", "kulti", "burnpur"],
    zone: "West Bengal (Paschim Bardhaman)",
    type: "regional",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Board Black Diamond Express / Coalfield Express / EMU Local train to Howrah Station (~3.5 hrs, ₹45–₹110), or take SBSTC AC Volvo bus to Esplanade.",
    feederToMetro: "From Howrah Station, take Green Line Metro (underwater tunnel) to Esplanade or Sealdah in just 5-8 mins.",
    famousFoods: "Asansol Langcha, Burnpur rolls.",
    topPandals: ["Kalyanpur Housing Durga Puja", "Asansol Burnpur Stadium"]
  },

  "durgapur": {
    name: "Durgapur (Paschim Bardhaman)",
    aliases: ["durgapur", "city centre durgapur", "durgapur station", "benachity", "andal"],
    zone: "West Bengal (Paschim Bardhaman)",
    type: "regional",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Take Agnibeena Express / Vande Bharat / Intercity Express to Howrah (~2 hrs 15 mins) or SBSTC / Royal Cruiser AC bus to Esplanade (~3 hrs).",
    feederToMetro: "From Howrah Station, switch to Green Line Metro directly to Esplanade (5 mins) or Sealdah (8 mins).",
    famousFoods: "Benachity sweets, City Centre food street.",
    topPandals: ["City Centre Durgapur Pandal", "Benachity Sarbojanin"]
  },

  "bardhaman": {
    name: "Bardhaman / Burdwan (Purba Bardhaman)",
    aliases: ["bardhaman", "burdwan", "bardhaman junction", "memari", "shaktigarh"],
    zone: "West Bengal (Purba Bardhaman)",
    type: "regional",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Board Howrah-Bardhaman Main / Chord Line EMU local train (~1.5 hrs, ₹20) to Howrah Station.",
    feederToMetro: "Arrive at Howrah Station, take Green Line Metro under the river straight to Esplanade / Sealdah.",
    famousFoods: "Shaktigarh Langcha, Burdwan Sitabhog & Mihidana.",
    topPandals: ["Burdwan Sarbojanin", "Curzon Gate Puja"]
  },

  "siliguri": {
    name: "Siliguri / NJP (North Bengal)",
    aliases: ["siliguri", "njp", "new jalpaiguri", "siliguri town", "bagdogra", "jalpaiguri"],
    zone: "North Bengal",
    type: "regional",
    railTerminus: "Sealdah / Howrah Station",
    intercityTransit: "Board Vande Bharat Express / Padatik Express / Darjeeling Mail to Sealdah (~8–10 hrs) or take NBSTC AC Sleeper bus to Babughat / Esplanade.",
    feederToMetro: "Arrive at Sealdah or Howrah, board Kolkata Metro (Green Line or Blue Line) into the heart of the city.",
    famousFoods: "Momo stalls, North Bengal tea, local bakery snacks.",
    topPandals: ["Siliguri Central Club", "Subrata Sangha Siliguri", "Swastika Yubak Sangha"]
  },

  "kharagpur": {
    name: "Kharagpur (Paschim Medinipur)",
    aliases: ["kharagpur", "iit kharagpur", "kgp", "midnapore", "medinipur"],
    zone: "West Bengal (Paschim Medinipur)",
    type: "regional",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Take South Eastern Railway local train / Dhauli Express / Ispat Express to Howrah Station (~1 hr 50 mins, ₹25–₹70).",
    feederToMetro: "From Howrah Station, take Green Line Metro (underwater) to Esplanade / Sealdah in 5 mins.",
    famousFoods: "Kharagpur South Indian tiffins, Medinipur sweet kheer.",
    topPandals: ["Kharagpur Railway Ground Puja", "IIT Campus Puja"]
  },

  "haldia": {
    name: "Haldia (Purba Medinipur)",
    aliases: ["haldia", "tamluk", "mecheda", "kolaghat"],
    zone: "West Bengal (Purba Medinipur)",
    type: "regional",
    railTerminus: "Howrah Station / Esplanade",
    intercityTransit: "Board Haldia-Howrah Local train to Howrah (~2.5 hrs) or take SBSTC bus via Kolaghat to Esplanade (~3 hrs).",
    feederToMetro: "From Esplanade, enter the central Metro interchange.",
    famousFoods: "Kolaghat Hilsa & Sher-e-Punjab Dhaba food, Mihidana.",
    topPandals: ["Haldia Township Puja", "Durgachak Sarbojanin"]
  },

  "digha": {
    name: "Digha (Coastal Purba Medinipur)",
    aliases: ["digha", "new digha", "old digha", "mandarmani", "contai", "kanthi"],
    zone: "Coastal Bengal",
    type: "regional",
    railTerminus: "Howrah Station / Esplanade",
    intercityTransit: "Board Tamralipta Express / Kandari Express to Howrah (~3.5 hrs) or take SBSTC AC bus to Esplanade.",
    feederToMetro: "Connect with Green Line Metro at Howrah or Central interchange at Esplanade.",
    famousFoods: "Coastal fish fry, fresh coconut water, cashew nuts.",
    topPandals: ["Digha Sea Beach Sarbojanin", "Contai Club"]
  },

  "krishnanagar": {
    name: "Krishnanagar & Kalyani (Nadia)",
    aliases: ["krishnanagar", "kalyani", "ranaghat", "shantipur", "nadia"],
    zone: "West Bengal (Nadia)",
    type: "regional",
    railTerminus: "Sealdah Station",
    intercityTransit: "Board Sealdah-Krishnanagar Local / Ranaghat Local EMU train directly to Sealdah Railway Station (~1 hr 45 mins, ₹20).",
    feederToMetro: "From Sealdah, enter Green Line Metro towards Howrah/Salt Lake or walk 8 mins to Central Metro (Blue Line).",
    famousFoods: "Krishnanagar Sarpuria & Sarbhaja, Shantipur sweet curds.",
    topPandals: ["Krishnanagar Rajbari Puja", "Kalyani ITI More Puja", "Luminous Kalyani Pandals"]
  },

  "barasat": {
    name: "Barasat & Madhyamgram",
    aliases: ["barasat", "madhyamgram", "habra", "barasat dakbangla", "colony more"],
    zone: "North 24 Parganas",
    type: "suburban",
    railTerminus: "Sealdah / Dum Dum Metro",
    intercityTransit: "Board Sealdah-Hasnabad/Bangaon local train to Dum Dum Station (~25 mins), or take bus along Jessore Road to Dum Dum Metro / Airport.",
    feederToMetro: "From Dum Dum Metro, enter Blue Line straight into Kolkata.",
    famousFoods: "Barasat biryani, local sweets.",
    topPandals: ["Barasat Pioneer Club", "Barasat Sandhani Club", "KNC Regiment"]
  },

  "barrackpore": {
    name: "Barrackpore & Naihati",
    aliases: ["barrackpore", "naihati", "sodepur", "belgharia", "khardah", "titagarh"],
    zone: "North 24 Parganas",
    type: "suburban",
    railTerminus: "Sealdah / Dakshineswar Metro",
    intercityTransit: "Board Sealdah Main Line local train (~35 mins, ₹10) to Sealdah, or take auto/toto to Dakshineswar Metro station (~20 mins).",
    feederToMetro: "Board Blue Line Metro at Dakshineswar or Sealdah.",
    famousFoods: "Dada Boudi Biryani (Barrackpore), D.B. Biryani, Naihati sweets.",
    topPandals: ["Barrackpore Subhas Pally", "Naihati Bara Maa Kali", "Sodepur Club"]
  },

  "serampore": {
    name: "Serampore & Chandannagar (Hooghly)",
    aliases: ["serampore", "sreerampur", "chandannagar", "chinsurah", "bandel", "rishra", "uttarpara", "bally"],
    zone: "Hooghly District",
    type: "suburban",
    railTerminus: "Howrah Station",
    intercityTransit: "Board Howrah Main Line local train to Howrah Station (~30–45 mins, ₹10), or take Hooghly ferry across to Barrackpore / Dhobi Ghat.",
    feederToMetro: "From Howrah Station, take Green Line Metro (underwater) straight to Esplanade / Sealdah.",
    famousFoods: "Chandannagar Jalbhara Sandesh (Surya Modak), Serampore sweets.",
    topPandals: ["Chandannagar Light Showcase", "Serampore Goswami Rajbari", "Uttarpara Sarbojanin"]
  },

  "bolpur": {
    name: "Bolpur / Santiniketan (Birbhum)",
    aliases: ["bolpur", "santiniketan", "shantiniketan", "birbhum", "suri", "rampurhat"],
    zone: "West Bengal (Birbhum)",
    type: "regional",
    railTerminus: "Howrah Station",
    intercityTransit: "Board Shantiniketan Express / Viswabharati Fast Passenger to Howrah Station (~2.5 hrs, ₹85).",
    feederToMetro: "From Howrah, take Green Line Metro directly to Esplanade / Sealdah in 5 mins.",
    famousFoods: "Khowai snacks, Bonedi Barir sweets.",
    topPandals: ["Santiniketan Ashram Puja", "Bolpur Sarbojanin"]
  },

  "malda": {
    name: "Malda Town",
    aliases: ["malda", "malda town", "english bazar", "gour"],
    zone: "North Bengal",
    type: "regional",
    railTerminus: "Howrah / Sealdah Station",
    intercityTransit: "Board Gour Express / Vande Bharat Express to Sealdah / Howrah (~5–6 hrs).",
    feederToMetro: "Connect with Kolkata Metro at Sealdah or Howrah.",
    famousFoods: "Malda Fazli Aam sandesh, Rasakadamba sweets.",
    topPandals: ["Malda Town Club", "English Bazar Puja"]
  },

  "baharampur": {
    name: "Baharampur / Murshidabad",
    aliases: ["baharampur", "berhampore", "murshidabad", "hazarduari", "lalbagh"],
    zone: "West Bengal (Murshidabad)",
    type: "regional",
    railTerminus: "Sealdah Station",
    intercityTransit: "Board Hazarduari Express / Bhagirathi Express to Sealdah (~3.5 hrs, ₹85).",
    feederToMetro: "From Sealdah, enter Green Line Metro or connect to Blue Line at Central.",
    famousFoods: "Baharampur Chhanabora, Murshidabad Mughlai dishes.",
    topPandals: ["Hazarduari Compound Puja", "Baharampur Club"]
  },

  "purulia": {
    name: "Purulia & Bankura",
    aliases: ["purulia", "bankura", "bishnupur", "ayodhya hills"],
    zone: "West Bengal (Jangalmahal)",
    type: "regional",
    railTerminus: "Howrah Station",
    intercityTransit: "Board Rupashi Bangla Express or Purulia Express to Howrah Station (~4.5 hrs).",
    feederToMetro: "From Howrah, take Green Line Metro directly to Central Kolkata in 5 mins.",
    famousFoods: "Bishnupuri Mecha Sandesh, Bankura sweets.",
    topPandals: ["Purulia Town Club", "Bishnupur Rajbari"]
  },

  "darjeeling_kalimpong": {
    name: "Darjeeling & Kalimpong (North Bengal Hills)",
    aliases: ["darjeeling", "kalimpong", "kurseong", "mirik", "ghoom", "batasia"],
    zone: "North Bengal (Hills)",
    type: "regional",
    railTerminus: "Sealdah / Howrah Station (via NJP)",
    intercityTransit: "Take shared cab down to New Jalpaiguri (NJP, ~2.5 hrs), then board Vande Bharat Express or Darjeeling Mail to Sealdah (~8 hrs).",
    feederToMetro: "From Sealdah / Howrah, take Kolkata Metro directly into the heart of the city.",
    famousFoods: "Darjeeling steamed momos, thukpa, Glenary's bakery pastries.",
    topPandals: ["Darjeeling Mall Road Puja", "Kalimpong Town Puja"]
  },

  "jalpaiguri_coochbehar": {
    name: "Jalpaiguri, Cooch Behar & Alipurduar",
    aliases: ["jalpaiguri", "cooch behar", "coochbehar", "alipurduar", "dooars", "madarihat"],
    zone: "North Bengal (Terai & Dooars)",
    type: "regional",
    railTerminus: "Sealdah Station",
    intercityTransit: "Board Teesta Torsa Express, Kanchan Kanya Express, or Padatik Express to Sealdah (~9–10 hrs).",
    feederToMetro: "From Sealdah, enter Green Line Metro towards Esplanade / Salt Lake.",
    famousFoods: "North Bengal Boroli fish delicacies, Cooch Behar sweets.",
    topPandals: ["Cooch Behar Rajbari Puja", "Jalpaiguri Club"]
  },

  "raiganj_dinajpur": {
    name: "Raiganj & Balurghat (Dinajpur)",
    aliases: ["raiganj", "balurghat", "uttar dinajpur", "dakshin dinajpur", "gazole", "buniadpur"],
    zone: "North Bengal (Dinajpur)",
    type: "regional",
    railTerminus: "Sealdah / Howrah Station",
    intercityTransit: "Board Kulik Express or Gour Express directly to Sealdah / Howrah (~6.5 hrs).",
    feederToMetro: "Board Kolkata Metro from Sealdah or Howrah station concourse.",
    famousFoods: "Tulaipanji rice delicacies, Balurghat chhana sweets.",
    topPandals: ["Raiganj Town Club", "Balurghat Sarbojanin"]
  },

  "rampurhat_birbhum": {
    name: "Rampurhat, Tarapith & Suri (Birbhum)",
    aliases: ["rampurhat", "tarapith", "suri", "siuri", "sainthia", "dubrajpur", "birbhum"],
    zone: "West Bengal (Birbhum)",
    type: "regional",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Board Maa Tara Express, Ganadevata Express, or Mayurakshi Express to Howrah Station (~3.5 hrs, ₹65).",
    feederToMetro: "From Howrah Station, take Green Line Metro under the Hooghly river directly to Esplanade in 5 mins.",
    famousFoods: "Birbhum Morabba, Tarapith peda, Suri radhaballabhi.",
    topPandals: ["Tarapith Temple Complex", "Suri Club", "Rampurhat Puja"]
  },

  "chinsurah_bandel": {
    name: "Chinsurah, Bandel & Tarakeswar (Hooghly)",
    aliases: ["chinsurah", "chuchura", "bandel", "tarakeswar", "rishra", "konnagar", "uttarpara", "hooghly", "chandannagar", "mankundu"],
    zone: "Hooghly (Suburban Bengal)",
    type: "suburban",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Board Howrah-Bandel or Howrah-Tarakeswar local EMU train directly to Howrah Railway Station (~40–55 mins, ₹15).",
    feederToMetro: "From Howrah Station, take Green Line Metro (underwater) to Esplanade / Sealdah in 5 mins.",
    famousFoods: "Bandel cheese, Chandannagar Jalbhara Sandesh.",
    topPandals: ["Bandel Church Compound Puja", "Chandannagar Sarbojanin", "Chinsurah Tolafatak"]
  },

  "uluberia_howrah_rural": {
    name: "Uluberia, Bagnan & Amta (Howrah Rural)",
    aliases: ["uluberia", "bagnan", "amta", "santragachi", "mourigram", "andul", "deulti"],
    zone: "Howrah (Rural & Suburban)",
    type: "suburban",
    railTerminus: "Howrah Railway Station / Santragachi",
    intercityTransit: "Board South Eastern Railway EMU local train (Kharagpur/Mecheda/Amta local) to Howrah Station (~40 mins, ₹15).",
    feederToMetro: "From Howrah, enter Green Line Metro towards Esplanade.",
    famousFoods: "Deulti village sweets, Bagnan kachori.",
    topPandals: ["Uluberia Town Club", "Bagnan Sarbojanin"]
  },

  "habra_bongaon": {
    name: "Habra, Bongaon & Basirhat (North 24 Parganas)",
    aliases: ["habra", "bongaon", "basirhat", "hasnabad", "ashoknagar", "baduria", "taki"],
    zone: "North 24 Parganas (Suburban)",
    type: "suburban",
    railTerminus: "Sealdah Railway Station",
    intercityTransit: "Board Sealdah-Bongaon Local or Sealdah-Hasnabad Local EMU train directly to Sealdah (~1 hr 15 mins, ₹15).",
    feederToMetro: "From Sealdah, enter Green Line Metro towards Esplanade / Salt Lake.",
    famousFoods: "Taki Gamchha Sandesh, Bongaon sweets.",
    topPandals: ["Bongaon Town Club", "Habra Sarbojanin", "Taki Rajbari"]
  },

  "baruipur_canning": {
    name: "Baruipur, Canning & Diamond Harbour (South 24 Parganas)",
    aliases: ["baruipur", "canning", "diamond harbour", "diamondharbour", "sonarpur", "kakdwip", "namkhana", "sundarbans", "joynagar"],
    zone: "South 24 Parganas (Suburban & Delta)",
    type: "suburban",
    railTerminus: "Sealdah South / Kavi Subhash Metro",
    intercityTransit: "Board Sealdah South Local train (Canning/Diamond Harbour/Namkhana local) to Garia / Kavi Subhash or Sealdah South (~35–50 mins, ₹15).",
    feederToMetro: "De-board at Garia station and walk 2 mins into Kavi Subhash Metro Station (Blue Line / Orange Line) to ride directly into Kolkata.",
    famousFoods: "Joynagarer Moa, fresh Hilsa at Diamond Harbour, Baruipur guava.",
    topPandals: ["Baruipur Rajbari", "Diamond Harbour Club", "Sonarpur Sarbojanin"]
  },

  "jhargram_midnapore": {
    name: "Jhargram & Midnapore Town (Jangalmahal)",
    aliases: ["jhargram", "belpahari", "ghatal", "midnapore town", "medinipur town"],
    zone: "West Bengal (Jangalmahal)",
    type: "regional",
    railTerminus: "Howrah Railway Station",
    intercityTransit: "Board Steel Express / Ispat Express / local train to Howrah Station (~2.5 hrs, ₹45).",
    feederToMetro: "From Howrah Station, take Green Line Metro (underwater) to Esplanade / Sealdah in 5 mins.",
    famousFoods: "Jhargram Mahua delicacies, Midnapore Babar sweets.",
    topPandals: ["Jhargram Palace Compound Puja", "Midnapore Town Club"]
  }
};

// 2. Searchable Locations for Autocomplete Dropdowns
export const SEARCHABLE_LOCATIONS = [
  // Segregated South-West Hubs & Pandals
  { id: "taratala", name: "Taratala Crossing (Majerhat/Mint)", category: "Hub", zone: "South-West Kolkata" },
  { id: "new_alipore", name: "New Alipore (Suruchi Sangha Area)", category: "Hub", zone: "South-West Kolkata" },
  { id: "suruchi", name: "Suruchi Sangha (New Alipore)", category: "Pandal", zone: "South-West Kolkata" },
  { id: "behala_thana", name: "Behala Thana (Kadamtala / 14 No.)", category: "Hub", zone: "South-West Kolkata" },
  { id: "behala_chowrasta", name: "Behala Chowrasta (James Long)", category: "Hub", zone: "South-West Kolkata" },
  { id: "barisha", name: "Barisha Club (Chowrasta)", category: "Pandal", zone: "South-West Kolkata" },
  { id: "parnasree", name: "Parnasree Pally", category: "Pandal", zone: "South-West Kolkata" },
  { id: "chetla", name: "Chetla Agrani Club", category: "Pandal", zone: "South Kolkata" },
  
  // South Kolkata
  { id: "gariahat", name: "Gariahat Crossing (Ekdalia / Singhi)", category: "Hub", zone: "South Kolkata" },
  { id: "ekdalia", name: "Ekdalia Evergreen Club", category: "Pandal", zone: "South Kolkata" },
  { id: "deshapriya", name: "Deshapriya Park & Tridhara", category: "Pandal", zone: "South Kolkata" },
  { id: "maddox", name: "Maddox Square", category: "Pandal", zone: "South Kolkata" },
  { id: "kalighat", name: "Kalighat Temple / Metro", category: "Hub", zone: "South Kolkata" },
  { id: "garia", name: "Garia (Kavi Nazrul / Naktala)", category: "Hub", zone: "South Kolkata" },

  // Central & East (including Beleghata Karmi Sangha)
  { id: "beleghata", name: "Beleghata (Karmi Sangha / Rashmoni Bazar)", category: "Hub", zone: "Central & East Kolkata" },
  { id: "beleghata_karmi", name: "Beleghata Karmi Sangha", category: "Pandal", zone: "Central & East Kolkata" },
  { id: "santosh_mitra", name: "Santosh Mitra Square (Bowbazar)", category: "Pandal", zone: "Central Kolkata" },
  { id: "college_square", name: "College Square & Md Ali Park", category: "Pandal", zone: "Central Kolkata" },
  { id: "esplanade", name: "Esplanade Interchange Metro", category: "Hub", zone: "Central Kolkata" },
  { id: "sealdah", name: "Sealdah Railway & Metro Station", category: "Hub", zone: "Central-East Kolkata" },
  { id: "salt_lake", name: "Salt Lake (FD, BJ Block, Sector V)", category: "Hub", zone: "East Kolkata" },

  // North & North-East
  { id: "sreebhumi", name: "Sreebhumi Sporting Club (Lake Town)", category: "Pandal", zone: "North-East Kolkata" },
  { id: "dumdum_park", name: "Dum Dum Park (Tarun Dal)", category: "Pandal", zone: "North-East Kolkata" },
  { id: "bagbazar", name: "Bagbazar Sarbojanin", category: "Pandal", zone: "North Kolkata" },
  { id: "kumartuli", name: "Kumartuli & Ahiritola", category: "Pandal", zone: "North Kolkata" },
  { id: "hatibagan", name: "Hatibagan / Kashi Bose Lane", category: "Pandal", zone: "North Kolkata" },
  { id: "howrah", name: "Howrah Railway Station", category: "Hub", zone: "Howrah / West" },

  // West Bengal Regional Hubs
  { id: "asansol", name: "Asansol (Paschim Bardhaman)", category: "WB District", zone: "West Bengal" },
  { id: "durgapur", name: "Durgapur (Paschim Bardhaman)", category: "WB District", zone: "West Bengal" },
  { id: "bardhaman", name: "Burdwan / Bardhaman", category: "WB District", zone: "West Bengal" },
  { id: "siliguri", name: "Siliguri / NJP", category: "WB City", zone: "North Bengal" },
  { id: "kharagpur", name: "Kharagpur (Paschim Medinipur)", category: "WB District", zone: "West Bengal" },
  { id: "haldia", name: "Haldia & Tamluk", category: "WB Port", zone: "West Bengal" },
  { id: "digha", name: "Digha & Mandarmani", category: "WB Coastal", zone: "West Bengal" },
  { id: "krishnanagar", name: "Krishnanagar & Kalyani", category: "WB District", zone: "Nadia" },
  { id: "barasat", name: "Barasat & Madhyamgram", category: "WB Suburban", zone: "North 24 Pgs" },
  { id: "barrackpore", name: "Barrackpore & Naihati", category: "WB Suburban", zone: "North 24 Pgs" },
  { id: "serampore", name: "Serampore & Chandannagar", category: "WB Suburban", zone: "Hooghly" },
  { id: "bolpur", name: "Bolpur & Santiniketan", category: "WB Heritage", zone: "Birbhum" },
  { id: "malda", name: "Malda Town", category: "WB City", zone: "North Bengal" },
  { id: "baharampur", name: "Baharampur & Murshidabad", category: "WB Heritage", zone: "Murshidabad" },
  { id: "purulia", name: "Purulia & Bankura", category: "WB District", zone: "Jangalmahal" },
  { id: "darjeeling", name: "Darjeeling & Kalimpong", category: "WB Hills", zone: "North Bengal" },
  { id: "jalpaiguri", name: "Jalpaiguri & Cooch Behar", category: "WB Terai", zone: "North Bengal" },
  { id: "raiganj", name: "Raiganj & Balurghat", category: "WB Plains", zone: "North Bengal" },
  { id: "rampurhat", name: "Rampurhat & Tarapith", category: "WB Heritage", zone: "Birbhum" },
  { id: "chinsurah", name: "Chinsurah, Bandel & Tarakeswar", category: "WB Suburban", zone: "Hooghly" },
  { id: "uluberia", name: "Uluberia & Bagnan", category: "WB Suburban", zone: "Howrah Rural" },
  { id: "habra", name: "Habra & Bongaon", category: "WB Suburban", zone: "North 24 Pgs" },
  { id: "baruipur", name: "Baruipur & Diamond Harbour", category: "WB Suburban", zone: "South 24 Pgs" },
  { id: "jhargram", name: "Jhargram & Midnapore", category: "WB Heritage", zone: "Jangalmahal" }
];

/**
 * Determine metro line color by station name
 */
export function getMetroLineColor(metroName) {
  if (!metroName) return "blue";
  const m = metroName.toLowerCase();
  
  if (
    m.includes("salt lake") || m.includes("karunamoyee") || m.includes("central park") ||
    m.includes("city centre") || m.includes("bengal chemical") || m.includes("stadium") ||
    m.includes("phoolbagan") || m.includes("sealdah") || m.includes("howrah") ||
    m.includes("sector v") || m.includes("green")
  ) {
    return "green";
  }
  
  if (
    m.includes("taratala") || m.includes("joka") || m.includes("thakurpukur") ||
    m.includes("sakher bazar") || m.includes("behala chowrasta") || m.includes("behala bazar") ||
    m.includes("majerhat") || m.includes("purple")
  ) {
    return "purple";
  }

  if (
    m.includes("ruby") || m.includes("hemanta") || m.includes("kavi sukanta") ||
    m.includes("jyotirindra") || m.includes("satyajit") || m.includes("vip bazar") ||
    m.includes("orange")
  ) {
    return "orange";
  }

  return "blue";
}

/**
 * Construct a rich transit hub object from any PANDALS_DATA record
 */
export function createPandalHub(pandal) {
  const line = getMetroLineColor(pandal.metro);
  const metroName = pandal.metro && pandal.metro !== "Nearby Bus/Auto" ? `${pandal.metro} Metro` : "Nearest Metro Corridor";
  const walkTime = pandal.walkMin || 5;

  return {
    key: `pandal_${pandal.id}`,
    name: pandal.name,
    isPandal: true,
    pandalData: pandal,
    zone: pandal.zoneLabel || "Kolkata",
    nearestMetro: metroName,
    metroLine: line,
    feederToMetro: `Walk ${walkTime} mins or take a short auto/rickshaw from ${pandal.name} to ${metroName}.`,
    lastMileFromMetro: `From ${metroName}, walk ${walkTime} mins or take a shared auto/rickshaw directly to ${pandal.name} (${pandal.address || pandal.locality}).`,
    walkCorridor: `Follow Kolkata Police one-way barricaded pedestrian route on ${pandal.address || pandal.locality}. Expected crowd: ${pandal.crowd || 'Festive crowd'}.`,
    famousFoods: Array.isArray(pandal.foodNearby) && pandal.foodNearby.length > 0 
      ? pandal.foodNearby.join(", ") 
      : "Festive roll stalls, fuchka, and mishti counters around the pandal gate",
    tip: pandal.highlights || `Crowd is typically ${pandal.crowd || 'active'}. Best visited during late afternoon (2:00 PM - 4:30 PM) or after 1:00 AM to avoid peak queues.`
  };
}

/**
 * Fuzzy & phonetic search to match input string to known hub or any of the 661 pandals
 */
export function identifyHub(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // 1. Direct key match in KOLKATA_TRANSIT_HUBS
  if (KOLKATA_TRANSIT_HUBS[q]) {
    return { key: q, ...KOLKATA_TRANSIT_HUBS[q] };
  }

  // 2. Strict exact alias match first to avoid partial conflicts (e.g. taratala vs behala)
  for (const [key, hub] of Object.entries(KOLKATA_TRANSIT_HUBS)) {
    if (hub.aliases && hub.aliases.some(alias => alias === q)) {
      return { key, ...hub };
    }
  }

  // 3. Containment alias match (longest alias match wins)
  let bestMatch = null;
  let longestAliasLength = 0;

  for (const [key, hub] of Object.entries(KOLKATA_TRANSIT_HUBS)) {
    if (hub.aliases) {
      for (const alias of hub.aliases) {
        if ((q.includes(alias) || alias.includes(q)) && alias.length > longestAliasLength) {
          longestAliasLength = alias.length;
          bestMatch = { key, ...hub };
        }
      }
    }
  }

  if (bestMatch) return bestMatch;

  // 4. Check HOMOPHONE_ALIASES
  const homophoneKey = normalizePhonetic(q);
  for (const [aliasKey, targetName] of Object.entries(HOMOPHONE_ALIASES)) {
    if (q.includes(aliasKey) || (homophoneKey && homophoneKey.includes(normalizePhonetic(aliasKey)))) {
      const foundPandal = PANDALS_DATA.find(p => 
        p.name.toLowerCase() === targetName.toLowerCase() ||
        p.name.toLowerCase().includes(targetName.toLowerCase())
      );
      if (foundPandal) {
        return createPandalHub(foundPandal);
      }
    }
  }

  // 5. Search in 661 PANDALS_DATA (Exact, Containment, and Phonetic)
  const matchedPandal = PANDALS_DATA.find(p => {
    const pName = p.name.toLowerCase();
    const pLoc = (p.locality || "").toLowerCase();
    
    if (pName === q || pName.includes(q) || q.includes(pName)) return true;
    if (pLoc && (pLoc === q || q.includes(pLoc))) return true;

    const pPhone = normalizePhonetic(pName);
    if (pPhone && homophoneKey && (pPhone.includes(homophoneKey) || homophoneKey.includes(pPhone))) {
      return true;
    }
    return false;
  });

  if (matchedPandal) {
    return createPandalHub(matchedPandal);
  }

  return null;
}

/**
 * Parse origin and destination from user query
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

  // Pattern 3: Bengali format "X theke Y kivabe jabo" / "X theke Y"
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

  // Pattern 5: Single destination fallback: "how to reach X"
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
 * Generate ChatGPT/Gemini-style step-by-step navigation between ANY two points in West Bengal
 */
export function generateDynamicRoute(originQuery, destinationQuery, userLocation = null) {
  const originHub = identifyHub(originQuery);
  const destHub = identifyHub(destinationQuery);

  const cleanOrigin = originHub ? originHub.name : (originQuery ? originQuery.trim() : "Your Location / Central Kolkata");
  const cleanDest = destHub ? destHub.name : (destinationQuery ? destinationQuery.trim() : "Durga Puja Pandal");

  const title = `${cleanOrigin} to ${cleanDest}`;
  const steps = [];

  // Google Maps navigation link
  const originMapParam = encodeURIComponent(originHub ? `${originHub.name}, Kolkata` : (originQuery || "Kolkata"));
  const destMapParam = encodeURIComponent(destHub ? `${destHub.name}, Kolkata` : (destinationQuery || "Kolkata"));
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originMapParam}&destination=${destMapParam}&travelmode=transit`;

  // Case 1: Same neighborhood / hub
  if (originHub && destHub && originHub.key === destHub.key) {
    steps.push({
      stepNum: 1,
      type: "walk",
      icon: "🚶",
      title: "Direct Neighborhood Walk or Toto",
      desc: `Both ${cleanOrigin} and ${cleanDest} are located in the same neighborhood! You can walk in 5–8 minutes or hop on a shared toto (₹10–₹12).`
    });
    if (destHub.walkCorridor) {
      steps.push({
        stepNum: 2,
        type: "walk",
        icon: "🚶",
        title: "Pandal Entry Corridor",
        desc: destHub.walkCorridor
      });
    }
    if (destHub.famousFoods) {
      steps.push({
        stepNum: 3,
        type: "food",
        icon: "🍽️",
        title: "Food & Sweet Pitstop",
        desc: destHub.famousFoods
      });
    }
    return {
      title,
      originName: cleanOrigin,
      destName: cleanDest,
      totalTime: "5 – 10 mins",
      estimatedCost: "₹0 – ₹12",
      googleMapsUrl,
      steps,
      foodPitstops: destHub.famousFoods,
      proTip: "Enjoy the neighborhood festive decor without needing public transit!"
    };
  }

  let stepCounter = 1;

  // Case 2: Origin is a West Bengal Regional or Suburban District (outside core Kolkata)
  if (originHub && (originHub.type === "regional" || originHub.type === "suburban")) {
    steps.push({
      stepNum: stepCounter++,
      type: "train",
      icon: "🚆",
      title: `Intercity Transit from ${cleanOrigin}`,
      desc: originHub.intercityTransit || `Board an express or local EMU train from ${cleanOrigin} heading to ${originHub.railTerminus || 'Kolkata Railway Terminus'}.`
    });

    steps.push({
      stepNum: stepCounter++,
      type: "metro",
      icon: "🚇",
      title: "Transfer to Kolkata Metro",
      desc: originHub.feederToMetro || "Upon reaching the railway terminus, proceed directly to the Kolkata Metro station concourse."
    });
  } else if (originHub && originHub.feederToMetro) {
    // Local Kolkata Feeder
    steps.push({
      stepNum: stepCounter++,
      type: "auto",
      icon: "🛺",
      title: `Step 1 (First-Mile Feeder from ${cleanOrigin})`,
      desc: originHub.feederToMetro
    });
  } else {
    steps.push({
      stepNum: stepCounter++,
      type: "auto",
      icon: "🛺",
      title: "Step 1 (First-Mile Transit)",
      desc: `From ${cleanOrigin}, take a shared auto, toto, or local bus to the nearest Kolkata Metro station.`
    });
  }

  // Core Metro Spine
  const originMetro = originHub?.nearestMetro || "Nearest Kolkata Metro Station";
  const destMetro = destHub?.nearestMetro || "Nearest Destination Metro Station";
  const originLine = originHub?.metroLine || "blue";
  const destLine = destHub?.metroLine || "blue";

  if (destHub) {
    if (originLine === destLine && originLine !== "interchange") {
      steps.push({
        stepNum: stepCounter++,
        type: "metro",
        icon: "🚇",
        title: "Step 2 (Kolkata Metro Ride)",
        desc: `Board the Kolkata Metro at ${originMetro}. Ride directly towards ${destMetro} (~12–25 mins, ₹10–₹20). Keep a smart token or UPI recharge ready.`
      });
    } else {
      // Line Interchange Required (e.g. Purple/Green to Blue Line at Esplanade)
      steps.push({
        stepNum: stepCounter++,
        type: "metro",
        icon: "🚇",
        title: "Step 2 (Metro Line & Interchange)",
        desc: `Take the ${originLine === 'green' ? 'Green Line' : 'Blue Line'} to Esplanade Interchange Station. Switch through the underground interchange corridor to the ${destLine === 'green' ? 'Green Line' : 'Blue Line'} and continue to ${destMetro}.`
      });
    }

    // Last-Mile from Destination Metro
    if (destHub.lastMileFromMetro) {
      steps.push({
        stepNum: stepCounter++,
        type: "auto",
        icon: "🛺",
        title: "Step 3 (Last-Mile Connection)",
        desc: destHub.lastMileFromMetro
      });
    }

    // Pandal Entry / Walking Corridor
    if (destHub.walkCorridor) {
      steps.push({
        stepNum: stepCounter++,
        type: "walk",
        icon: "🚶",
        title: "Step 4 (Walking Corridor & Police Entry)",
        desc: destHub.walkCorridor
      });
    } else {
      steps.push({
        stepNum: stepCounter++,
        type: "walk",
        icon: "🚶",
        title: "Step 4 (Pandal Entry Gates)",
        desc: "Follow the Kolkata Police barricaded pedestrian one-way lanes directly to the main darshan queue."
      });
    }

    // Food Pitstop
    if (destHub.famousFoods) {
      steps.push({
        stepNum: stepCounter++,
        type: "food",
        icon: "🍽️",
        title: "Step 5 (Iconic Food & Sweet Stop)",
        desc: destHub.famousFoods
      });
    }

    // Pro-Tip
    steps.push({
      stepNum: stepCounter++,
      type: "tip",
      icon: "💡",
      title: "Dawon AI Crowd Tip",
      desc: destHub.tip || "Evening rush peaks between 6:30 PM and 11:30 PM. For minimum wait times and comfortable photos, visit between 2:00 PM and 4:30 PM or after 1:00 AM!"
    });
  } else {
    // Destination is a custom West Bengal spot or pandal not in static list
    steps.push({
      stepNum: stepCounter++,
      type: "metro",
      icon: "🚇",
      title: "Step 2 (Core Transit Corridor)",
      desc: `Take Kolkata Metro / Suburban railway towards the nearest junction for ${cleanDest}.`
    });

    steps.push({
      stepNum: stepCounter++,
      type: "auto",
      icon: "🛺",
      title: "Step 3 (Local Toto or Shared Auto)",
      desc: `From the main station exit, take an auto or toto towards ${cleanDest}. Standard local fare is usually ₹12–₹20.`
    });

    steps.push({
      stepNum: stepCounter++,
      type: "walk",
      icon: "🚶",
      title: "Step 4 (Pandal Entry & Darshan)",
      desc: `Follow the decorated community gate into ${cleanDest}. Check queue lines and entry rules.`
    });

    steps.push({
      stepNum: stepCounter++,
      type: "tip",
      icon: "💡",
      title: "Dawon Pro-Tip",
      desc: "Tap the 'Open in Google Maps' button below for live real-time traffic, transit bus numbers, and walking GPS."
    });
  }

  // Calculate realistic travel time and cost
  const isRegional = originHub && (originHub.type === "regional" || originHub.type === "suburban");
  const totalTime = isRegional ? "~1.5 – 3 hrs" : "~35 – 50 mins";
  const estimatedCost = isRegional ? "₹55 – ₹130" : "₹25 – ₹40";

  return {
    title,
    originName: cleanOrigin,
    destName: cleanDest,
    totalTime,
    estimatedCost,
    googleMapsUrl,
    steps,
    foodPitstops: destHub?.famousFoods || "Local roll stalls and mishti shops nearby",
    proTip: destHub?.tip || "Visit during afternoon for lowest queue wait times!"
  };
}

/**
 * Format a generated route into a structured ChatGPT/Gemini-style response
 */
export function formatRouteAsAssistantResponse(route) {
  if (!route) return "";
  let out = `🦁 **Dawon's Step-by-Step Route Guide: ${route.originName} ➔ ${route.destName}**\n\n`;
  out += `⏱️ **Est. Travel Time:** ${route.totalTime} | 💰 **Approx Fare:** ${route.estimatedCost}\n\n`;
  
  if (route.steps && route.steps.length > 0) {
    route.steps.forEach((s) => {
      out += `${s.icon || '📍'} **${s.title}**\n${s.desc}\n\n`;
    });
  }

  if (route.foodPitstops) {
    out += `🍽️ **Food & Mishti Pitstop:** ${route.foodPitstops}\n\n`;
  }
  if (route.proTip) {
    out += `💡 **Dawon AI Pro-Tip:** ${route.proTip}\n`;
  }
  return out.trim();
}

/**
 * Find matched restaurant from query string (Exact name, Bengali name, Phonetics, or Keyword)
 */
export function findRestaurantQuery(query) {
  if (!query || typeof query !== "string") return null;
  const rawQ = query.toLowerCase().trim();
  const cleanQ = rawQ
    .replace(/^(where is|where can i find|tell me about|how to reach|how to go to|location of|direction to|directions to|is there any)\s+/i, "")
    .replace(/\s+(restaurant|resturent|resturant|hotel|cabin|cafe|eatery|outlet|branch)\s*$/i, "")
    .trim();
  const normQ = normalizePhonetic(rawQ);
  const normCleanQ = normalizePhonetic(cleanQ);

  // 1. Direct or alias match in RESTAURANTS_DATA
  for (const r of RESTAURANTS_DATA) {
    const rName = r.name.toLowerCase();
    const rBengali = (r.bengaliName || "").toLowerCase();
    const rNorm = normalizePhonetic(r.name);
    
    // Check clean name match (e.g. "abhijato", "peter cat", "mocambo")
    const cleanRName = rName.replace(/\s+(restaurant|resturent|resturant|hotel|cabin|cafe|bar)\s*$/i, "").trim();

    if (
      rawQ.includes(rName) ||
      (cleanRName.length >= 4 && rawQ.includes(cleanRName)) ||
      (cleanQ.length >= 3 && rName.includes(cleanQ)) ||
      (rBengali && rawQ.includes(rBengali)) ||
      normQ.includes(rNorm) ||
      (normCleanQ.length >= 4 && rNorm.includes(normCleanQ))
    ) {
      return r;
    }
  }

  // 2. High-frequency custom alias mapping
  const customRestaurantAliases = {
    "abhijato": "rest-abhijato",
    "ovijato": "rest-abhijato",
    "abijato": "rest-abhijato",
    "abhijata": "rest-abhijato",
    "arya samity restaurant": "rest-abhijato",
    "peter cat": "rest-1",
    "mocambo": "rest-2",
    "flurys": "rest-3",
    "arsalan": "rest-4",
    "aminia": "rest-6",
    "mitra cafe": "rest-10",
    "bhojohori manna": "rest-8",
    "6 ballygunge place": "rest-7",
    "oudh 1590": "rest-9"
  };

  for (const [alias, restId] of Object.entries(customRestaurantAliases)) {
    if (rawQ.includes(alias) || normQ.includes(normalizePhonetic(alias))) {
      const found = RESTAURANTS_DATA.find(r => r.id === restId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Format an optimal Google Gemini / ChatGPT-grade structured guide for any restaurant
 */
export function formatRestaurantGeminiGuide(restaurant) {
  if (!restaurant) return "";

  const dishes = Array.isArray(restaurant.mustTryDishes) 
    ? restaurant.mustTryDishes.join(", ") 
    : (restaurant.specialty || "Iconic Bengali & Kolkata Delicacies");

  return `🍽️ **Dawon's Culinary Guide: ${restaurant.name}** ${restaurant.bengaliName ? `(${restaurant.bengaliName})` : ""}

📍 **Location & Area**:
${restaurant.address}
*(Area: ${restaurant.area}${restaurant.zoneLabel ? `, ${restaurant.zoneLabel}` : ""})*

🚇 **Transit & How to Reach**:
• **Nearest Metro**: ${restaurant.metro || "Connected via Kolkata Metro & shared auto corridors"}
• **Last-Mile Transit**: Take a local shared auto or bus directly towards ${restaurant.area}.

⭐ **Cuisine & Signature Specialties**:
• **Cuisine**: ${restaurant.cuisine} (${restaurant.type || "Casual Dining"})
• **Signature Dish**: ${restaurant.specialty}
• **Must-Try Items**: ${dishes}
• **Rating & Price**: ⭐ ${restaurant.rating}/5 (${restaurant.reviewsCount || "Highly Rated"}) • ${restaurant.priceRange || "₹₹"}

⏱️ **Puja Festival Hours**:
${restaurant.pujoTimings || "Open late night during Durga Puja (till 1:30 AM - 2:00 AM)"}

🗺️ [Open in Google Maps](${restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' Kolkata')}`})`;
}

/**
 * Handle Open-Ended Pujo Queries (Timings, Rituals, Food, Rules, Metro, Restaurants)
 */
export function handleOpenEndedQuery(query) {
  const q = query.toLowerCase();

  // 0. Specific Restaurant or Eatery Query (Abhijato, Peter Cat, Mocambo, etc.)
  const matchedRestaurant = findRestaurantQuery(query);
  if (matchedRestaurant) {
    return {
      text: formatRestaurantGeminiGuide(matchedRestaurant),
      restaurant: matchedRestaurant
    };
  }

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
6. Beleghata Karmi Sangha (East/Central) — Visionary theme art with profound social messaging!`
    };
  }

  // 8. Emergency Helplines & Police
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

  return null;
}
