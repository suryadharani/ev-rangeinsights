import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import type { Ride } from "../services/sheetService";
import { TrendingUp, Bolt, Map as MapIcon, CalendarRange } from "lucide-react";

interface AnalyticsProps {
  rides: Ride[];
  isDarkMode: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ rides, isDarkMode }) => {
  // If there are no rides, render a fallback message or sample data
  const hasRides = rides.length > 0;
  
  // Format data for trends
  const chartData = hasRides
    ? rides.map((r, i) => ({
        index: i + 1,
        date: r.date,
        range: r.estimatedFullRange,
        consumption: r.consumptionRate,
        distance: r.distance,
        batteryUsed: r.batteryUsed
      }))
    : [
        { index: 1, date: "07-01", range: 380, consumption: 25.0, distance: 40, batteryUsed: 10 },
        { index: 2, date: "07-03", range: 395, consumption: 23.5, distance: 60, batteryUsed: 15 },
        { index: 3, date: "07-05", range: 410, consumption: 21.0, distance: 30, batteryUsed: 7 },
        { index: 4, date: "07-08", range: 389, consumption: 24.2, distance: 55, batteryUsed: 14 }
      ];

  // Group by Month to show Monthly Average Estimated Range
  const monthlyRangeData: { month: string; avgRange: number }[] = [];
  if (hasRides) {
    const monthMap = new Map<string, number[]>();
    rides.forEach(r => {
      const monthKey = r.date.substring(0, 7); // YYYY-MM
      const vals = monthMap.get(monthKey) || [];
      vals.push(r.estimatedFullRange);
      monthMap.set(monthKey, vals);
    });
    
    monthMap.forEach((vals, month) => {
      const avg = Math.round(vals.reduce((acc: number, v: number) => acc + v, 0) / vals.length);
      monthlyRangeData.push({ month, avgRange: avg });
    });
    // Sort chronologically
    monthlyRangeData.sort((a, b) => a.month.localeCompare(b.month));
  } else {
    monthlyRangeData.push({ month: "2026-06", avgRange: 385 });
    monthlyRangeData.push({ month: "2026-07", avgRange: 399 });
  }

  // Custom tooltips for premium feel
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-xl border shadow-xl backdrop-blur-md ${
          isDarkMode ? "bg-slate-950/90 border-white/10 text-white" : "bg-white/90 border-slate-200 text-slate-800"
        }`}>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">{label}</p>
          {payload.map((pld: any, idx: number) => (
            <p key={idx} className="text-xs font-semibold" style={{ color: pld.color }}>
              {pld.name}: {pld.value} {pld.unit || ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-heading font-black text-3xl tracking-tight">
          EV Performance Analytics
        </h2>
        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Deep-dive efficiency curves, ranges, and consumption variables.
        </p>
      </div>

      {!hasRides && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium text-center">
          Notice: No ride data loaded yet. Displaying sample simulation data curves.
        </div>
      )}

      {/* Grid containing 4 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Estimated Range Trend */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
        }`}>
          <h3 className="font-heading font-bold text-sm mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Estimated Full Range Trend
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rangeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="date" stroke={isDarkMode ? "#555" : "#999"} fontSize={10} />
                <YAxis stroke={isDarkMode ? "#555" : "#999"} fontSize={10} domain={[300, 480]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="range" stroke="#10b981" fillOpacity={1} fill="url(#rangeGlow)" name="Full Est. Range" unit="km" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Battery Consumption Trend */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
        }`}>
          <h3 className="font-heading font-bold text-sm mb-6 flex items-center gap-2">
            <Bolt className="w-4 h-4 text-blue-400" />
            Battery Consumption Trend
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="date" stroke={isDarkMode ? "#555" : "#999"} fontSize={10} />
                <YAxis stroke={isDarkMode ? "#555" : "#999"} fontSize={10} domain={[10, 35]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" name="Consumption" unit="% / 100km" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distance Trend */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
        }`}>
          <h3 className="font-heading font-bold text-sm mb-6 flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-indigo-400" />
            Odometer Distance Distributions
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="date" stroke={isDarkMode ? "#555" : "#999"} fontSize={10} />
                <YAxis stroke={isDarkMode ? "#555" : "#999"} fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="distance" fill="#6366f1" name="Distance Driven" unit="km" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Average Estimated Range */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
        }`}>
          <h3 className="font-heading font-bold text-sm mb-6 flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-yellow-400" />
            Monthly Average Estimated Range
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRangeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="month" stroke={isDarkMode ? "#555" : "#999"} fontSize={10} />
                <YAxis stroke={isDarkMode ? "#555" : "#999"} fontSize={10} domain={[300, 480]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgRange" fill="#eab308" name="Avg Monthly Range" unit="km" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
