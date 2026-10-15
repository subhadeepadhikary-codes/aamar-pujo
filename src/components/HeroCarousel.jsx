import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Award, 
  Flame,
  ArrowRight
} from "lucide-react";
import { getDurgaFace } from "../utils/imageFallback";

export const FEATURED_SLIDES = [
  {
    id: 1,
    name: "Santosh Mitra Square",
    bengaliName: "সন্তোষ মিত্র স্কোয়ার",
    zone: "Central Kolkata",
    locality: "Bowbazar / Sealdah",
    image: "https://pandalgo.in/storage/uploads/pandals/hero/fffea533-f520-4693-b0b7-3f1213101b98.jpg",
    theme: "Spectacular Architectural Palace & Laser Illuminations",
    lat: 22.5678,
    lng: 88.3685,
    metro: "Central / Sealdah",
    award: true
  },
  {
    id: 2,
    name: "Chetla Agrani Club",
    bengaliName: "চেতলা অগ্রণী ক্লাব",
    zone: "South Kolkata",
    locality: "Chetla / Kalighat",
    image: "https://pandalgo.in/storage/uploads/pandals/hero/1eb5390b-9061-44d4-9b81-397e8e54a677.jpg",
    theme: "Masterpiece Clay Artisan Idols & Earthy Eco-Heritage Theme",
    lat: 22.5186,
    lng: 88.3375,
    metro: "Kalighat",
    award: true
  },
  {
    id: 3,
    name: "Ahiritola Jubak Brinda",
    bengaliName: "আহিরীটোলা যুবক বৃন্দ",
    zone: "North Kolkata",
    locality: "Ahiritola / Shobhabazar",
    image: "https://pandalgo.in/storage/uploads/pandals/hero/1534154a-f714-4fe1-bed7-aa1b5e76ebc1.jpg",
    theme: "Intricate Terracotta Folk Heritage & Authentic Bengali Craft",
    lat: 22.5937,
    lng: 88.3581,
    metro: "Shobhabazar Sutanuti",
    award: true
  },
  {
    id: 4,
    name: "College Square Sarbojanin",
    bengaliName: "কলেজ স্কোয়ার সার্বজনীন",
    zone: "Central Kolkata",
    locality: "College Street",
    image: "https://pandalgo.in/storage/uploads/pandals/hero/7e41342f-4780-4f0c-8f84-52a7886d15fe.jpg",
    theme: "Magical Lake Reflection Illumination & Classical Sabeki Idol",
    lat: 22.5744,
    lng: 88.3629,
    metro: "Central / MG Road",
    award: true
  },
  {
    id: 5,
    name: "Dum Dum Park Tarun Dal",
    bengaliName: "দমদম পার্ক তরুণ দল",
    zone: "North-East Kolkata",
    locality: "Dum Dum Park",
    image: "https://pandalgo.in/storage/uploads/pandals/hero/bb46f5b2-7a91-449b-91d5-164f1ec1b402.jpg",
    theme: "Contemporary Kinetic Art & Thought-Provoking Conceptual Design",
    lat: 22.6072,
    lng: 88.4069,
    metro: "Belgachia / Dum Dum",
    award: true
  },
  {
    id: 6,
    name: "Sreebhumi Sporting Club",
    bengaliName: "শ্রীভূমি স্পোর্টিং ক্লাব",
    zone: "North-East Kolkata",
    locality: "Lake Town / VIP Road",
    image: "https://pandalgo.in/storage/uploads/pandals/hero/813ac693-d5ee-4eb2-ae5f-6e67ce6a317f.jpg",
    theme: "Grand Royal Temple Replica & Diamond Chandelier Lighting",
    lat: 22.6012,
    lng: 88.3976,
    metro: "Ultadanga / Belgachia",
    award: true
  }
];

export default function HeroCarousel({ userLocation, onSelectPandal, onNavigateToPandals }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = FEATURED_SLIDES[currentSlide];

  // Navigation URL for the active slide
  const navUrl = userLocation?.lat && userLocation?.lng
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${slide.lat},${slide.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${slide.lat},${slide.lng}`;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);

  return (
    <div className="relative w-full h-[380px] sm:h-[500px] md:h-[620px] bg-black overflow-hidden group">
      
      {/* Background Slides with Cross-Fade */}
      {FEATURED_SLIDES.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getDurgaFace(item.id);
            }}
            className="w-full h-full object-cover object-center transform transition duration-10000 hover:scale-105"
          />
          {/* Dark Festive Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B080D] via-[#0B080D]/40 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B080D]/80 via-transparent to-black/50 pointer-events-none" />
        </div>
      ))}

      {/* Slide Content Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-12 sm:pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          
          {/* Top Tag & Season Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold backdrop-blur-md shadow-lg flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Tonight's Spotlight</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 text-amber-300 border border-amber-500/30 text-xs font-semibold backdrop-blur-md">
              📍 {slide.zone} · {slide.locality}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 text-slate-300 border border-white/10 text-xs backdrop-blur-md">
              🚊 Metro: {slide.metro}
            </span>
          </div>

          {/* Title & Bengali Script */}
          <div>
            <h2 className="font-heritage text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {slide.name}
            </h2>
            <p className="font-bengali text-base sm:text-xl font-bold text-amber-400 mt-1">
              {slide.bengaliName}
            </p>
          </div>

          {/* Theme Description */}
          <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 max-w-2xl font-sans drop-shadow">
            ✨ {slide.theme}
          </p>

          {/* Call to Actions for the slide */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Navigate with Google Maps</span>
            </a>

            <button
              onClick={onNavigateToPandals}
              className="py-3 px-5 rounded-2xl bg-black/60 hover:bg-black/80 text-amber-300 font-semibold text-xs sm:text-sm border border-amber-500/40 backdrop-blur-md transition flex items-center space-x-1.5"
            >
              <span>Explore 541+ Pandals</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>

      {/* Manual Previous / Next Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition opacity-0 group-hover:opacity-100"
        title="Previous Pandal"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition opacity-0 group-hover:opacity-100"
        title="Next Pandal"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Thumbnails / Dot Indicators Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2">
        {FEATURED_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === i 
                ? "w-8 h-2.5 bg-gradient-to-r from-amber-400 to-rose-500" 
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
