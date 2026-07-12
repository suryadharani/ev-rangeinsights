import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Navigation, Calendar, Zap, Compass, Activity, Bolt } from "lucide-react";

interface MetricGridProps {
  totalDistance: number;
  totalRides: number;
  avgKmPerBatteryPercent: number;
  avgBatteryConsumption: number; // e.g. Battery % used per ride
  avgDistancePerRide: number;
  lifetimeEfficiency: number; // km per kWh
  isDarkMode: boolean;
}

interface MiniMetricProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: React.ComponentType<any>;
  isDarkMode: boolean;
}

const MiniMetric: React.FC<MiniMetricProps> = ({
  label,
  value,
  suffix = "",
  decimals = 0,
  icon: Icon,
  isDarkMode
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: "easeOut"
    });
    return () => controls.stop();
  }, [value, count]);

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${
      isDarkMode 
        ? "glass-panel border-white/5 hover:bg-white/[0.03]" 
        : "glass-panel-light border-slate-200 hover:bg-slate-50"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </span>
        <Icon className={`w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
      </div>
      <h4 className="font-heading font-extrabold text-2xl tracking-tight">
        <motion.span>{rounded}</motion.span>
        <span className={`text-xs font-normal ml-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
          {suffix}
        </span>
      </h4>
    </div>
  );
};

export const MetricGrid: React.FC<MetricGridProps> = ({
  totalDistance,
  totalRides,
  avgKmPerBatteryPercent,
  avgBatteryConsumption,
  avgDistancePerRide,
  lifetimeEfficiency,
  isDarkMode
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
      <MiniMetric
        label="Total Distance"
        value={totalDistance}
        suffix="km"
        icon={Navigation}
        isDarkMode={isDarkMode}
      />
      <MiniMetric
        label="Total Rides"
        value={totalRides}
        suffix="rides"
        icon={Calendar}
        isDarkMode={isDarkMode}
      />
      <MiniMetric
        label="Avg km / %"
        value={avgKmPerBatteryPercent}
        suffix="km/%"
        decimals={2}
        icon={Zap}
        isDarkMode={isDarkMode}
      />
      <MiniMetric
        label="Avg Consumption"
        value={avgBatteryConsumption}
        suffix="%"
        decimals={1}
        icon={Activity}
        isDarkMode={isDarkMode}
      />
      <MiniMetric
        label="Avg Dist / Ride"
        value={avgDistancePerRide}
        suffix="km"
        decimals={1}
        icon={Compass}
        isDarkMode={isDarkMode}
      />
      <MiniMetric
        label="Lifetime Efficiency"
        value={lifetimeEfficiency}
        suffix="km/kWh"
        decimals={2}
        icon={Bolt}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
