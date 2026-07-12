import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Ride } from "../services/sheetService";

interface InsightBannerProps {
  rides: Ride[];
  personalBestRange: number;
  isDarkMode: boolean;
}

export const InsightBanner: React.FC<InsightBannerProps> = ({
  rides,
  personalBestRange,
  isDarkMode
}) => {
  const [insightIndex, setInsightIndex] = useState(0);
  const [insights, setInsights] = useState<string[]>([
    "Dashboard loaded. Welcome to your virtual garage."
  ]);

  useEffect(() => {
    if (rides.length === 0) return;

    const list: string[] = [];

    // Insight 1: Proximity to Personal Best
    const lastRide = rides[rides.length - 1];
    if (personalBestRange > 0 && lastRide.endRange > 0) {
      const diff = personalBestRange - lastRide.endRange;
      if (diff > 0) {
        list.push(`You are only ${diff} km away from matching your Personal Best Range of ${personalBestRange} km.`);
      } else if (diff === 0) {
        list.push(`Your recent ride matched your all-time Personal Best Range of ${personalBestRange} km!`);
      }
    }

    // Insight 2: Recent Month Range Efficiency Growth
    if (rides.length >= 5) {
      const recentRides = rides.slice(-3);
      const olderRides = rides.slice(-6, -3);
      const recentAvg = recentRides.reduce((acc, r) => acc + r.estimatedFullRange, 0) / recentRides.length;
      const olderAvg = olderRides.reduce((acc, r) => acc + r.estimatedFullRange, 0) / olderRides.length;
      
      if (olderAvg > 0) {
        const growth = ((recentAvg - olderAvg) / olderAvg) * 100;
        if (growth > 0) {
          list.push(`Your average estimated full range improved by ${growth.toFixed(1)}% over your last few rides.`);
        } else if (growth < 0) {
          list.push(`Range efficiency is down by ${Math.abs(growth).toFixed(1)}%. Consider smoother accelerations to optimize battery consumption.`);
        }
      }
    }

    // Insight 3: Rarity/Rank of Last Ride
    if (rides.length >= 3) {
      const sortedRides = [...rides].sort((a, b) => b.estimatedFullRange - a.estimatedFullRange);
      const lastIndex = sortedRides.findIndex(r => r.startOdo === lastRide.startOdo && r.date === lastRide.date);
      if (lastIndex >= 0 && lastIndex < 3) {
        list.push(`Outstanding! Your last ride ranks #${lastIndex + 1} for range efficiency among all recorded rides.`);
      }
    }

    // Insight 4: Dynamic eco-tip
    list.push("Windsor Pro LFP Tip: Charging up to 100% weekly helps calibrate the battery management system (BMS) for precise range estimations.");
    list.push("Eco Driving Tip: Regenerative braking (KERS) on high settings recovers up to 15% of kinetic energy in stop-and-go city traffic.");

    setInsights(list);
  }, [rides, personalBestRange]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 8000); // Rotate every 8 seconds
    return () => clearInterval(interval);
  }, [insights]);

  return (
    <div className={`p-4 px-6 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
      isDarkMode 
        ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-300" 
        : "bg-emerald-50 border-emerald-100 text-emerald-800"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${isDarkMode ? "bg-emerald-500/10" : "bg-emerald-500/10"}`}>
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
        <p className="text-xs md:text-sm font-medium leading-relaxed">
          {insights[insightIndex]}
        </p>
      </div>
      <button
        onClick={() => setInsightIndex((prev) => (prev + 1) % insights.length)}
        className="shrink-0 p-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
      >
        <ArrowRight className="w-4 h-4 text-emerald-400" />
      </button>
    </div>
  );
};
