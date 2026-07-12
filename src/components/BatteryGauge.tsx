import React from "react";
import { motion } from "framer-motion";
import { BatteryCharging, ShieldCheck } from "lucide-react";

interface BatteryGaugeProps {
  currentBattery: number;
  batteryCapacity: number;
  isDarkMode: boolean;
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  currentBattery,
  batteryCapacity,
  isDarkMode
}) => {
  // Normalize value between 0 and 100
  const pct = Math.min(Math.max(currentBattery, 0), 100);
  
  // Calculate energy left in kWh
  const energyLeft = ((pct / 100) * batteryCapacity).toFixed(1);

  // Determine battery color based on state of charge
  const getBatteryColor = (level: number) => {
    if (level > 40) return "from-emerald-500 to-teal-400";
    if (level > 15) return "from-amber-500 to-yellow-400";
    return "from-rose-500 to-orange-400";
  };

  const getGlowColor = (level: number) => {
    if (level > 40) return "shadow-emerald-500/20";
    if (level > 15) return "shadow-amber-500/20";
    return "shadow-rose-500/20";
  };

  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 ${
      isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
    }`}>
      <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
        <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" />
        Battery Status
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-8 justify-around">
        {/* Animated Glass Battery Cylinder */}
        <div className="relative w-36 h-60 rounded-3xl border-2 border-slate-500/30 p-2 flex items-end justify-center bg-slate-900/10 backdrop-blur-sm overflow-hidden shadow-inner">
          {/* Battery cap */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-500/40 rounded-t-md" />
          
          {/* Filled energy bar */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`w-full rounded-2xl bg-gradient-to-t relative ${getBatteryColor(pct)} ${getGlowColor(pct)} shadow-lg`}
          >
            {/* Animated charging glow wave */}
            <div className="battery-charging-glow rounded-2xl" />
          </motion.div>

          {/* Value overlay inside cylinder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading font-black text-4xl text-white drop-shadow-md">
              {pct}%
            </span>
            <span className="text-[10px] text-white/80 font-mono tracking-widest drop-shadow-sm uppercase">
              Remaining
            </span>
          </div>
        </div>

        {/* Battery Technical Details */}
        <div className="flex-1 space-y-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
              Active State of Charge (SoC)
            </p>
          </div>
          
          <div className="space-y-1">
            <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Energy Left</p>
            <p className="text-2xl font-heading font-extrabold">
              {energyLeft} <span className="text-xs font-normal text-slate-500">kWh</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Capacity</p>
            <p className="text-xl font-heading font-bold">
              {batteryCapacity} <span className="text-xs font-normal text-slate-500">kWh</span>
            </p>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
          }`}>
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold">Active LFP Chemistry</h5>
              <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Windsor's safe Lithium Iron Phosphate battery manages over 2000 full charging cycles with minimal degradation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
