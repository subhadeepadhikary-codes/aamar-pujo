import React from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== "undefined") {
      window.location.hash = "";
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#140E1B] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>

            <h3 className="font-heritage text-xl sm:text-2xl font-bold text-white mb-1">
              Something went wrong
            </h3>
            <p className="font-bengali text-sm text-rose-300/80 mb-3">
              মানচিত্র বা রুট লোড করতে সমস্যা হয়েছে
            </p>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              We encountered an issue rendering this section. Don't worry, your saved itineraries are safe!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Section</span>
              </button>

              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("aamar_pujo_last_page");
                    window.location.hash = "";
                    window.location.href = "/";
                  } catch {
                    window.location.href = "/";
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer border border-white/10"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
