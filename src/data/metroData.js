// Kolkata Metro Station Hubs for Durga Puja Navigation
// Connecting 781+ Pandals across North-South (Blue Line) and East-West (Green Line)

export const METRO_STATIONS = [
  // --- BLUE LINE (NORTH-SOUTH) ---
  {
    id: "dumdum",
    name: "Dum Dum",
    bengaliName: "দমদম",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.6225,
    lng: 88.3965,
    matchKeywords: ["Dum Dum", "Dumdum", "Nagerbazar", "Tarun Dal", "Bharat Chakra", "Park Tarun"],
    description: "Gateway to North-East Kolkata mega pandals including Dum Dum Park Tarun Dal, Bharat Chakra, and Nalin Sarkar."
  },
  {
    id: "shyambazar",
    name: "Shyambazar",
    bengaliName: "শ্যামবাজার",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.6025,
    lng: 88.3725,
    matchKeywords: ["Shyambazar", "Shambazar", "Bagbazar", "Falguni", "Golbari"],
    description: "Prime hub for Bagbazar Sarbojanin, Tala Barowari, and historic North Kolkata bonedi pujos."
  },
  {
    id: "shobhabazar",
    name: "Shobhabazar Sutanuti",
    bengaliName: "শোভাবাজার সুতানুটি",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5975,
    lng: 88.3685,
    matchKeywords: ["Shobhabazar", "Sovabazar", "Kumartuli", "Ahiritola", "Beniatola", "BK Paul"],
    description: "The artisan heartland! Kumartuli Park, Ahiritola Jubak Brinda, Sovabazar Rajbari, and Beniatola."
  },
  {
    id: "girish_park",
    name: "Girish Park",
    bengaliName: "গিরিশ পার্ক",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5855,
    lng: 88.3625,
    matchKeywords: ["Girish Park", "Simla", "Vivekananda", "Manicktala", "Kashi Bose"],
    description: "Access to Simla Bayam Samiti, Kashi Bose Lane, Manicktala Chaltabagan, and Vivekananda Road."
  },
  {
    id: "mg_road",
    name: "Mahatma Gandhi Road (MG Road)",
    bengaliName: "মহাত্মা গান্ধী রোড",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5805,
    lng: 88.3635,
    matchKeywords: ["MG Road", "College Square", "Mohammad Ali", "College Street", "Burrabazar"],
    description: "Center for grand aquatic illuminations: College Square, Mohammad Ali Park, and Burrabazar pujos."
  },
  {
    id: "central",
    name: "Central",
    bengaliName: "সেন্ট্রাল",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5715,
    lng: 88.3615,
    matchKeywords: ["Central", "Santosh Mitra", "Bowbazar", "BB Ganguly", "Muchi Para"],
    description: "Short walk to Santosh Mitra Square (Lebutala), Subodh Mullick Square, and Bowbazar."
  },
  {
    id: "chandni",
    name: "Chandni Chowk",
    bengaliName: "চাঁদনি চক",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5665,
    lng: 88.3585,
    matchKeywords: ["Chandni", "Dharamtala", "Janbazar", "Rani Rashmoni"],
    description: "Central Kolkata commercial belt, Janbazar Rajbari, and Wellington Square."
  },
  {
    id: "esplanade",
    name: "Esplanade",
    bengaliName: "এসপ্ল্যানেড",
    line: "blue",
    lineName: "Interchange (Blue & Green Lines)",
    lat: 22.5645,
    lng: 88.3515,
    matchKeywords: ["Esplanade", "New Market", "Curzon", "Park Street"],
    description: "Kolkata's central transit nexus connecting Blue Line, Green Line, tramways, and bus corridors."
  },
  {
    id: "rabindra_sadan",
    name: "Rabindra Sadan",
    bengaliName: "রবীন্দ্র সদন",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5405,
    lng: 88.3475,
    matchKeywords: ["Rabindra Sadan", "Nandan", "Exide", "Gokhale", "Bhowanipore"],
    description: "Access to Bhowanipore 76 Palli, Paddapukur, and Northern Park."
  },
  {
    id: "netaji_bhavan",
    name: "Netaji Bhavan",
    bengaliName: "নেতাজি ভবন",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5345,
    lng: 88.3465,
    matchKeywords: ["Netaji Bhavan", "Chakraberia", "Bakulbagan", "Lansdowne", "Maddox"],
    description: "Gateway to Maddox Square (adda paradise!), Chakraberia Sarbojanin, and Bakulbagan."
  },
  {
    id: "jatin_das_park",
    name: "Jatin Das Park",
    bengaliName: "যতীন দাস পার্ক",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5275,
    lng: 88.3475,
    matchKeywords: ["Jatin Das", "Hazra", "Deshamukhyo", "Ashwini Dutta"],
    description: "Hazra crossing hub connecting Bhowanipore and South Kolkata pandal routes."
  },
  {
    id: "kalighat",
    name: "Kalighat",
    bengaliName: "কালীঘাট",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5175,
    lng: 88.3485,
    matchKeywords: ["Kalighat", "Deshapriya", "Singhi", "Ekdalia", "Tridhara", "Chetla", "Badamtala", "66 Pally", "Mudiali", "Rashbehari"],
    description: "THE ULTIMATE SOUTH KOLKATA PUJO HUB: Deshapriya Park, Singhi Park, Ekdalia Evergreen, Tridhara Sammilani, Chetla Agrani, Badamtala Ashar Sangha, and 66 Pally!"
  },
  {
    id: "rabindra_sarobar",
    name: "Rabindra Sarobar",
    bengaliName: "রবীন্দ্র সরোবর",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.5085,
    lng: 88.3495,
    matchKeywords: ["Rabindra Sarobar", "Sarobar", "Southern Avenue", "Mudiali", "Shiv Mandir", "Lake"],
    description: "Shiv Mandir, Mudiali Club, Menoka, and scenic South Kolkata lake pujos."
  },
  {
    id: "uttam_kumar",
    name: "Mahanayak Uttam Kumar (Tollygunge)",
    bengaliName: "মহানায়ক উত্তম কুমার",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.4985,
    lng: 88.3475,
    matchKeywords: ["Tollygunge", "Uttam Kumar", "Haridevpur", "Ajeya Sangha", "41 Pally", "Vivekananda Park"],
    description: "Gateway to Haridevpur (Ajeya Sangha, 41 Pally), Tollygunge Agragami, and Behala connectors."
  },
  {
    id: "netaji",
    name: "Netaji (Kudghat)",
    bengaliName: "নেতাজি",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.4895,
    lng: 88.3485,
    matchKeywords: ["Kudghat", "Netaji", "Baburam Ghosh"],
    description: "South suburb corridor connecting Bansdroni and Kudghat residential community pandals."
  },
  {
    id: "kavi_nazrul",
    name: "Kavi Nazrul (Garia Bazar)",
    bengaliName: "কাজী নজরুল",
    line: "blue",
    lineName: "Blue Line (North-South)",
    lat: 22.4695,
    lng: 88.3755,
    matchKeywords: ["Garia", "Kavi Nazrul", "Naktala", "Udayan Sangha", "Garia Mitali"],
    description: "Direct walk to Naktala Udayan Sangha (one of Bengal's grandest award winners) and Garia Navapally."
  },

  // --- GREEN LINE (EAST-WEST) ---
  {
    id: "howrah_station",
    name: "Howrah Station",
    bengaliName: "হাওড়া স্টেশন",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5855,
    lng: 88.3415,
    matchKeywords: ["Howrah Station", "Howrah", "Mallick Ghat", "Salkia"],
    description: "Under-river underwater metro hub linking Howrah railway terminus to Howrah Sarbojanin and Salkia."
  },
  {
    id: "sealdah",
    name: "Sealdah",
    bengaliName: "শিয়ালদহ",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5675,
    lng: 88.3725,
    matchKeywords: ["Sealdah", "Beliaghata", "Chaltabagan", "Amherst"],
    description: "Connecting Sealdah Athletic Club, Beleghata Sandhani, and Raja Bazar."
  },
  {
    id: "phoolbagan",
    name: "Phoolbagan",
    bengaliName: "ফুলবাগান",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5715,
    lng: 88.3885,
    matchKeywords: ["Phoolbagan", "Kankurgachi", "Subhas Sarobar", "Beleghata Sandhani", "Mitali"],
    description: "Prime hub for Kankurgachi Yubak Brinda, Beleghata Sandhani, and Subhas Sarobar."
  },
  {
    id: "saltlake_stadium",
    name: "Salt Lake Stadium",
    bengaliName: "সল্টলেক স্টেডিয়াম",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5725,
    lng: 88.4065,
    matchKeywords: ["Stadium", "Kadapara", "Hyatt", "EM Bypass"],
    description: "East Kolkata Bypass transit hub connecting to Beleghata and Salt Lake entrance."
  },
  {
    id: "karunamoyee",
    name: "Karunamoyee",
    bengaliName: "করুণাময়ী",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5865,
    lng: 88.4235,
    matchKeywords: ["Karunamoyee", "Central Park", "Mela Ground", "Salt Lake Central"],
    description: "Central Salt Lake bus terminal & Metro hub: Central Park Mela Ground, EE Block, and Bidhannagar."
  },
  {
    id: "city_centre",
    name: "City Centre (Salt Lake)",
    bengaliName: "সিটি সেন্টার",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5925,
    lng: 88.4115,
    matchKeywords: ["City Centre", "Salt Lake", "FD Block", "BJ Block", "AK Block", "AJ Block", "Labony"],
    description: "THE SALT LAKE PUJO EPICENTER: FD Block, BJ Block, AK Block, AJ Block, and Salt Lake Labony!"
  },
  {
    id: "central_park",
    name: "Central Park (Salt Lake)",
    bengaliName: "সেন্ট্রাল পার্ক",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5905,
    lng: 88.4185,
    matchKeywords: ["Central Park", "Salt Lake", "BF Block", "GD Block"],
    description: "Direct walk to BF Block, GD Block, and Karunamoyee residential celebrations."
  },
  {
    id: "sector_v",
    name: "Salt Lake Sector V",
    bengaliName: "সল্টলেক সেক্টর ফাইভ",
    line: "green",
    lineName: "Green Line (East-West)",
    lat: 22.5805,
    lng: 88.4345,
    matchKeywords: ["Sector V", "Salt Lake", "Technopolis", "Wipro"],
    description: "IT Corridor hub connecting East Kolkata, New Town bus corridors, and Mahishbathan."
  }
];
