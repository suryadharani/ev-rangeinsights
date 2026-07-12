import { CheckCircle2, Award, Star, Compass } from "lucide-react";
import type { Ride } from "../services/sheetService";

interface TimelineProps {
  rides: Ride[];
  totalDistance: number;
  personalBestRange: number;
  bestEfficiency: number;
  isDarkMode: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  rides,
  totalDistance,
  personalBestRange,
  bestEfficiency,
  isDarkMode
}) => {
  // Define milestones
  const milestones = [
    {
      id: "first_ride",
      label: "First Ride Logged",
      desc: "Starting the journey on the MG Windsor EV PRO.",
      icon: Compass,
      achieved: rides.length > 0,
      detail: rides.length > 0 ? `Logged: ${rides[0].date}` : "Pending first log"
    },
    {
      id: "personal_best",
      label: "Personal Best Range",
      desc: `Reached an estimated range of ${personalBestRange} km.`,
      icon: Star,
      achieved: personalBestRange > 0,
      detail: personalBestRange > 0 ? `${personalBestRange} km range` : "Pending log"
    },
    {
      id: "best_efficiency",
      label: "Best Efficiency Logged",
      desc: `Reached maximum driving economy of ${bestEfficiency} km/kWh.`,
      icon: Award,
      achieved: bestEfficiency > 0,
      detail: bestEfficiency > 0 ? `${bestEfficiency.toFixed(2)} km/kWh` : "Pending log"
    },
    {
      id: "milestone_10k",
      label: "10,000 km Mileage",
      desc: "Crossed the 10,000 km digital odometer threshold.",
      icon: CheckCircle2,
      achieved: totalDistance >= 10000,
      detail: totalDistance >= 10000 ? "Achieved" : `Progress: ${totalDistance.toLocaleString()} / 10,000 km`
    },
    {
      id: "milestone_20k",
      label: "20,000 km Mileage",
      desc: "Reached the 20,000 km double-decamile landmark.",
      icon: CheckCircle2,
      achieved: totalDistance >= 20000,
      detail: totalDistance >= 20000 ? "Achieved" : `Progress: ${totalDistance.toLocaleString()} / 20,000 km`
    },
    {
      id: "milestone_50k",
      label: "50,000 km Mileage",
      desc: "Halfway to the 100k milestone! Massive battery longevity check.",
      icon: CheckCircle2,
      achieved: totalDistance >= 50000,
      detail: totalDistance >= 50000 ? "Achieved" : `Progress: ${totalDistance.toLocaleString()} / 50,000 km`
    }
  ];

  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 ${
      isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
    }`}>
      <h3 className="font-heading font-bold text-lg mb-8 flex items-center gap-2">
        <Award className="w-5 h-5 text-emerald-400" />
        Ownership visual Journey
      </h3>

      <div className="relative pl-8 md:pl-10 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-slate-700">
        {milestones.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="relative group">
              {/* Dot indicator */}
              <div className={`absolute -left-8 md:-left-10 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                m.achieved
                  ? isDarkMode
                    ? "bg-slate-900 border-emerald-400 text-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-white border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/10"
                  : isDarkMode
                  ? "bg-slate-950 border-slate-800 text-slate-600"
                  : "bg-slate-100 border-slate-300 text-slate-400"
              }`}>
                {m.achieved ? (
                  <Icon className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>

              {/* Box Details */}
              <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                m.achieved
                  ? isDarkMode
                    ? "bg-white/[0.01] border-white/5 group-hover:bg-white/[0.02]"
                    : "bg-slate-50 border-slate-100 group-hover:bg-slate-100/50"
                  : isDarkMode
                  ? "bg-transparent border-transparent opacity-50"
                  : "bg-transparent border-transparent opacity-60"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h4 className={`font-heading font-bold text-sm ${m.achieved ? (isDarkMode ? "text-white" : "text-slate-800") : "text-slate-500"}`}>
                    {m.label}
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block w-fit ${
                    m.achieved
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                      : isDarkMode
                      ? "bg-white/5 text-slate-500"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {m.detail}
                  </span>
                </div>
                <p className={`text-xs mt-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {m.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
