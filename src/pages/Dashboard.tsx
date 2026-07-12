import { useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { MetricGrid } from "../components/MetricGrid";
import { InsightBanner } from "../components/InsightBanner";
import type { Ride } from "../services/sheetService";
import { ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface DashboardProps {
  rides: Ride[];
  batteryCapacity: number;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  rides,
  batteryCapacity,
  isDarkMode
}) => {
  // Aggregate calculations
  const totalDistance = rides.reduce((acc, r) => acc + r.distance, 0);
  const totalRides = rides.length;
  
  const avgEstimatedRange = totalRides > 0 
    ? Math.round(rides.reduce((acc, r) => acc + r.estimatedFullRange, 0) / totalRides)
    : 389; // Default requested sample

  const avgKmPerBatteryPercent = totalRides > 0
    ? Number((rides.reduce((acc, r) => acc + r.kmPerBattery, 0) / totalRides).toFixed(2))
    : 3.89;

  const avgBatteryConsumption = totalRides > 0
    ? Number((rides.reduce((acc, r) => acc + r.batteryUsed, 0) / totalRides).toFixed(1))
    : 15.6;

  const avgDistancePerRide = totalRides > 0
    ? Number((totalDistance / totalRides).toFixed(1))
    : 45.2;

  const lifetimeEfficiency = totalRides > 0
    ? Number((rides.reduce((acc, r) => acc + (r.distance / ((r.batteryUsed / 100) * batteryCapacity)), 0) / totalRides).toFixed(2))
    : 7.21; // km/kWh

  // Personal Best Range
  const personalBestRange = totalRides > 0
    ? Math.max(...rides.map((r) => r.estimatedFullRange))
    : 420;

  const pbRide = rides.find((r) => r.estimatedFullRange === personalBestRange);
  const pbDate = pbRide ? pbRide.date : new Date().toISOString().split("T")[0];

  // Recent Ride
  const recentRide: Ride = totalRides > 0
    ? rides[rides.length - 1]
    : {
        date: new Date().toISOString().split("T")[0],
        startOdo: 1000,
        endOdo: 1045,
        distance: 45,
        startBattery: 98,
        endBattery: 86,
        batteryUsed: 12,
        startRange: 410,
        endRange: 360,
        estimatedFullRange: 418,
        kmPerBattery: 3.75,
        consumptionRate: 26.7
      };

  // Launch celebration confetti when personal best loads or matches
  useEffect(() => {
    if (totalRides > 0 && rides[rides.length - 1].estimatedFullRange >= personalBestRange) {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [rides, personalBestRange, totalRides]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Premium Hero Parallax Banner */}
      <div className="relative rounded-3xl overflow-hidden h-72 md:h-96 shadow-2xl flex items-end">
        {/* Parallax Image container */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out hover:scale-105"
          style={{ backgroundImage: `url('./windsor_ev.jpg')` }}
        />
        {/* Tesla-style linear gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Glass card banner */}
        <div className="relative p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full uppercase">
              MG Windsor EV PRO
            </span>
            <h2 className="font-heading font-black text-4xl md:text-5xl text-white tracking-tight drop-shadow-lg">
              TravelWithNani <span className="font-normal text-slate-300">Garage</span>
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-md drop-shadow-md">
              A premium digital logbook tracking charge status, odometer analytics, and real-time range insights.
            </p>
          </div>
          <div className="glass-panel border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 w-fit">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Battery Specs</p>
              <p className="text-sm font-semibold text-white">{batteryCapacity} kWh LFP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart EV Insight Analyser Banner */}
      <InsightBanner
        rides={rides}
        personalBestRange={personalBestRange}
        isDarkMode={isDarkMode}
      />

      {/* Main Core 3 Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* ⭐ Hero Card: Lifetime Avg Range */}
        <StatCard
          title="Average Estimated Range"
          value={avgEstimatedRange}
          suffix="km"
          description="Calculated based on all logged EV journeys to date."
          isHero
          isDarkMode={isDarkMode}
        />

        {/* 🚗 Recent Ride */}
        <div className={`p-8 rounded-3xl border flex flex-col justify-between shadow-2xl lg:col-span-2 ${
          isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
        }`}>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Recent Ride
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Logged: {recentRide.date}</p>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Est. Range</p>
                <p className="text-xl font-heading font-black text-emerald-400">
                  {recentRide.endRange} <span className="text-xs font-normal">km</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Distance</p>
                <p className="text-xl font-heading font-black text-blue-400">
                  {recentRide.distance} <span className="text-xs font-normal">km</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Batt Used</p>
                <p className="text-xl font-heading font-black text-indigo-400">
                  {recentRide.batteryUsed} <span className="text-xs font-normal">%</span>
                </p>
              </div>
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t text-xs ${isDarkMode ? "border-white/5 text-slate-400" : "border-slate-100 text-slate-600"}`}>
            Efficiency: <span className="font-semibold text-emerald-400">{recentRide.kmPerBattery.toFixed(2)} km</span> per battery percentage.
          </div>
        </div>

        {/* 🏆 Personal Best */}
        <StatCard
          title="Personal Best"
          value={personalBestRange}
          suffix="km"
          description={`Highest estimated range achieved over ${pbRide ? pbRide.distance : 0} km driven.`}
          isPB
          pbDate={pbDate}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Secondary Metrics Counters */}
      <div className="space-y-2">
        <h4 className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Efficiency & Cumulative Log Analytics
        </h4>
        <MetricGrid
          totalDistance={totalDistance}
          totalRides={totalRides}
          avgKmPerBatteryPercent={avgKmPerBatteryPercent}
          avgBatteryConsumption={avgBatteryConsumption}
          avgDistancePerRide={avgDistancePerRide}
          lifetimeEfficiency={lifetimeEfficiency}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
