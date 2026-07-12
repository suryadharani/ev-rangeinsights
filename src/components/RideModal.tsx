import { useState } from "react";
import { X, Lock, KeyRound, Save, Plus } from "lucide-react";
import type { Ride } from "../services/sheetService";

interface RideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ride: Ride) => void;
  isDarkMode: boolean;
}

export const RideModal: React.FC<RideModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isDarkMode
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Input states
  const [rideDate, setRideDate] = useState(new Date().toISOString().split("T")[0]);
  const [startOdo, setStartOdo] = useState("");
  const [endOdo, setEndOdo] = useState("");
  const [startBattery, setStartBattery] = useState("");
  const [endBattery, setEndBattery] = useState("");
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState("");

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "aachandraarka") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const odoStart = Number(startOdo);
    const odoEnd = Number(endOdo);
    const battStart = Number(startBattery);
    const battEnd = Number(endBattery);
    const rangeStart = Number(startRange);
    const rangeEnd = Number(endRange);

    // Validation checks
    if (!startOdo || !endOdo || !startBattery || !endBattery || !startRange || !endRange) {
      setValidationError("All readings must be filled.");
      return;
    }
    if (odoEnd <= odoStart) {
      setValidationError("End Odometer must be greater than Start Odometer.");
      return;
    }
    if (battEnd >= battStart) {
      setValidationError("End Battery % must be less than Start Battery % (no charging during log).");
      return;
    }
    if (battStart > 100 || battEnd < 0) {
      setValidationError("Battery % must be between 0% and 100%.");
      return;
    }
    if (rangeEnd >= rangeStart) {
      setValidationError("End Estimated Range must be less than Start Estimated Range.");
      return;
    }
    setValidationError("");

    // Calculate metrics
    const distanceDriven = odoEnd - odoStart;
    const batteryUsedPercent = battStart - battEnd;
    
    // km per Battery %
    const kmPerBattery = Number((distanceDriven / batteryUsedPercent).toFixed(2));
    
    // Battery Consumption Rate (% used per 100km)
    const consumptionRate = Number(((batteryUsedPercent / distanceDriven) * 100).toFixed(1));
    
    // Estimated Full Range (Based on start range divided by start state of charge)
    const estimatedFullRange = Math.round(rangeStart / (battStart / 100));

    const newRide: Ride = {
      date: rideDate,
      startOdo: odoStart,
      endOdo: odoEnd,
      distance: distanceDriven,
      startBattery: battStart,
      endBattery: battEnd,
      batteryUsed: batteryUsedPercent,
      startRange: rangeStart,
      endRange: rangeEnd,
      estimatedFullRange,
      kmPerBattery,
      consumptionRate,
      notes
    };

    onSave(newRide);
    // Reset forms & close
    setStartOdo("");
    setEndOdo("");
    setStartBattery("");
    setEndBattery("");
    setStartRange("");
    setEndRange("");
    setNotes("");
    setIsAuthenticated(false);
    setPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`relative w-full max-w-lg rounded-3xl p-8 border shadow-2xl transition-all duration-300 ${
        isDarkMode ? "glass-panel border-white/10" : "glass-panel-light border-slate-200"
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full border transition-all ${
            isDarkMode ? "border-white/5 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {!isAuthenticated ? (
          /* Password Authentication Gate */
          <div className="py-6 text-center">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-6 ${
              isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-600/10 text-emerald-600"
            }`}>
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-heading font-black text-2xl tracking-tight mb-2">
              Security Clearance
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Enter security key to access ride logging.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Security Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border font-medium transition-all outline-none ${
                    isDarkMode
                      ? "bg-black/40 border-white/10 focus:border-emerald-500/50 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                  }`}
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-rose-500 text-xs font-medium text-left px-2">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Ride Data Entry Form */
          <div>
            <h3 className="font-heading font-black text-2xl tracking-tight mb-6 flex items-center gap-3">
              <Plus className="w-6 h-6 text-emerald-400" />
              Log Ride Analytics
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Ride Date
                </label>
                <input
                  type="date"
                  value={rideDate}
                  onChange={(e) => setRideDate(e.target.value)}
                  className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                    isDarkMode
                      ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                  }`}
                />
              </div>

              {/* Odometer Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Start Odometer (km)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={startOdo}
                    onChange={(e) => setStartOdo(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      isDarkMode
                        ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    End Odometer (km)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1150"
                    value={endOdo}
                    onChange={(e) => setEndOdo(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      isDarkMode
                        ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              {/* Battery Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Start Battery %
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 98"
                    value={startBattery}
                    onChange={(e) => setStartBattery(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      isDarkMode
                        ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    End Battery %
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={endBattery}
                    onChange={(e) => setEndBattery(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      isDarkMode
                        ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              {/* Estimated Range Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Start Range (km)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 420"
                    value={startRange}
                    onChange={(e) => setStartRange(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      isDarkMode
                        ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    End Range (km)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 260"
                    value={endRange}
                    onChange={(e) => setEndRange(e.target.value)}
                    className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none ${
                      isDarkMode
                        ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              {/* Ride Notes */}
              <div>
                <label className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Notes / Observations
                </label>
                <textarea
                  placeholder="e.g. Highway trip, dense traffic, dynamic AC usage..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border transition-all outline-none resize-none ${
                    isDarkMode
                      ? "bg-black/40 border-white/10 focus:border-emerald-500 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-800"
                  }`}
                />
              </div>

              {validationError && (
                <p className="text-rose-500 text-xs font-semibold">{validationError}</p>
              )}

              {/* Save Controls */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                Commit Ride Log
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
