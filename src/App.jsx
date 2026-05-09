import React, { useEffect, useMemo, useState } from "react";

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-shell {
    min-height: 100vh;
    background: #f1f5f9;
    padding: 24px;
    font-family: Arial, sans-serif;
    color: #0f172a;
  }
  .app-container {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    gap: 24px;
  }
  .app-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
  }
  .app-title {
    margin: 0;
    font-size: 34px;
    line-height: 1.1;
  }
  .app-subtitle {
    margin: 8px 0 0;
    color: #475569;
  }
  .status-row {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .status-pill {
    background: #ffffff;
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 13px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  }
  .install-button, .primary-button, .secondary-button {
    border: 0;
    border-radius: 14px;
    padding: 12px 16px;
    font-weight: 800;
    cursor: pointer;
    min-height: 46px;
  }
  .install-button, .primary-button {
    background: #0f172a;
    color: #ffffff;
  }
  .primary-button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
  .secondary-button {
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #0f172a;
  }
  .card {
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    border: 1px solid #e2e8f0;
  }
  .card-content {
    padding: 22px;
  }
  .notice-card {
    background: #ecfeff;
    border-color: #67e8f9;
  }
  .notice-card .card-content {
    display: grid;
    gap: 8px;
    padding: 18px;
  }
  .notice-card h2 {
    margin: 0;
    font-size: 18px;
  }
  .notice-card p {
    margin: 0;
    color: #155e75;
    line-height: 1.5;
  }
  .main-grid {
    display: grid;
    grid-template-columns: minmax(280px, 360px) 1fr;
    gap: 24px;
  }
  .form-grid {
    display: grid;
    gap: 18px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-title h2 {
    margin: 0;
    font-size: 22px;
  }
  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #334155;
  }
  .field-input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 11px 12px;
    font-size: 16px;
    outline: none;
    background: #ffffff;
    min-height: 46px;
  }
  .small-text {
    font-size: 12px;
    color: #64748b;
    margin-top: 6px;
  }
  .error-text {
    color: #dc2626;
    font-weight: 700;
  }
  .results-grid {
    padding: 22px;
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 24px;
    align-items: center;
  }
  .results-info {
    display: grid;
    gap: 18px;
  }
  .selected-label {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }
  .selected-title {
    margin: 4px 0;
    font-size: 28px;
  }
  .selected-subtitle {
    margin: 0;
    color: #475569;
  }
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(160px, 1fr));
    gap: 12px;
  }
  .metric-box {
    background: #f8fafc;
    border-radius: 16px;
    padding: 16px;
    border: 1px solid #e2e8f0;
  }
  .metric-label {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
  .metric-value {
    margin: 8px 0 0;
    font-size: 25px;
    font-weight: 900;
  }
  .tank-visual-section {
    display: grid;
    justify-items: center;
    gap: 12px;
  }
  .tank-visual {
    position: relative;
    height: 290px;
    width: 160px;
    overflow: hidden;
    border-radius: 22px;
    border: 5px solid #334155;
    background: #ffffff;
    box-shadow: inset 0 2px 18px rgba(15, 23, 42, 0.15);
  }
  .tank-fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0f172a;
    transition: height 350ms ease;
  }
  .tank-center {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }
  .tank-badge {
    background: rgba(255, 255, 255, 0.86);
    border-radius: 14px;
    padding: 10px 14px;
    text-align: center;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  }
  .tank-caption {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }
  .history-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
  }
  .history-header h2 {
    margin: 0;
    font-size: 22px;
  }
  .history-header p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #64748b;
  }
  .history-table-wrap {
    overflow-x: auto;
  }
  .history-table {
    width: 100%;
    min-width: 850px;
    border-collapse: collapse;
    font-size: 14px;
  }
  .history-table th, .history-table td {
    text-align: left;
    padding: 12px 8px;
  }
  .history-table thead tr, .history-table tbody tr {
    border-bottom: 1px solid #e2e8f0;
  }
  .history-table thead {
    color: #64748b;
  }
  .history-mobile-list {
    display: none;
  }
  .history-mobile-card {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 16px;
    padding: 14px;
    display: grid;
    gap: 10px;
  }
  .history-mobile-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }
  .history-mobile-title {
    margin: 0;
    font-size: 16px;
    font-weight: 900;
  }
  .history-mobile-date {
    margin: 4px 0 0;
    font-size: 12px;
    color: #64748b;
  }
  .history-pill {
    border-radius: 999px;
    background: #e2e8f0;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }
  .history-mobile-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .history-mini-metric {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px;
  }
  .history-mini-label {
    margin: 0;
    font-size: 11px;
    color: #64748b;
  }
  .history-mini-value {
    margin: 4px 0 0;
    font-size: 15px;
    font-weight: 900;
  }
  .login-shell {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a, #334155);
    padding: 20px;
    display: grid;
    place-items: center;
    font-family: Arial, sans-serif;
    color: #0f172a;
  }
  .login-card {
    width: 100%;
    max-width: 420px;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
    padding: 24px;
    display: grid;
    gap: 18px;
  }
  .login-logo {
    height: 58px;
    width: 58px;
    border-radius: 18px;
    background: #0f172a;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 28px;
  }
  .login-title {
    margin: 0;
    font-size: 28px;
    line-height: 1.1;
  }
  .login-subtitle {
    margin: 8px 0 0;
    color: #64748b;
    line-height: 1.5;
  }
  .login-form {
    display: grid;
    gap: 14px;
  }
  .login-error {
    margin: 0;
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
    border-radius: 14px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 700;
  }
  .logout-button {
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #0f172a;
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  }

  @media (max-width: 760px) {
    .app-shell {
      padding: 14px;
      padding-bottom: 28px;
    }
    .app-container {
      gap: 14px;
    }
    .app-header {
      display: grid;
      gap: 12px;
      align-items: start;
    }
    .app-title {
      font-size: 27px;
    }
    .app-subtitle {
      font-size: 14px;
    }
    .status-row {
      width: 100%;
    }
    .status-pill, .install-button {
      width: 100%;
      text-align: center;
    }
    .notice-card .card-content {
      padding: 14px;
    }
    .notice-card h2 {
      font-size: 16px;
    }
    .notice-card p {
      font-size: 13px;
    }
    .main-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .card {
      border-radius: 16px;
    }
    .card-content {
      padding: 16px;
    }
    .form-grid {
      gap: 14px;
    }
    .section-title h2 {
      font-size: 20px;
    }
    .field-label {
      font-size: 13px;
    }
    .field-input {
      min-height: 52px;
      font-size: 17px;
      border-radius: 14px;
    }
    .primary-button, .secondary-button {
      width: 100%;
      min-height: 54px;
      font-size: 16px;
      border-radius: 16px;
    }
    .results-grid {
      padding: 16px;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .selected-title {
      font-size: 24px;
    }
    .metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .metric-box {
      padding: 13px;
      border-radius: 14px;
    }
    .metric-value {
      font-size: 20px;
    }
    .tank-visual-section {
      width: 100%;
      order: -1;
    }
    .tank-visual {
      width: 100%;
      height: 82px;
      border-radius: 18px;
      border-width: 4px;
    }
    .tank-fill {
      top: 0;
      right: auto;
      height: 100% !important;
      width: var(--tank-width, 0%);
      transition: width 350ms ease;
    }
    .tank-badge {
      padding: 8px 12px;
    }
    .tank-badge p:first-child {
      display: none;
    }
    .history-header {
      display: grid;
      gap: 12px;
    }
    .history-table-wrap {
      display: none;
    }
    .history-mobile-list {
      display: grid;
      gap: 10px;
    }
  }
`;

const LOGIN_USERS = [
  { username: "admin", password: "1234", role: "Administrator" },
  { username: "staff", password: "0000", role: "Staff" },
];

const SESSION_KEY = "fuelTankLoggedInUser";

const stations = {
  petromocVilankulo: {
    name: "PETROMOC VILANKULO",
    location: "Vilankulo",
    tanks: {
  tank1: {
    name: "Tank 1",
    product: "Diesel",
    capacity: 29500,
    maxMm: 2182,
    points: [
      [1, 0],
      [10, 0],
      [62, 250],
      [95, 500],
      [128, 750],
      [154, 1000],
      [208, 1500],
      [245, 2000],
      [300, 2500],
      [341, 3000],
      [417, 4000],
      [490, 5000],
      [560, 6000],
      [625, 7000],
      [690, 8000],
      [754, 9000],
      [815, 10000],
      [879, 11000],
      [939, 12000],
      [1062, 14000],
      [1183, 16000],
      [1303, 18000],
      [1360, 19000],
      [1415, 20000],
      [1480, 21000],
      [1542, 22000],
      [1610, 23000],
      [1678, 24000],
      [1750, 25000],
      [1822, 26000],
      [1903, 27000],
      [1947, 27500],
      [1995, 28000],
      [2046, 28500],
      [2115, 29000],
      [2140, 29250],
      [2182, 29500],
    ],
  },
  tank2: {
    name: "Tank 2",
    product: "Petrol",
    capacity: 15000,
    maxMm: 1715,
    points: [
      [1, 5],
      [15, 10],
      [64, 250],
      [110, 500],
      [156, 750],
      [196, 1000],
      [261, 1500],
      [294, 1750],
      [327, 2000],
      [357, 2250],
      [387, 2500],
      [416, 2750],
      [445, 3000],
      [552, 4000],
      [651, 5000],
      [675, 5250],
      [699, 5500],
      [723, 5750],
      [747, 6000],
      [930, 8000],
      [1025, 9000],
      [1120, 10000],
      [1144, 10250],
      [1168, 10500],
      [1192, 10750],
      [1216, 11000],
      [1267, 11500],
      [1318, 12000],
      [1367, 12500],
      [1418, 13000],
      [1447, 13250],
      [1476, 13500],
      [1533, 14000],
      [1594, 14500],
      [1632, 14750],
      [1675, 15000],
      [1715, 15250],
    ],
  },
  tank3: {
    name: "Tank 3",
    product: "Diesel",
    capacity: 10000,
    maxMm: 1572,
    points: [
      [1, 3],
      [86, 250],
      [151, 500],
      [208, 750],
      [258, 1000],
      [349, 1500],
      [430, 2000],
      [468, 2250],
      [506, 2500],
      [542, 2750],
      [578, 3000],
      [717, 4000],
      [852, 5000],
      [885, 5250],
      [918, 5500],
      [951, 5750],
      [984, 6000],
      [1018, 6250],
      [1052, 6500],
      [1086, 6750],
      [1120, 7000],
      [1189, 7500],
      [1258, 8000],
      [1331, 8500],
      [1404, 9000],
      [1443, 9250],
      [1485, 9500],
      [1528, 9750],
      [1572, 10000],
    ],
  },
  tank4: {
    name: "Tank 4",
    product: "Petrol",
    capacity: 15000,
    maxMm: 1753,
    points: [
      [1, 0],
      [64, 250],
      [109, 500],
      [155, 750],
      [198, 1000],
      [271, 1500],
      [338, 2000],
      [369, 2250],
      [400, 2500],
      [675, 5000],
      [700, 5250],
      [725, 5500],
      [750, 5750],
      [775, 6000],
      [960, 8000],
      [1161, 10000],
      [1262, 11000],
      [1289, 11250],
      [1316, 11500],
      [1343, 11750],
      [1370, 12000],
      [1398, 12250],
      [1426, 12500],
      [1485, 13000],
      [1510, 13250],
      [1535, 13500],
      [1596, 14000],
      [1630, 14250],
      [1668, 14500],
      [1707, 14750],
      [1753, 15000],
    ],
  },
    },
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
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function makeId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

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

function loadSavedUser() {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed && parsed.username ? parsed : null;
  } catch (error) {
    console.error("Could not load saved user", error);
    return null;
  }
}

function saveUserSession(user) {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Could not save user session", error);
  }
}

function clearUserSession() {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Could not clear user session", error);
  }
}

function runInterpolationTests() {
  const testPoints = [
    [1, 0],
    [11, 100],
    [21, 200],
  ];

  const tests = [
    { name: "empty input returns 0", actual: interpolateLiters("", testPoints), expected: 0 },
    { name: "invalid input returns 0", actual: interpolateLiters("abc", testPoints), expected: 0 },
    { name: "missing points returns 0", actual: interpolateLiters(10, undefined), expected: 0 },
    { name: "empty points returns 0", actual: interpolateLiters(10, []), expected: 0 },
    { name: "first point exact", actual: interpolateLiters(1, testPoints), expected: 0 },
    { name: "middle interpolation", actual: interpolateLiters(6, testPoints), expected: 50 },
    { name: "second point exact", actual: interpolateLiters(11, testPoints), expected: 100 },
    { name: "above max clamps to last liters", actual: interpolateLiters(30, testPoints), expected: 200 },
    { name: "below first positive clamps to first liters", actual: interpolateLiters(0.5, testPoints), expected: 0 },
    { name: "unsorted points still work", actual: interpolateLiters(6, [[11, 100], [1, 0], [21, 200]]), expected: 50 },
  ];

  tests.forEach((test) => {
    if (Math.abs(test.actual - test.expected) > 0.0001) {
      console.error(`Test failed: ${test.name}. Expected ${test.expected}, got ${test.actual}`);
    }
  });

  const storageTests = [
    { name: "loadSavedHistory returns array when storage is unavailable", actual: Array.isArray(loadSavedHistory()), expected: true },
    { name: "loadSavedUser returns null or user object", actual: loadSavedUser() === null || typeof loadSavedUser() === "object", expected: true },
  ];

  storageTests.forEach((test) => {
    if (test.actual !== test.expected) {
      console.error(`Test failed: ${test.name}. Expected ${test.expected}, got ${test.actual}`);
    }
  });
}

runInterpolationTests();

function Card({ children, style, className = "" }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="field-label">{children}</label>;
}

export default function FuelTankPWAPrototype() {
  const [loggedInUser, setLoggedInUser] = useState(() => loadSavedUser());
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("petromocVilankulo");
  const [selectedTankId, setSelectedTankId] = useState("tank1");
  const [readingMm, setReadingMm] = useState("");
  const [operator, setOperator] = useState("");
  const [history, setHistory] = useState(() => loadSavedHistory());
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneApp());

  const station = stations[selectedStationId] || stations.petromocVilankulo;
  const stationTanks = station?.tanks || {};
  const tank = stationTanks[selectedTankId] || Object.values(stationTanks)[0];

  useEffect(() => {
    const currentStationTanks = station?.tanks || {};
    if (!currentStationTanks[selectedTankId]) {
      const firstTankId = Object.keys(currentStationTanks)[0] || "";
      setSelectedTankId(firstTankId);
    }
  }, [selectedStationId, selectedTankId, station]);

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

    const newReading = {
      id: makeId(),
      date: new Date().toLocaleString(),
      station: station.name,
      tank: tank.name,
      product: tank.product,
      mm: readingNumber,
      liters,
      percentage,
      ullage,
      operator: operator || "Not entered",
    };

    setHistory((currentHistory) => [newReading, ...currentHistory]);
  };

  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

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

  const handleLogin = (event) => {
    event.preventDefault();

    const user = LOGIN_USERS.find(
      (item) => item.username.toLowerCase() === loginUsername.trim().toLowerCase() && item.password === loginPassword
    );

    if (!user) {
      setLoginError("Wrong username or password.");
      return;
    }

    const safeUser = { username: user.username, role: user.role };
    saveUserSession(safeUser);
    setLoggedInUser(safeUser);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
  };

  const handleLogout = () => {
    clearUserSession();
    setLoggedInUser(null);
  };

  if (!loggedInUser) {
    return (
      <div className="login-shell">
        <style>{styles}</style>
        <div className="login-card">
          <div className="login-logo">⛽</div>
          <div>
            <h1 className="login-title">Fuel Tank Reading</h1>
            <p className="login-subtitle">Login to access tank readings and saved history.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div>
              <FieldLabel>Username</FieldLabel>
              <input
                className="field-input"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <FieldLabel>Password</FieldLabel>
              <input
                className="field-input"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {loginError ? <p className="login-error">{loginError}</p> : null}

            <button type="submit" className="primary-button">
              🔐 Login
            </button>
          </form>

          <p className="small-text" style={{ margin: 0 }}>
            Temporary test logins: admin / 1234 or staff / 0000. Change these before real use.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <style>{styles}</style>
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1 className="app-title">Fuel Tank Reading</h1>
            <p className="app-subtitle">Fast mobile readings for liters, ullage, and daily history.</p>
          </div>
          <div className="status-row">
            <div className="status-pill">{loggedInUser.username} • {loggedInUser.role}</div>
            <div className="status-pill">{isInstalled ? "Installed app mode" : "PWA-ready"}</div>
            {installPrompt ? (
              <button type="button" onClick={installApp} className="install-button">
                📲 Install App
              </button>
            ) : null}
            <button type="button" onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>

        <Card className="notice-card">
          <div className="card-content">
            <h2>Install on phone or computer</h2>
            <p>
              On Android/Chrome or Windows/Edge, use the browser install button. On iPhone, open in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
            </p>
          </div>
        </Card>

        <main className="main-grid">
          <Card>
            <div className="card-content form-grid">
              <div className="section-title">
                <span style={{ fontSize: 24 }} aria-hidden="true">⛽</span>
                <h2>Enter Reading</h2>
              </div>

              <div>
                <FieldLabel>Station</FieldLabel>
                <select
                  value={selectedStationId}
                  onChange={(event) => {
                    const newStationId = event.target.value;
                    const firstTankId = Object.keys(stations[newStationId]?.tanks || {})[0] || "";
                    setSelectedStationId(newStationId);
                    setSelectedTankId(firstTankId);
                    setReadingMm("");
                  }}
                  className="field-input"
                >
                  {Object.entries(stations).map(([id, item]) => (
                    <option key={id} value={id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Tank</FieldLabel>
                <select
                  value={selectedTankId}
                  onChange={(event) => {
                    setSelectedTankId(event.target.value);
                    setReadingMm("");
                  }}
                  className="field-input"
                >
                  {Object.entries(stationTanks).map(([id, item]) => (
                    <option key={id} value={id}>
                      {item.name} — {item.product}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Reading in millimeters</FieldLabel>
                <input
                  className="field-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={maxMm}
                  placeholder={`Example: ${Math.round(maxMm / 2)}`}
                  value={readingMm}
                  onChange={(event) => setReadingMm(event.target.value)}
                />
                <p className="small-text">Maximum calibrated height: {maxMm} mm</p>
                {readingIsTooHigh ? <p className="small-text error-text">This reading is above the calibrated height for this tank.</p> : null}
                {readingIsNegative ? <p className="small-text error-text">Reading cannot be negative.</p> : null}
              </div>

              <div>
                <FieldLabel>Operator / staff name</FieldLabel>
                <input className="field-input" placeholder="Optional" value={operator} onChange={(event) => setOperator(event.target.value)} />
              </div>

              <button type="button" onClick={saveReading} disabled={!hasReading || readingHasError} className="primary-button">
                💾 Save Reading
              </button>
            </div>
          </Card>

          <Card>
            <div className="results-grid">
              <section className="results-info">
                <div>
                  <p className="selected-label">Selected station</p>
                  <h2 className="selected-title">{station.name}</h2>
                  <p className="selected-subtitle">{tank.name} • {tank.product} • Capacity {formatNumber(capacity)} L</p>
                </div>

                <div className="metric-grid">
                  <div className="metric-box">
                    <p className="metric-label">Liters</p>
                    <p className="metric-value">{formatNumber(liters)} L</p>
                  </div>
                  <div className="metric-box">
                    <p className="metric-label">Full</p>
                    <p className="metric-value">{formatNumber(percentage)}%</p>
                  </div>
                  <div className="metric-box">
                    <p className="metric-label">Available space</p>
                    <p className="metric-value">{formatNumber(ullage)} L</p>
                  </div>
                  <div className="metric-box">
                    <p className="metric-label">Reading</p>
                    <p className="metric-value">{hasReading ? readingNumber : 0} mm</p>
                  </div>
                </div>
              </section>

              <section className="tank-visual-section">
                <div className="tank-visual" style={{ "--tank-width": `${percentage}%` }}>
                  <div className="tank-fill" style={{ height: `${percentage}%` }} />
                  <div className="tank-center">
                    <div className="tank-badge">
                      <p style={{ margin: "0 0 4px", fontSize: 24 }} aria-hidden="true">💧</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{formatNumber(percentage)}%</p>
                    </div>
                  </div>
                </div>
                <p className="tank-caption">Visual tank level</p>
              </section>
            </div>
          </Card>
        </main>

        <Card>
          <div className="card-content">
            <div className="history-header">
              <div>
                <h2>Reading History</h2>
                <p>Saved permanently on this device/browser.</p>
              </div>
              <button type="button" onClick={clearHistory} className="secondary-button">
                🗑️ Clear
              </button>
            </div>

            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Station</th>
                    <th>Tank</th>
                    <th>Product</th>
                    <th>MM</th>
                    <th>Liters</th>
                    <th>%</th>
                    <th>Ullage</th>
                    <th>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={9}>No readings saved yet.</td>
                    </tr>
                  ) : (
                    history.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.station || "PETROMOC VILANKULO"}</td>
                        <td>{row.tank}</td>
                        <td>{row.product}</td>
                        <td>{row.mm}</td>
                        <td>{formatNumber(row.liters)} L</td>
                        <td>{formatNumber(row.percentage)}%</td>
                        <td>{formatNumber(row.ullage)} L</td>
                        <td>{row.operator}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="history-mobile-list">
              {history.length === 0 ? (
                <p style={{ margin: 0, color: "#64748b" }}>No readings saved yet.</p>
              ) : (
                history.map((row) => (
                  <div key={row.id} className="history-mobile-card">
                    <div className="history-mobile-top">
                      <div>
                        <p className="history-mobile-title">{row.station || "PETROMOC VILANKULO"}</p>
                        <p className="history-mobile-date">{row.tank} — {row.product} • {row.date}</p>
                      </div>
                      <span className="history-pill">{row.operator}</span>
                    </div>
                    <div className="history-mobile-metrics">
                      <div className="history-mini-metric">
                        <p className="history-mini-label">MM</p>
                        <p className="history-mini-value">{row.mm}</p>
                      </div>
                      <div className="history-mini-metric">
                        <p className="history-mini-label">Liters</p>
                        <p className="history-mini-value">{formatNumber(row.liters)} L</p>
                      </div>
                      <div className="history-mini-metric">
                        <p className="history-mini-label">Full</p>
                        <p className="history-mini-value">{formatNumber(row.percentage)}%</p>
                      </div>
                      <div className="history-mini-metric">
                        <p className="history-mini-label">Ullage</p>
                        <p className="history-mini-value">{formatNumber(row.ullage)} L</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
