import React, { useEffect, useMemo, useState } from "react";

const tanks = {
  tank1: {
    name: "Tank 1",
    product: "Diesel",
    capacity: 29500,
    maxMm: 2182,
    points: [
      [1, 0], [10, 0], [62, 250], [95, 500], [128, 750], [154, 1000], [208, 1500],
      [245, 2000], [300, 2500], [341, 3000], [417, 4000], [490, 5000], [560, 6000],
      [625, 7000], [690, 8000], [754, 9000], [815, 10000], [879, 11000], [939, 12000],
      [1062, 14000], [1183, 16000], [1303, 18000], [1360, 19000], [1415, 20000],
      [1480, 21000], [1542, 22000], [1610, 23000], [1678, 24000], [1750, 25000],
      [1822, 26000], [1903, 27000], [1947, 27500], [1995, 28000], [2046, 28500],
      [2115, 29000], [2140, 29250], [2182, 29500],
    ],
  },
  tank2: {
    name: "Tank 2",
    product: "Petrol",
    capacity: 15000,
    maxMm: 1715,
    points: [
      [1, 5], [15, 10], [64, 250], [110, 500], [156, 750], [196, 1000], [261, 1500],
      [294, 1750], [327, 2000], [357, 2250], [387, 2500], [416, 2750], [445, 3000],
      [552, 4000], [651, 5000], [675, 5250], [699, 5500], [723, 5750], [747, 6000],
      [930, 8000], [1025, 9000], [1120, 10000], [1144, 10250], [1168, 10500],
      [1192, 10750], [1216, 11000], [1267, 11500], [1318, 12000], [1367, 12500],
      [1418, 13000], [1447, 13250], [1476, 13500], [1533, 14000], [1594, 14500],
      [1632, 14750], [1675, 15000], [1715, 15250],
    ],
  },
  tank3: {
    name: "Tank 3",
    product: "Diesel",
    capacity: 10000,
    maxMm: 1572,
    points: [
      [1, 3], [86, 250], [151, 500], [208, 750], [258, 1000], [349, 1500], [430, 2000],
      [468, 2250], [506, 2500], [542, 2750], [578, 3000], [717, 4000], [852, 5000],
      [885, 5250], [918, 5500], [951, 5750], [984, 6000], [1018, 6250], [1052, 6500],
      [1086, 6750], [1120, 7000], [1189, 7500], [1258, 8000], [1331, 8500], [1404, 9000],
      [1443, 9250], [1485, 9500], [1528, 9750], [1572, 10000],
    ],
  },
  tank4: {
    name: "Tank 4",
    product: "Petrol",
    capacity: 15000,
    maxMm: 1753,
    points: [
      [1, 0], [64, 250], [109, 500], [155, 750], [198, 1000], [271, 1500], [338, 2000],
      [369, 2250], [400, 2500], [675, 5000], [700, 5250], [725, 5500], [750, 5750],
      [775, 6000], [960, 8000], [1161, 10000], [1262, 11000], [1289, 11250],
      [1316, 11500], [1343, 11750], [1370, 12000], [1398, 12250], [1426, 12500],
      [1485, 13000], [1510, 13250], [1535, 13500], [1596, 14000], [1630, 14250],
      [1668, 14500], [1707, 14750], [1753, 15000],
    ],
  },
};

function interpolateLiters(mm, points = []) {
  const value = Number(mm);
  if (!Array.isArray(points) || points.length === 0) return 0;
  if (!Number.isFinite(value) || value <= 0) return 0;

  const sorted = [...points]
    .filter((point) => Array.isArray(point) && point.length >= 2)
    .map(([height, liters]) => [Number(height), Number(liters)])
    .filter(([height, liters]) => Number.isFinite(height) && Number.isFinite(liters))
    .sort((a, b) => a[0] - b[0]);

  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0][1];
  if (value <= sorted[0][0]) return sorted[0][1];
  if (value >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const [mm1, l1] = sorted[i];
    const [mm2, l2] = sorted[i + 1];
    if (value >= mm1 && value <= mm2) {
      if (mm2 === mm1) return l2;
      const ratio = (value - mm1) / (mm2 - mm1);
      return l1 + ratio * (l2 - l1);
    }
  }
  return 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function makeId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadSavedHistory() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const saved = window.localStorage.getItem("fuelTankReadingHistory");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load saved reading history", error);
    return [];
  }
}

function saveHistoryToStorage(history) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem("fuelTankReadingHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Could not save reading history", error);
  }
}

function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  const standaloneDisplay = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = window.navigator && window.navigator.standalone === true;
  return Boolean(standaloneDisplay || iosStandalone);
}

function Card({ children, style }) {
  return <div style={{ background: "#ffffff", borderRadius: 18, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0", ...style }}>{children}</div>;
}

function FieldLabel({ children }) {
  return <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 700, color: "#334155" }}>{children}</label>;
}

const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 12, padding: "11px 12px", fontSize: 15, outline: "none", background: "#ffffff" };
const smallTextStyle = { fontSize: 12, color: "#64748b", marginTop: 6 };
const metricBoxStyle = { background: "#f8fafc", borderRadius: 16, padding: 16, border: "1px solid #e2e8f0" };

export default function App() {
  const [selectedTankId, setSelectedTankId] = useState("tank1");
  const [readingMm, setReadingMm] = useState("");
  const [operator, setOperator] = useState("");
  const [history, setHistory] = useState(() => loadSavedHistory());
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneApp());

  const tank = tanks[selectedTankId] || tanks.tank1;
  const liters = useMemo(() => interpolateLiters(readingMm, tank?.points || []), [readingMm, tank]);
  const capacity = Number(tank?.capacity) || 0;
  const maxMm = Number(tank?.maxMm) || 0;
  const percentage = capacity > 0 ? Math.min((liters / capacity) * 100, 100) : 0;
  const ullage = Math.max(capacity - liters, 0);
  const readingNumber = Number(readingMm);
  const hasReading = readingMm !== "" && Number.isFinite(readingNumber);
  const readingIsTooHigh = hasReading && maxMm > 0 && readingNumber > maxMm;
  const readingIsNegative = hasReading && readingNumber < 0;
  const readingHasError = readingIsTooHigh || readingIsNegative;

  const saveReading = () => {
    if (!hasReading || readingHasError) return;
    const newReading = { id: makeId(), date: new Date().toLocaleString(), tank: tank.name, product: tank.product, mm: readingNumber, liters, percentage, ullage, operator: operator || "Not entered" };
    setHistory((currentHistory) => [newReading, ...currentHistory]);
  };

  useEffect(() => { saveHistoryToStorage(history); }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleBeforeInstallPrompt = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const handleAppInstalled = () => { setIsInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      console.error("Could not show install prompt", error);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "24px", fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1 }}>Fuel Tank Reading</h1>
            <p style={{ margin: "8px 0 0", color: "#475569" }}>PWA for dip readings, liters, ullage, and daily history.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#ffffff", borderRadius: 999, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 16px rgba(15, 23, 42, 0.07)" }}>{isInstalled ? "Installed app mode" : "PWA-ready"}</div>
            {installPrompt ? <button type="button" onClick={installApp} style={{ border: 0, borderRadius: 999, padding: "10px 14px", background: "#0f172a", color: "#ffffff", cursor: "pointer", fontWeight: 800 }}>📲 Install App</button> : null}
          </div>
        </header>

        <Card style={{ background: "#ecfeff", borderColor: "#67e8f9" }}>
          <div style={{ padding: 18, display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Install on phone or computer</h2>
            <p style={{ margin: 0, color: "#155e75", lineHeight: 1.5 }}>On Android/Chrome or Windows/Edge, use the browser install button. On iPhone, open in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p>
          </div>
        </Card>

        <main style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 24 }}>
          <Card>
            <div style={{ padding: 22, display: "grid", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 24 }} aria-hidden="true">⛽</span><h2 style={{ margin: 0, fontSize: 22 }}>Enter Reading</h2></div>
              <div><FieldLabel>Tank</FieldLabel><select value={selectedTankId} onChange={(event) => setSelectedTankId(event.target.value)} style={inputStyle}>{Object.entries(tanks).map(([id, item]) => <option key={id} value={id}>{item.name} — {item.product}</option>)}</select></div>
              <div>
                <FieldLabel>Reading in millimeters</FieldLabel>
                <input style={inputStyle} type="number" min="0" max={maxMm} placeholder={`Example: ${Math.round(maxMm / 2)}`} value={readingMm} onChange={(event) => setReadingMm(event.target.value)} />
                <p style={smallTextStyle}>Maximum calibrated height: {maxMm} mm</p>
                {readingIsTooHigh ? <p style={{ ...smallTextStyle, color: "#dc2626", fontWeight: 700 }}>This reading is above the calibrated height for this tank.</p> : null}
                {readingIsNegative ? <p style={{ ...smallTextStyle, color: "#dc2626", fontWeight: 700 }}>Reading cannot be negative.</p> : null}
              </div>
              <div><FieldLabel>Operator / staff name</FieldLabel><input style={inputStyle} placeholder="Optional" value={operator} onChange={(event) => setOperator(event.target.value)} /></div>
              <button type="button" onClick={saveReading} disabled={!hasReading || readingHasError} style={{ border: 0, borderRadius: 14, padding: "12px 16px", background: !hasReading || readingHasError ? "#94a3b8" : "#0f172a", color: "#ffffff", fontWeight: 800, cursor: !hasReading || readingHasError ? "not-allowed" : "pointer" }}>💾 Save Reading</button>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1fr 220px", gap: 24, alignItems: "center" }}>
              <section style={{ display: "grid", gap: 18 }}>
                <div><p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Selected tank</p><h2 style={{ margin: "4px 0", fontSize: 28 }}>{tank.name}</h2><p style={{ margin: 0, color: "#475569" }}>{tank.product} • Capacity {formatNumber(capacity)} L</p></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(160px, 1fr))", gap: 12 }}>
                  <div style={metricBoxStyle}><p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Liters</p><p style={{ margin: "8px 0 0", fontSize: 25, fontWeight: 900 }}>{formatNumber(liters)} L</p></div>
                  <div style={metricBoxStyle}><p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Full</p><p style={{ margin: "8px 0 0", fontSize: 25, fontWeight: 900 }}>{formatNumber(percentage)}%</p></div>
                  <div style={metricBoxStyle}><p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Available space</p><p style={{ margin: "8px 0 0", fontSize: 25, fontWeight: 900 }}>{formatNumber(ullage)} L</p></div>
                  <div style={metricBoxStyle}><p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Reading</p><p style={{ margin: "8px 0 0", fontSize: 25, fontWeight: 900 }}>{hasReading ? readingNumber : 0} mm</p></div>
                </div>
              </section>
              <section style={{ display: "grid", justifyItems: "center", gap: 12 }}>
                <div style={{ position: "relative", height: 290, width: 160, overflow: "hidden", borderRadius: 22, border: "5px solid #334155", background: "#ffffff", boxShadow: "inset 0 2px 18px rgba(15, 23, 42, 0.15)" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${percentage}%`, background: "#0f172a", transition: "height 350ms ease" }} />
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><div style={{ background: "rgba(255,255,255,0.86)", borderRadius: 14, padding: "10px 14px", textAlign: "center", boxShadow: "0 8px 20px rgba(15,23,42,0.12)" }}><p style={{ margin: "0 0 4px", fontSize: 24 }} aria-hidden="true">💧</p><p style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{formatNumber(percentage)}%</p></div></div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Visual tank level</p>
              </section>
            </div>
          </Card>
        </main>

        <Card>
          <div style={{ padding: 22 }}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
              <div><h2 style={{ margin: 0, fontSize: 22 }}>Reading History</h2><p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>Saved permanently on this device/browser.</p></div>
              <button type="button" onClick={clearHistory} style={{ border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 14px", background: "#ffffff", cursor: "pointer", fontWeight: 700 }}>🗑️ Clear</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 850, borderCollapse: "collapse", fontSize: 14 }}>
                <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{["Date", "Tank", "Product", "MM", "Liters", "%", "Ullage", "Operator"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 8px" }}>{h}</th>)}</tr></thead>
                <tbody>{history.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={8}>No readings saved yet.</td></tr> : history.map((row) => <tr key={row.id} style={{ borderBottom: "1px solid #e2e8f0" }}><td style={{ padding: "12px 8px" }}>{row.date}</td><td style={{ padding: "12px 8px" }}>{row.tank}</td><td style={{ padding: "12px 8px" }}>{row.product}</td><td style={{ padding: "12px 8px" }}>{row.mm}</td><td style={{ padding: "12px 8px" }}>{formatNumber(row.liters)} L</td><td style={{ padding: "12px 8px" }}>{formatNumber(row.percentage)}%</td><td style={{ padding: "12px 8px" }}>{formatNumber(row.ullage)} L</td><td style={{ padding: "12px 8px" }}>{row.operator}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
