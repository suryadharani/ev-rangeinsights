import { useState } from "react";
import { getStoredConfig, saveStoredConfig } from "../services/sheetService";
import { Copy, Check, Info, Settings } from "lucide-react";

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onConfigChange: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onConfigChange
}) => {
  const [config, setConfig] = useState(getStoredConfig());
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const codeString = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var action = payload.action;
  
  if (action === "append") {
    sheet.appendRow(payload.row);
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === "delete") {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      // Find row matching date and start odometer
      if (data[i][0] == payload.date && data[i][1] == payload.startOdo) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === "update") {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == payload.oldDate && data[i][1] == payload.oldStartOdo) {
        var range = sheet.getRange(i + 1, 1, 1, payload.row.length);
        range.setValues([payload.row]);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredConfig({
      sheetId: config.sheetId,
      appsScriptUrl: config.appsScriptUrl,
      vehicleName: config.vehicleName,
      batteryCapacity: config.batteryCapacity,
      ownerName: config.ownerName
    });
    setSaveSuccess(true);
    onConfigChange();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl p-8 border shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto ${
        isDarkMode ? "glass-panel border-white/10" : "glass-panel-light border-slate-200"
      }`}>
        <h3 className="font-heading font-black text-2xl tracking-tight mb-6 flex items-center gap-3">
          <Settings className="w-6 h-6 text-emerald-400" />
          Settings & Sheets Database Configuration
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Settings Section */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-emerald-400 uppercase tracking-wide">
              Vehicle & Owner Profile
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={config.ownerName}
                  onChange={(e) => setConfig({ ...config, ownerName: e.target.value })}
                  className={`w-full mt-1.5 px-4 py-2 rounded-xl border outline-none transition-all ${
                    isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  value={config.vehicleName}
                  onChange={(e) => setConfig({ ...config, vehicleName: e.target.value })}
                  className={`w-full mt-1.5 px-4 py-2 rounded-xl border outline-none transition-all ${
                    isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Battery Capacity (kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.batteryCapacity}
                  onChange={(e) => setConfig({ ...config, batteryCapacity: Number(e.target.value) })}
                  className={`w-full mt-1.5 px-4 py-2 rounded-xl border outline-none transition-all ${
                    isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Google Sheet ID
                </label>
                <input
                  type="text"
                  value={config.sheetId}
                  onChange={(e) => setConfig({ ...config, sheetId: e.target.value })}
                  className={`w-full mt-1.5 px-4 py-2 rounded-xl border outline-none transition-all ${
                    isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Google Apps Script Web App URL (For Real-time Sync)
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={config.appsScriptUrl}
                onChange={(e) => setConfig({ ...config, appsScriptUrl: e.target.value })}
                className={`w-full mt-1.5 px-4 py-2 rounded-xl border outline-none transition-all ${
                  isDarkMode ? "bg-black/40 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Leave empty to work in demo mode (reads from public sheet, writes save locally in browser cache).
              </p>
            </div>
          </div>

          {/* Database Setup Guide */}
          <div className="border-t border-white/5 pt-6 space-y-4">
            <h4 className="font-heading font-bold text-sm text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4" />
              Apps Script Deployment Guide
            </h4>

            <div className={`p-4 rounded-xl text-xs space-y-3 leading-relaxed border ${
              isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"
            }`}>
              <ol className="list-decimal list-inside space-y-2">
                <li>Open your Google Spreadsheet on Google Drive.</li>
                <li>Go to **Extensions** in the top menu bar, and click **Apps Script**.</li>
                <li>Delete any default code in the editor, and paste the code snippet below.</li>
                <li>Click **Save** (disk icon), then click **Deploy** -&gt; **New deployment**.</li>
                <li>Select **Web app** as the deployment type.</li>
                <li>Under **Execute as**, select **"Me (your-email)"**.</li>
                <li>Under **Who has access**, select **"Anyone"** (essential for public React triggers).</li>
                <li>Click **Deploy**, authorize permissions, and copy the **Web App URL**.</li>
                <li>Paste the URL in the configuration input box above and click **Save Settings**!</li>
              </ol>
            </div>

            {/* Code editor */}
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/80 font-mono text-[10px] text-slate-300 p-4">
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 text-[10px] font-sans"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-48 pr-20">{codeString}</pre>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-all ${
                isDarkMode ? "border-white/5 hover:bg-white/5 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-800"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              {saveSuccess ? "Settings Saved!" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
