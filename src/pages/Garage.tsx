import { BatteryGauge } from "../components/BatteryGauge";
import { Timeline } from "../components/Timeline";
import type { Ride } from "../services/sheetService";
import { Shield, Compass, Gauge, Cpu } from "lucide-react";

interface GarageProps {
  rides: Ride[];
  vehicleName: string;
  batteryCapacity: number;
  ownerName: string;
  isDarkMode: boolean;
}

export const Garage: React.FC<GarageProps> = ({
  rides,
  vehicleName,
  batteryCapacity,
  ownerName,
  isDarkMode
}) => {
  // Aggregate stats
  const totalDistance = rides.reduce((acc, r) => acc + r.distance, 0);
  const totalRides = rides.length;
  


  const personalBestRange = totalRides > 0
    ? Math.max(...rides.map((r) => r.estimatedFullRange))
    : 420;

  const bestEfficiency = totalRides > 0
    ? Math.max(...rides.map((r) => r.distance / ((r.batteryUsed / 100) * batteryCapacity)))
    : 7.8;

  const recentRide: Ride = totalRides > 0
    ? rides[rides.length - 1]
    : {
        date: new Date().toISOString().split("T")[0],
        startOdo: 0,
        endOdo: 0,
        distance: 0,
        startBattery: 100,
        endBattery: 100,
        batteryUsed: 0,
        startRange: 0,
        endRange: 0,
        estimatedFullRange: 0,
        kmPerBattery: 0,
        consumptionRate: 0
      };

  const specs = [
    { label: "Make & Model", value: vehicleName, icon: Cpu },
    { label: "Battery Chemistry", value: "Lithium Iron Phosphate (LFP)", icon: Shield },
    { label: "Drive Configuration", value: "Front-Wheel Drive (FWD)", icon: Compass },
    { label: "Motor Power", value: "136 PS (100 kW)", icon: Gauge },
    { label: "Peak Torque", value: "200 Nm", icon: Cpu }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="font-heading font-black text-3xl tracking-tight">
          Digital Garage
        </h2>
        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Managing and monitoring specs for {ownerName}'s Windsor EV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specs and Garage Image */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card: Vehicle Portrait */}
          <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
            isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"
          }`}>
            <img 
              src="./windsor_ev.jpg" 
              alt={vehicleName}
              className="w-full h-80 object-cover object-center transition-transform hover:scale-102 duration-500"
            />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl">
              <span className="text-xs font-bold text-emerald-400">ACTIVE STATUS: PARKED & SYNCED</span>
            </div>
            
            {/* Specs Overlay */}
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 border-t border-white/5">
              {specs.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                        {spec.label}
                      </p>
                      <p className={`text-sm font-semibold mt-0.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        {spec.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Animated Battery Gauge Panel */}
          <BatteryGauge
            currentBattery={recentRide.endBattery}
            batteryCapacity={batteryCapacity}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Column: Milestones Timeline */}
        <div className="space-y-8">
          <Timeline
            rides={rides}
            totalDistance={totalDistance}
            personalBestRange={personalBestRange}
            bestEfficiency={bestEfficiency}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};
