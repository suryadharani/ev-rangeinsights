import { Gauge, Settings, ShieldAlert, Sun, Moon, Wrench } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenSettings: () => void;
  onAddRide: () => void;
  ownerName: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onOpenSettings,
  onAddRide,
  ownerName,
}) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "garage", label: "Garage", icon: Wrench },
    { id: "history", label: "Ride History", icon: ShieldAlert },
    { id: "analytics", label: "Analytics", icon: Gauge }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-[#f8f9fa] text-slate-800"}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-72 h-screen sticky top-0 border-r transition-all duration-300 ${isDarkMode ? "glass-panel border-white/5" : "glass-panel-light border-slate-200"}`}>
        {/* Brand */}
        <div className="p-8 border-b border-white/5 md:border-b-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-600/10 text-emerald-600"}`}>
              <Gauge className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-extrabold tracking-tight">
                {ownerName} <span className="text-emerald-500 font-normal">Garage</span>
              </h1>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                My EV Ride Insights
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-white/10 text-white border border-white/10"
                      : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : isDarkMode
                    ? "text-slate-400 hover:bg-white/5 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer controls inside sidebar */}
        <div className="p-6 border-t border-white/5 md:border-t-0 space-y-3">
          <button
            onClick={onAddRide}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:brightness-110 active:scale-95 transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            Add Ride Log
          </button>
          
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "border-white/10 text-yellow-400 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={onOpenSettings}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "border-white/10 text-slate-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title="Database Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-40 backdrop-blur-md ${isDarkMode ? "bg-[#0a0a0a]/90 border-white/5" : "bg-white/90 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-base font-extrabold tracking-tight">
            {ownerName} <span className="text-emerald-500 font-normal">Garage</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-all ${
              isDarkMode ? "border-white/5 text-yellow-400" : "border-slate-200 text-slate-600"
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg border transition-all ${
              isDarkMode ? "border-white/5 text-slate-300" : "border-slate-200 text-slate-600"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onAddRide}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/10"
          >
            + Log
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 md:pb-0">
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-2 z-40 backdrop-blur-md transition-colors ${
        isDarkMode ? "bg-[#0a0a0a]/90 border-white/5" : "bg-white/90 border-slate-200"
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? isDarkMode
                    ? "text-emerald-400 font-semibold"
                    : "text-emerald-600 font-semibold"
                  : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
