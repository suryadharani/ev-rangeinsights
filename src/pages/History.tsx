import { useState } from "react";
import { Search, Calendar, Trash2, Edit3, Bolt, ChevronDown, Check } from "lucide-react";
import type { Ride } from "../services/sheetService";

interface HistoryProps {
  rides: Ride[];
  onDeleteRide: (date: string, startOdo: number) => void;
  onEditRide: (oldDate: string, oldStartOdo: number, updatedRide: Ride) => void;
  isDarkMode: boolean;
}

export const History: React.FC<HistoryProps> = ({
  rides,
  onDeleteRide,
  onEditRide,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Edit State
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [originalKey, setOriginalKey] = useState<{ date: string; startOdo: number } | null>(null);
  const [editOdoStart, setEditOdoStart] = useState("");
  const [editOdoEnd, setEditOdoEnd] = useState("");
  const [editBattStart, setEditBattStart] = useState("");
  const [editBattEnd, setEditBattEnd] = useState("");
  const [editRangeStart, setEditRangeStart] = useState("");
  const [editRangeEnd, setEditRangeEnd] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Populate months and years for filter dropdowns
  const years = Array.from(new Set(rides.map(r => r.date.split("-")[0]))).sort();
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Filtering Logic
  const filteredRides = rides.filter(ride => {
    const [year, month] = ride.date.split("-");
    const matchesSearch = ride.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ride.date.includes(searchTerm) ||
                          String(ride.startOdo).includes(searchTerm) ||
                          String(ride.endOdo).includes(searchTerm);
    const matchesMonth = selectedMonth === "all" || month === selectedMonth;
    const matchesYear = selectedYear === "all" || year === selectedYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  const handleEditClick = (ride: Ride) => {
    setEditingRide(ride);
    setOriginalKey({ date: ride.date, startOdo: ride.startOdo });
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
    if (!editingRide || !originalKey) return;

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
      date: editingRide.date, // keep original date
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

    onEditRide(originalKey.date, originalKey.startOdo, updatedRide);
    setEditingRide(null);
    setOriginalKey(null);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading font-black text-3xl tracking-tight">
            Ride History Logs
          </h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Inspect details of every logged trip, sorted chronologically.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes, date, or odometer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
              isDarkMode 
                ? "bg-[#0f0f0f] border-white/5 focus:border-emerald-500/50 text-white" 
                : "bg-white border-slate-200 focus:border-emerald-600 text-slate-800"
            }`}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-4">
          {/* Month */}
          <div className="relative shrink-0">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-sm font-semibold outline-none cursor-pointer transition-all ${
                isDarkMode 
                  ? "bg-[#0f0f0f] border-white/5 focus:border-emerald-500/50 text-white" 
                  : "bg-white border-slate-200 focus:border-emerald-600 text-slate-800"
              }`}
            >
              <option value="all">All Months</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Year */}
          <div className="relative shrink-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-sm font-semibold outline-none cursor-pointer transition-all ${
                isDarkMode 
                  ? "bg-[#0f0f0f] border-white/5 focus:border-emerald-500/50 text-white" 
                  : "bg-white border-slate-200 focus:border-emerald-600 text-slate-800"
              }`}
            >
              <option value="all">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Ride Grid Display */}
      {filteredRides.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No rides found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map((ride, idx) => (
            <div
              key={`${ride.date}_${ride.startOdo}_${idx}`}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:scale-101 ${
                isDarkMode 
                  ? "glass-panel border-white/5 hover:border-emerald-500/20" 
                  : "glass-panel-light border-slate-200 hover:border-emerald-500/35"
              }`}
            >
              <div className="space-y-4">
                {/* Date header */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-500/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="font-heading font-bold text-sm">{ride.date}</span>
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
                        if (window.confirm("Are you sure you want to delete this ride?")) {
                          onDeleteRide(ride.date, ride.startOdo);
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
                  <p className={`text-[10px] uppercase font-bold text-slate-500`}>Journey Notes</p>
                  <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    "{ride.notes}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Editing Dialog Modal overlay */}
      {editingRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${
            isDarkMode ? "glass-panel border-white/10" : "glass-panel-light border-slate-200"
          }`}>
            <h3 className="font-heading font-black text-xl mb-6">
              Edit Ride Details: {editingRide.date}
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
                  onClick={() => setEditingRide(null)}
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
