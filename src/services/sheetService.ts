export interface Ride {
  date: string;
  startOdo: number;
  endOdo: number;
  distance: number;
  startBattery: number;
  endBattery: number;
  batteryUsed: number;
  startRange: number;
  endRange: number;
  estimatedFullRange: number;
  kmPerBattery: number;
  consumptionRate: number;
  notes?: string;
}

const DEFAULT_SHEET_ID = "1OWNL3NYiRvPIZba7JWk76WPMjTsfO7Y2WlBIrcjE_eI";

export function getStoredConfig() {
  return {
    sheetId: localStorage.getItem("ev_sheet_id") || DEFAULT_SHEET_ID,
    appsScriptUrl: localStorage.getItem("ev_apps_script_url") || "",
    password: localStorage.getItem("ev_password") || "aachandraarka",
    vehicleName: localStorage.getItem("ev_vehicle_name") || "MG Windsor EV PRO",
    batteryCapacity: Number(localStorage.getItem("ev_battery_capacity")) || 53.9,
    ownerName: localStorage.getItem("ev_owner_name") || "TravelWithNani"
  };
}

export function saveStoredConfig(config: {
  sheetId?: string;
  appsScriptUrl?: string;
  vehicleName?: string;
  batteryCapacity?: number;
  ownerName?: string;
}) {
  if (config.sheetId !== undefined) localStorage.setItem("ev_sheet_id", config.sheetId);
  if (config.appsScriptUrl !== undefined) localStorage.setItem("ev_apps_script_url", config.appsScriptUrl);
  if (config.vehicleName !== undefined) localStorage.setItem("ev_vehicle_name", config.vehicleName);
  if (config.batteryCapacity !== undefined) localStorage.setItem("ev_battery_capacity", String(config.batteryCapacity));
  if (config.ownerName !== undefined) localStorage.setItem("ev_owner_name", config.ownerName);
}

export function parseCSV(csvText: string): Ride[] {
  const lines = csvText.split('\n');
  if (lines.length <= 1) return [];
  
  const rides: Ride[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    
    if (cells.length < 12) continue;
    
    const cleanNum = (val: string) => {
      const cleaned = val.replace(/["%,]/g, '');
      return cleaned ? Number(cleaned) : 0;
    };
    
    const rideDate = cells[0].replace(/"/g, '').trim();
    const startOdo = cleanNum(cells[1]);
    const endOdo = cleanNum(cells[2]);
    const distance = cleanNum(cells[3]);
    const startBattery = cleanNum(cells[4]);
    const endBattery = cleanNum(cells[5]);
    const batteryUsed = cleanNum(cells[6]);
    const startRange = cleanNum(cells[7]);
    const endRange = cleanNum(cells[8]);
    const estimatedFullRange = cleanNum(cells[9]);
    const kmPerBattery = cleanNum(cells[10]);
    const consumptionRate = cleanNum(cells[11]);
    const notes = cells[12] ? cells[12].replace(/"/g, '').trim() : '';
    
    if (isNaN(startOdo) || startOdo === 0 || isNaN(endOdo) || endOdo === 0) {
      continue;
    }
    
    rides.push({
      date: rideDate,
      startOdo,
      endOdo,
      distance,
      startBattery,
      endBattery,
      batteryUsed,
      startRange,
      endRange,
      estimatedFullRange,
      kmPerBattery,
      consumptionRate,
      notes
    });
  }
  
  return rides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchRidesFromSheet(): Promise<Ride[]> {
  const { sheetId } = getStoredConfig();
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load Google Sheet data");
    const text = await response.text();
    const sheetRides = parseCSV(text);
    
    const localRides = getLocalRides();
    
    const mergedMap = new Map<string, Ride>();
    
    sheetRides.forEach(r => {
      mergedMap.set(`${r.date}_${r.startOdo}`, r);
    });
    
    localRides.forEach(r => {
      mergedMap.set(`${r.date}_${r.startOdo}`, r);
    });
    
    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.warn("Could not fetch online spreadsheet data, loading offline fallback.", error);
    return getLocalRides();
  }
}

export function getLocalRides(): Ride[] {
  const data = localStorage.getItem("ev_local_rides");
  return data ? JSON.parse(data) : [];
}

export function saveLocalRides(rides: Ride[]) {
  localStorage.setItem("ev_local_rides", JSON.stringify(rides));
}

export async function saveNewRide(ride: Ride): Promise<boolean> {
  const { appsScriptUrl } = getStoredConfig();
  
  const localRides = getLocalRides();
  localRides.push(ride);
  saveLocalRides(localRides);
  
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "append",
          row: [
            ride.date,
            ride.startOdo,
            ride.endOdo,
            ride.distance,
            ride.startBattery,
            ride.endBattery,
            ride.batteryUsed,
            ride.startRange,
            ride.endRange,
            ride.estimatedFullRange,
            ride.kmPerBattery,
            ride.consumptionRate,
            ride.notes || ""
          ]
        })
      });
      return true;
    } catch (e) {
      console.error("Failed to sync new ride to Google Sheet", e);
      return false;
    }
  }
  return true;
}

export async function deleteRide(date: string, startOdo: number): Promise<boolean> {
  const { appsScriptUrl } = getStoredConfig();
  
  let localRides = getLocalRides();
  localRides = localRides.filter(r => !(r.date === date && r.startOdo === startOdo));
  saveLocalRides(localRides);
  
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "delete",
          date: date,
          startOdo: startOdo
        })
      });
      return true;
    } catch (e) {
      console.error("Failed to delete ride from Google Sheet", e);
      return false;
    }
  }
  return true;
}

export async function updateRide(oldDate: string, oldStartOdo: number, updatedRide: Ride): Promise<boolean> {
  const { appsScriptUrl } = getStoredConfig();
  
  let localRides = getLocalRides();
  localRides = localRides.map(r => 
    (r.date === oldDate && r.startOdo === oldStartOdo) ? updatedRide : r
  );
  saveLocalRides(localRides);
  
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "update",
          oldDate: oldDate,
          oldStartOdo: oldStartOdo,
          row: [
            updatedRide.date,
            updatedRide.startOdo,
            updatedRide.endOdo,
            updatedRide.distance,
            updatedRide.startBattery,
            updatedRide.endBattery,
            updatedRide.batteryUsed,
            updatedRide.startRange,
            updatedRide.endRange,
            updatedRide.estimatedFullRange,
            updatedRide.kmPerBattery,
            updatedRide.consumptionRate,
            updatedRide.notes || ""
          ]
        })
      });
      return true;
    } catch (e) {
      console.error("Failed to update ride in Google Sheet", e);
      return false;
    }
  }
  return true;
}
