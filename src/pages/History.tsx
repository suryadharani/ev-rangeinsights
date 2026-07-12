import { useState } from "react";
import { Search, Trash2, Edit3, Bolt, Check, Compass } from "lucide-react";
import type { Ride } from "../services/sheetService";

interface HistoryProps {
  rides: Ride[];
  onDeleteRide: (startOdo: number) => void;
  onEditRide: (oldStartOdo: number, updatedRide: Ride) => void;
  isDarkMode: boolean;
}

export const History: React.FC<HistoryProps> = ({
  rides,
  onDeleteRide,
  onEditRide,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Edit State
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [originalStartOdo, setOriginalStartOdo] = useState<number | null>(null);
  const [editOdoStart, setEditOdoStart] = useState("");
  const [editOdoEnd, setEditOdoEnd] = useState("");
  const [editBattStart, setEditBattStart] = useState("");
  const [editBattEnd, setEditBattEnd] = useState("");
  const [editRangeStart, setEditRangeStart] = useState("");
  const [editRangeEnd, setEditRangeEnd] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Filtering Logic (Odometer or Notes)
  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(ride.startOdo).includes(searchTerm) ||
                          String(ride.endOdo).includes(searchTerm);
    return matchesSearch;
  });

  const handleEditClick = (ride: Ride) => {
    setEditingRide(ride);
    setOriginalStartOdo(ride.startOdo);
    setEditOdoStart(String(ride.startOdo));
    setEditOdoEnd(String(ride.endOdo));
    setEditBattStart(String(ride.startBattery));
    setEditBattEnd(String(ride.endBattery));
    setEditRangeStart(String(ride.startRange));
    setEditRangeEnd(String(ride.endRange));
    setEditNotes(ride.notes || "");
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRide || originalStartOdo === null) return;

    const startOdo = Number(editOdoStart);
    const endOdo = Number(editOdoEnd);
    const startBattery = Number(editBattStart);
    const fontEndBattery = Number(editBattEnd);
    const startRange = Number(editRangeStart);
    const endRange = Number(editRangeEnd);

    const distance = endOdo - startOdo;
    const batteryUsed = startBattery - fontEndBattery;
    const kmPerBattery = Number((distance / batteryUsed).toFixed(2));
    const consumptionRate = Number(((batteryUsed / distance) * 100).toFixed(1));
    const estimatedFullRange = Math.round(startRange / (startBattery / 100));

    const updatedRide: Ride = {
      date: editingRide.date, // Preserve date string under the hood
      startOdo,
      endOdo,
      distance,
      startBattery,
      endBattery: fontEndBattery,
      batteryUsed,
      startRange,
      endRange,
      estimatedFullRange,
      kmPerBattery,
      consumptionRate,
      notes: editNotes
    };

    onEditRide(originalStartOdo, updatedRide);
    setEditingRide(null);
    setOriginalStartOdo(null);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-heading font-black text-3xl tracking-tight">
          Ride History Logs
        </h2>
        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Inspect details of every logged trip, sorted sequentially by odometer mileage.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by notes or odometer reading (km)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
            isDarkMode 
              ? "bg-[#0f0f0f] border-white/5 focus:border-emerald-500/50 text-white" 
              : "bg-white border-slate-200 focus:border-emerald-600 text-slate-800"
          }`}
        />
      </div>

      {/* Ride Grid Display */}
      {filteredRides.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No rides logged or found matching search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map((ride, idx) => {
            // Find global index in sorted rides list
            const tripIndex = rides.indexOf(ride) + 1;
            
            return (
              <div
                key={`${ride.startOdo}_${idx}`}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:scale-101 ${
                  isDarkMode 
                    ? "glass-panel border-white/5 hover:border-emerald-500/20" 
                    : "glass-panel-light border-slate-200 hover:border-emerald-500/35"
                }`}
              >
                <div className="space-y-4">
                  {/* Trip header */}
                  <div className="flex items-center justify-between border-b pb-3 border-slate-500/10">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span className="font-heading font-black text-sm">Trip #{tripIndex}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(ride)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isDarkMode ? "border-white/5 hover:bg-white/10 text-slate-400 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-600"
                        }`}
                        title="Edit ride"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete Trip #${tripIndex}?`)) {
                            onDeleteRide(ride.startOdo);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all"
                        title="Delete ride"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Ride Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Distance Driven</p>
                      <p className="text-lg font-heading font-black text-white mix-blend-difference">
                        {ride.distance} <span className="text-xs font-normal">km</span>
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Est. Full Range</p>
                      <p className="text-lg font-heading font-black text-emerald-400">
                        {ride.estimatedFullRange} <span className="text-xs font-normal">km</span>
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Odometer Readings</p>
                      <p className={`text-xs font-mono font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                        {ride.startOdo} → {ride.endOdo}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Battery Spent</p>
                      <p className={`text-xs font-mono font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                        {ride.startBattery}% → {ride.endBattery}% ({ride.batteryUsed}%)
                      </p>
                    </div>
                  </div>

                  {/* Performance Rate */}
                  <div className={`p-3 rounded-xl flex items-center justify-between text-xs border ${
                    isDarkMode ? "bg-white/[0.01] border-white/5" : "bg-slate-50 border-slate-100"
                  }`}>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Bolt className="w-3.5 h-3.5 text-yellow-500" />
                      Km per % Battery:
                    </span>
                    <span className="font-bold text-emerald-400">{ride.kmPerBattery.toFixed(2)} km/%</span>
                  </div>
                </div>

                {/* Ride Notes */}
                {ride.notes && (
                  <div className="mt-4 pt-3 border-t border-slate-500/10">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Journey Notes</p>
                    <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      "{ride.notes}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editing Dialog Modal */}
      {editingRide && originalStartOdo !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${
            isDarkMode ? "glass-panel border-white/10" : "glass-panel-light border-slate-200"
          }`}>
            <h3 className="font-heading font-black text-xl mb-6">
              Edit Trip Details
            </h3>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Odometer</label>
                  <input
                    type="number"
                    value={editOdoStart}
                    onChange={(e) => setEditOdoStart(e.target.value)}
                    className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none text-sm ${
                      isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Odometer</label>
                  <input
                    type="number"
                    value={editOdoEnd}
                    onChange={(e) => setEditOdoEnd(e.target.value)}
                    className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none text-sm ${
                      isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Battery %</label>
                  <input
                    type="number"
                    value={editBattStart}
                    onChange={(e) => setEditBattStart(e.target.value)}
                    className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none text-sm ${
                      isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Battery %</label>
                  <input
                    type="number"
                    value={editBattEnd}
                    onChange={(e) => setEditBattEnd(e.target.value)}
                    className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none text-sm ${
                      isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Range</label>
                  <input
                    type="number"
                    value={editRangeStart}
                    onChange={(e) => setEditRangeStart(e.target.value)}
                    className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none text-sm ${
                      isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Range</label>
                  <input
                    type="number"
                    value={editRangeEnd}
                    onChange={(e) => setEditRangeEnd(e.target.value)}
                    className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none text-sm ${
                      isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className={`w-full mt-1.5 px-3 py-2 rounded-xl border outline-none resize-none text-sm ${
                    isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-500/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRide(null);
                    setOriginalStartOdo(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl border font-semibold text-xs transition-all ${
                    isDarkMode ? "border-white/5 hover:bg-white/5 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
