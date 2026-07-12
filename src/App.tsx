import { useState, useEffect } from "react";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Garage } from "./pages/Garage";
import { History } from "./pages/History";
import { Analytics } from "./pages/Analytics";
import { RideModal } from "./components/RideModal";
import { SetupGuide } from "./components/SetupGuide";
import { fetchRidesFromSheet, saveNewRide, deleteRide, updateRide, getStoredConfig } from "./services/sheetService";
import type { Ride } from "./services/sheetService";
import { Loader2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("ev_theme");
    return saved ? saved === "dark" : true; // Default dark
  });
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(getStoredConfig());
  
  // Modal Overlays
  const [isRideModalOpen, setIsRideModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme to DOM
  useEffect(() => {
    localStorage.setItem("ev_theme", isDarkMode ? "dark" : "light");
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      root.style.backgroundColor = "#0a0a0a";
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#f8f9fa";
    }
  }, [isDarkMode]);

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRidesFromSheet();
      setRides(data);
    } catch (e) {
      console.error("Failed to fetch rides records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [config.sheetId]); // Reload if sheet ID changes

  const handleConfigChange = () => {
    setConfig(getStoredConfig());
  };

  const handleSaveRide = async (newRide: Ride) => {
    await saveNewRide(newRide);
    loadData(); // reload
  };

  const handleDeleteRide = async (date: string, startOdo: number) => {
    await deleteRide(date, startOdo);
    loadData();
  };

  const handleEditRide = async (oldDate: string, oldStartOdo: number, updatedRide: Ride) => {
    await updateRide(oldDate, oldStartOdo, updatedRide);
    loadData();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-slate-500">
            Querying Google Sheets Database...
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            rides={rides}
            batteryCapacity={config.batteryCapacity}
            isDarkMode={isDarkMode}
          />
        );
      case "garage":
        return (
          <Garage
            rides={rides}
            vehicleName={config.vehicleName}
            batteryCapacity={config.batteryCapacity}
            ownerName={config.ownerName}
            isDarkMode={isDarkMode}
          />
        );
      case "history":
        return (
          <History
            rides={rides}
            onDeleteRide={handleDeleteRide}
            onEditRide={handleEditRide}
            isDarkMode={isDarkMode}
          />
        );
      case "analytics":
        return (
          <Analytics
            rides={rides}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onAddRide={() => setIsRideModalOpen(true)}
      ownerName={config.ownerName}
    >
      {renderContent()}

      {/* Ride Logging Modal Gate */}
      <RideModal
        isOpen={isRideModalOpen}
        onClose={() => setIsRideModalOpen(false)}
        onSave={handleSaveRide}
        isDarkMode={isDarkMode}
      />

      {/* Database/Profile settings modal */}
      <SetupGuide
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onConfigChange={handleConfigChange}
      />
    </AppLayout>
  );
}
