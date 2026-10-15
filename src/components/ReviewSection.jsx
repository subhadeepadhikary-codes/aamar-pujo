import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  Star, 
  Send, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  ThumbsUp, 
  Heart, 
  Flame 
} from "lucide-react";

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Anirban Mukherjee",
    tag: "South Kolkata Local",
    rating: 5,
    date: "2 hours ago",
    comment: "This is a lifesaver! Usually I get stuck at Rashbehari crossing every Ashtami night. The Google Maps routing directly to Chetla and Mudiali entry gates saved us hours of wandering.",
    helpful: 28
  },
  {
    id: 2,
    name: "Pooja Banerjee",
    tag: "First-time Kolkata Hopper",
    rating: 5,
    date: "5 hours ago",
    comment: "I moved to Kolkata for college and was completely clueless about how to navigate pandals without getting lost in police one-ways. Aamar Pujo made our night hop effortless. The Mahalaya radio audio is pure magic!",
    helpful: 41
  },
  {
    id: 3,
    name: "Sourav Ganguly (Hooghly)",
    tag: "Suburban Devotee",
    rating: 5,
    date: "Yesterday",
    comment: "The pipeline countdown from Prothoma to Dashami is brilliant. Finally a clean website that lists all 541+ pandals instead of just the top 5 sponsored ones. Subhadeep da, darun kaaj!",
    helpful: 19
  }
];

export default function ReviewSection() {
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("aamar_pujo_reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("Pujo Hopper");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem("aamar_pujo_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || !name.trim()) return;

    const newRev = {
      id: Date.now(),
      name: name.trim(),
      tag: tag.trim() || "Pujo Enthusiast",
      rating,
      date: "Just now",
      comment: comment.trim(),
      helpful: 1
    };

    setReviews([newRev, ...reviews]);
    setName("");
    setComment("");
    setSubmitted(true);

    // Trigger joyful celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#F59E0B", "#E11D48", "#FCD34D", "#3B82F6"]
      });
    } catch (e) {}

    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleHelpful = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  return (
    <section id="reviews" className="py-16 md:py-24 bg-[#08050B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Community Feedback & Hopper Voices</span>
          </div>
          <h2 className="font-heritage text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
            Review <span className="text-gold-gradient">Aamar Pujo</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            How was your experience exploring Bengal's pandals with us? Share your review and suggestions!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Review Submission Form */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-2xl relative">
            
            <h3 className="font-heritage text-xl sm:text-2xl font-extrabold text-white mb-2">
              Leave a Review
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Your feedback helps Subhadeep and the community keep routes and crowd tips accurate!
            </p>

            {submitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>ধন্যবাদ! Your review has been published to the community board.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? "text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-amber-300 font-bold ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ritwik Sen"
                  className="w-full py-2.5 px-3.5 bg-[#140E1B] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              {/* Hopper Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hopping Category
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#140E1B] border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/50"
                >
                  <option value="Kolkata Local Hopper">Kolkata Local Hopper</option>
                  <option value="First-time Visitor">First-time Visitor / Tourist</option>
                  <option value="North Kolkata Fanatic">North Kolkata Fanatic</option>
                  <option value="South Kolkata Explorer">South Kolkata Explorer</option>
                  <option value="College Student">College Student / Friends Group</option>
                  <option value="Family Hopper">Family Hopper</option>
                </select>
              </div>

              {/* Review Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Review & Experience
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked (Map navigation, audio player, pandal lists, or suggestions)..."
                  className="w-full py-2.5 px-3.5 bg-[#140E1B] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/50 resize-none"
                />
              </div>

              {/* Quick Feedback Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "📍 Accurate GPS Routing",
                  "🎵 Loved Mahalaya Audio",
                  "🏛️ Great 541+ Pandals List",
                  "🚊 Useful Metro Timings"
                ].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setComment((prev) => (prev ? `${prev} ${chip}` : chip))}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>Submit Website Review</span>
              </button>

            </form>

          </div>

          {/* Right: Live Community Review Feed */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Latest Community Reviews</span>
              </div>
              <span className="text-xs text-slate-400">
                {reviews.length} Total Reviews
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-amber-400/20 transition duration-300 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {rev.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {rev.tag}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? "text-amber-400 fill-current"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                        <span className="text-[11px] text-slate-400 ml-2">
                          {rev.date}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleHelpful(rev.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 text-[11px] transition"
                      title="Helpful Review"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{rev.helpful}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
