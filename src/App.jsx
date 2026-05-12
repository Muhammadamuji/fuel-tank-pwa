import React, { useMemo, useRef, useState } from "react";

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-shell { min-height: 100vh; background: #f1f5f9; padding: 24px; font-family: Arial, sans-serif; color: #0f172a; }
  .app-container { max-width: 1180px; margin: 0 auto; display: grid; gap: 24px; }
  .app-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
  .app-title { margin: 0; font-size: 34px; line-height: 1.1; }
  .app-subtitle { margin: 8px 0 0; color: #475569; }
  .status-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .status-pill { background: #fff; border-radius: 999px; padding: 10px 14px; font-size: 13px; box-shadow: 0 4px 16px rgba(15,23,42,.07); }
  .page-nav { display: flex; gap: 10px; flex-wrap: wrap; }
  .page-tab { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; border-radius: 999px; padding: 12px 16px; font-weight: 900; cursor: pointer; }
  .page-tab.active { background: #0f172a; color: #fff; border-color: #0f172a; }
  .primary-button,.secondary-button,.logout-button { border: 0; border-radius: 14px; padding: 12px 16px; font-weight: 800; cursor: pointer; min-height: 46px; }
  .primary-button { background: #0f172a; color: #fff; }
  .primary-button:disabled { background: #94a3b8; cursor: not-allowed; }
  .secondary-button,.logout-button { border: 1px solid #cbd5e1; background: #fff; color: #0f172a; }
  .card { background: #fff; border-radius: 18px; box-shadow: 0 8px 24px rgba(15,23,42,.08); border: 1px solid #e2e8f0; }
  .card-content { padding: 22px; }
  .notice-card { background: #ecfeff; border-color: #67e8f9; }
  .notice-card .card-content { display: grid; gap: 8px; padding: 18px; }
  .notice-card h2 { margin: 0; font-size: 18px; }
  .notice-card p { margin: 0; color: #155e75; line-height: 1.5; }
  .main-grid { display: grid; grid-template-columns: minmax(280px,360px) 1fr; gap: 24px; }
  .form-grid { display: grid; gap: 18px; }
  .section-title { display: flex; align-items: center; gap: 10px; }
  .section-title h2 { margin: 0; font-size: 22px; }
  .field-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 700; color: #334155; }
  .field-input { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: 11px 12px; font-size: 16px; outline: none; background: #fff; min-height: 46px; }
  .small-text { font-size: 12px; color: #64748b; margin-top: 6px; }
  .error-text { color: #dc2626; font-weight: 700; }
  .results-grid { padding: 22px; display: grid; grid-template-columns: 1fr 220px; gap: 24px; align-items: center; }
  .results-info { display: grid; gap: 18px; }
  .selected-label { margin: 0; font-size: 13px; color: #64748b; }
  .selected-title { margin: 4px 0; font-size: 28px; }
  .selected-subtitle { margin: 0; color: #475569; }
  .metric-grid,.report-metrics,.import-summary { display: grid; grid-template-columns: repeat(2,minmax(160px,1fr)); gap: 12px; }
  .report-metrics,.import-summary { grid-template-columns: repeat(4,minmax(120px,1fr)); }
  .metric-box { background: #f8fafc; border-radius: 16px; padding: 16px; border: 1px solid #e2e8f0; }
  .metric-label { margin: 0; font-size: 12px; color: #64748b; }
  .metric-value { margin: 8px 0 0; font-size: 25px; font-weight: 900; }
  .results-card.diesel { background: #fef3c7; border-color: #fcd34d; }
  .results-card.petrol { background: #dcfce7; border-color: #4ade80; }
  .results-card.diesel .metric-box,.results-card.petrol .metric-box { background: rgba(255,255,255,.55); }
  .results-card.diesel .metric-box { border-color: #fcd34d; }
  .results-card.petrol .metric-box { border-color: #4ade80; }
  .tank-visual-section { display: grid; justify-items: center; gap: 12px; }
  .tank-visual { position: relative; height: 290px; width: 160px; overflow: hidden; border-radius: 22px; border: 5px solid #334155; background: #fff; box-shadow: inset 0 2px 18px rgba(15,23,42,.15); }
  .tank-fill { position: absolute; left: 0; right: 0; bottom: 0; transition: height 350ms ease,width 350ms ease; }
  .tank-fill.level-empty { background: linear-gradient(to top,#991b1b,#ef4444); }
  .tank-fill.level-low { background: linear-gradient(to top,#dc2626,#fb7185); }
  .tank-fill.level-warning { background: linear-gradient(to top,#ea580c,#fb923c); }
  .tank-fill.level-medium { background: linear-gradient(to top,#ca8a04,#facc15); }
  .tank-fill.level-good { background: linear-gradient(to top,#65a30d,#a3e635); }
  .tank-fill.level-full { background: linear-gradient(to top,#15803d,#4ade80); }
  .tank-center { position: absolute; inset: 0; display: grid; place-items: center; }
  .tank-badge { background: rgba(255,255,255,.86); border-radius: 14px; padding: 10px 14px; text-align: center; box-shadow: 0 8px 20px rgba(15,23,42,.12); }
  .tank-caption { margin: 0; font-size: 13px; color: #64748b; }
  .tank-status-badge { border-radius: 999px; padding: 7px 11px; font-size: 12px; font-weight: 900; color: #fff; background: var(--level-color,#0f172a); }
  .history-level-cell { min-width: 160px; }
  .history-level-bar { width: 140px; height: 14px; border-radius: 999px; overflow: hidden; background: #e2e8f0; border: 1px solid #cbd5e1; }
  .history-level-fill { height: 100%; width: var(--history-level-width,0%); background: var(--level-color,#0f172a); border-radius: 999px; }
  .history-level-text { display: flex; gap: 8px; align-items: center; margin-top: 5px; font-size: 12px; font-weight: 900; color: var(--level-color,#0f172a); }
  .history-header { margin-bottom: 16px; display: flex; justify-content: space-between; gap: 14px; align-items: center; }
  .history-header h2 { margin: 0; font-size: 22px; }
  .history-header p { margin: 6px 0 0; font-size: 13px; color: #64748b; }
  .history-table-wrap { overflow-x: auto; }
  .history-table { width: 100%; min-width: 950px; border-collapse: collapse; font-size: 14px; }
  .history-table th,.history-table td { text-align: left; padding: 12px 8px; }
  .history-table thead tr,.history-table tbody tr { border-bottom: 1px solid #e2e8f0; }
  .history-table thead { color: #64748b; }
  .unloading-grid { display: grid; grid-template-columns: repeat(3,minmax(160px,1fr)); gap: 12px; }
  .unloading-actions,.filter-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .edit-banner { background: #eff6ff; border: 1px solid #93c5fd; color: #1e3a8a; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; }
  .filter-panel,.import-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; display: grid; gap: 14px; }
  .import-box { border: 2px dashed #94a3b8; border-radius: 18px; padding: 18px; }
  .warning-box { background: #fff7ed; border: 1px solid #fb923c; color: #9a3412; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; }
  .report-list { display: grid; gap: 14px; }
  .report-card { border: 1px solid #e2e8f0; border-radius: 16px; background: #f8fafc; padding: 16px; display: grid; gap: 12px; }
  .report-top { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: flex-start; }
  .report-title { margin: 0; font-size: 18px; font-weight: 900; }
  .report-subtitle { margin: 5px 0 0; font-size: 13px; color: #64748b; }
  .report-pill { border-radius: 999px; background: #e2e8f0; padding: 7px 11px; font-size: 12px; font-weight: 900; }
  .report-lines { display: grid; gap: 8px; }
  .report-line { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; font-size: 13px; line-height: 1.45; }
  .report-line.diesel,.history-row-diesel { background: #fef9c3; }
  .report-line.petrol,.history-row-petrol { background: #dcfce7; }
  .report-line.diesel { border-color: #facc15; }
  .report-line.petrol { border-color: #4ade80; }
  .product-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 900; border: 1px solid transparent; }
  .product-badge.diesel,.metric-box.diesel { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
  .product-badge.petrol,.metric-box.petrol { background: #dcfce7; color: #166534; border-color: #4ade80; }
  .metric-box.diesel-diff { background: #fff7ed; border-color: #fb923c; }
  .metric-box.petrol-diff { background: #ecfdf5; border-color: #22c55e; }
  .variance-positive { color: #15803d; }
  .variance-negative { color: #dc2626; }
  .login-shell { min-height: 100vh; background: linear-gradient(135deg,#0f172a,#334155); padding: 20px; display: grid; place-items: center; font-family: Arial,sans-serif; color: #0f172a; }
  .login-card { width: 100%; max-width: 420px; background: #fff; border-radius: 24px; box-shadow: 0 24px 70px rgba(0,0,0,.35); padding: 24px; display: grid; gap: 18px; }
  .login-logo { height: 58px; width: 58px; border-radius: 18px; background: #0f172a; color: #fff; display: grid; place-items: center; font-size: 28px; }
  .login-title { margin: 0; font-size: 28px; line-height: 1.1; }
  .login-subtitle { margin: 8px 0 0; color: #64748b; line-height: 1.5; }
  .login-form { display: grid; gap: 14px; }
  .login-error { margin: 0; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 14px; padding: 10px 12px; font-size: 13px; font-weight: 700; }
  @media (max-width:760px) {
    .app-shell { padding: 14px; padding-bottom: 28px; }
    .app-container { gap: 14px; }
    .app-header { display: grid; gap: 12px; align-items: start; }
    .app-title { font-size: 27px; }
    .status-row,.status-pill,.logout-button { width: 100%; text-align: center; }
    .page-nav { display: grid; grid-template-columns: 1fr; }
    .main-grid,.unloading-grid { grid-template-columns: 1fr; gap: 14px; }
    .card-content { padding: 16px; }
    .field-input { min-height: 52px; font-size: 17px; border-radius: 14px; }
    .primary-button,.secondary-button { width: 100%; min-height: 54px; font-size: 16px; border-radius: 16px; }
    .results-grid { padding: 16px; grid-template-columns: 1fr; gap: 16px; }
    .metric-grid,.report-metrics,.import-summary { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
    .tank-visual-section { width: 100%; order: -1; }
    .tank-visual { width: 100%; height: 82px; border-radius: 18px; border-width: 4px; }
    .tank-fill { top: 0; right: auto; height: 100% !important; width: var(--tank-width,0%); }
    .history-table { min-width: 900px; }
  }
`;

const LOGIN_USERS = [
  { username: "admin", password: "1234", role: "Administrator" },
  { username: "staff", password: "0000", role: "Staff" },
];

const SESSION_KEY = "fuelTankLoggedInUser";
const HISTORY_KEY = "fuelTankReadingHistory";
const UNLOADING_HISTORY_KEY = "fuelTankUnloadingHistory";
const SALES_IMPORT_HISTORY_KEY = "fuelTankSalesImportHistory";

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
  if (value <= sorted[0][0]) return sorted[0][1];
  if (value >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1];
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const [mm1, liters1] = sorted[index];
    const [mm2, liters2] = sorted[index + 1];
    if (value >= mm1 && value <= mm2) {
      if (mm2 === mm1) return liters2;
      return liters1 + ((value - mm1) / (mm2 - mm1)) * (liters2 - liters1);
    }
  }
  return 0;
}

function generatePointsFromAnchors(anchors, maxMm) {
  const points = [];
  for (let mm = 0; mm <= maxMm; mm += 1) points.push([mm, Math.round(interpolateLiters(mm, anchors))]);
  return points;
}

const totalTank1Anchors = [[0, 6], [100, 392], [200, 1062], [300, 1930], [400, 2957], [490, 3826], [496, 3898], [500, 3946], [600, 5200], [800, 7900], [1000, 10925], [1200, 13901], [1400, 16851], [1600, 19298], [1800, 21047], [2000, 22214], [2200, 24000], [2342, 25026]];

const stations = {
  petromocVilankulo: {
    name: "PETROMOC VILANKULO",
    location: "Vilankulo",
    tanks: {
      tank1: { name: "Tank 1", product: "Diesel", capacity: 29500, maxMm: 2182, points: [[1, 0], [10, 0], [62, 250], [95, 500], [128, 750], [154, 1000], [208, 1500], [245, 2000], [300, 2500], [341, 3000], [417, 4000], [490, 5000], [560, 6000], [625, 7000], [690, 8000], [754, 9000], [815, 10000], [879, 11000], [939, 12000], [1062, 14000], [1183, 16000], [1303, 18000], [1360, 19000], [1415, 20000], [1480, 21000], [1542, 22000], [1610, 23000], [1678, 24000], [1750, 25000], [1822, 26000], [1903, 27000], [1947, 27500], [1995, 28000], [2046, 28500], [2115, 29000], [2140, 29250], [2182, 29500]] },
      tank2: { name: "Tank 2", product: "Petrol", capacity: 15000, maxMm: 1715, points: [[1, 5], [15, 10], [64, 250], [110, 500], [156, 750], [196, 1000], [261, 1500], [294, 1750], [327, 2000], [357, 2250], [387, 2500], [416, 2750], [445, 3000], [552, 4000], [651, 5000], [675, 5250], [699, 5500], [723, 5750], [747, 6000], [930, 8000], [1025, 9000], [1120, 10000], [1144, 10250], [1168, 10500], [1192, 10750], [1216, 11000], [1267, 11500], [1318, 12000], [1367, 12500], [1418, 13000], [1447, 13250], [1476, 13500], [1533, 14000], [1594, 14500], [1632, 14750], [1675, 15000], [1715, 15250]] },
      tank3: { name: "Tank 3", product: "Diesel", capacity: 10000, maxMm: 1572, points: [[1, 3], [86, 250], [151, 500], [208, 750], [258, 1000], [349, 1500], [430, 2000], [468, 2250], [506, 2500], [542, 2750], [578, 3000], [717, 4000], [852, 5000], [885, 5250], [918, 5500], [951, 5750], [984, 6000], [1018, 6250], [1052, 6500], [1086, 6750], [1120, 7000], [1189, 7500], [1258, 8000], [1331, 8500], [1404, 9000], [1443, 9250], [1485, 9500], [1528, 9750], [1572, 10000]] },
      tank4: { name: "Tank 4", product: "Petrol", capacity: 15000, maxMm: 1753, points: [[1, 0], [64, 250], [109, 500], [155, 750], [198, 1000], [271, 1500], [338, 2000], [369, 2250], [400, 2500], [675, 5000], [700, 5250], [725, 5500], [750, 5750], [775, 6000], [960, 8000], [1161, 10000], [1262, 11000], [1289, 11250], [1316, 11500], [1343, 11750], [1370, 12000], [1398, 12250], [1426, 12500], [1485, 13000], [1510, 13250], [1535, 13500], [1596, 14000], [1630, 14250], [1668, 14500], [1707, 14750], [1753, 15000]] },
    },
  },
  totalVilankulo: {
    name: "TOTAL VILANKULO",
    location: "Vilankulo",
    tanks: {
      tank1: { name: "Tank 1", product: "Diesel", capacity: 25026, maxMm: 2342, points: generatePointsFromAnchors(totalTank1Anchors, 2342) },
      tank2: { name: "Tank 2", product: "Diesel", capacity: 24805, maxMm: 2328, points: generatePointsFromAnchors([[0, 9], [496, 4461], [1000, 13273], [1500, 22000], [2328, 24805]], 2328) },
      tank3: { name: "Tank 3", product: "Petrol", capacity: 13987, maxMm: 1802, points: generatePointsFromAnchors([[0, 1], [500, 3000], [1000, 7800], [1500, 12200], [1802, 13987]], 1802) },
      tank4: { name: "Tank 4", product: "Petrol", capacity: 13956, maxMm: 1800, points: generatePointsFromAnchors([[0, 1], [500, 3000], [1000, 7750], [1500, 12150], [1800, 13956]], 1800) },
    },
  },
};

function createTruckDeliveryId(reference, truckPlate, driverName) {
  const raw = `${reference || ""}-${truckPlate || ""}-${driverName || ""}`;
  let cleaned = "";
  let lastDash = false;
  raw.toUpperCase().split("").forEach((character) => {
    const isLetter = character >= "A" && character <= "Z";
    const isNumber = character >= "0" && character <= "9";
    if (isLetter || isNumber) { cleaned += character; lastDash = false; }
    else if (!lastDash && cleaned) { cleaned += "-"; lastDash = true; }
  });
  cleaned = cleaned.endsWith("-") ? cleaned.slice(0, -1) : cleaned;
  return cleaned || "TRUCK-DELIVERY-NOT-ENTERED";
}

function calculateUnloading(initialMm, finalMm, points = [], invoiceLiters = "") {
  const initialValue = Number(initialMm);
  const finalValue = Number(finalMm);
  const invoiceValue = Number(invoiceLiters);
  if (!Number.isFinite(initialValue) || !Number.isFinite(finalValue)) return { initialLiters: 0, finalLiters: 0, deliveredLiters: 0, invoiceLiters: Number.isFinite(invoiceValue) ? invoiceValue : 0, variance: 0, hasValidReadings: false };
  const initialLiters = interpolateLiters(initialValue, points);
  const finalLiters = interpolateLiters(finalValue, points);
  const deliveredLiters = finalLiters - initialLiters;
  const cleanInvoice = Number.isFinite(invoiceValue) ? invoiceValue : 0;
  return { initialLiters, finalLiters, deliveredLiters, invoiceLiters: cleanInvoice, variance: cleanInvoice > 0 ? deliveredLiters - cleanInvoice : 0, hasValidReadings: true };
}

function parseSimpleCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];
    if (character === '"') {
      if (quoted && nextCharacter === '"') { current += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { cells.push(current.trim()); current = ""; }
    else current += character;
  }
  cells.push(current.trim());
  return cells;
}

function cleanReportNumber(value) {
  const text = String(value || "").replaceAll("MT", "").replaceAll("mt", "").replaceAll("L", "").replaceAll("l", "").replaceAll(",", "").trim();
  const number = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function isSlashDate(value) {
  const parts = String(value || "").trim().split("/");
  return parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4;
}

function slashDateToIso(value) {
  const parts = String(value || "").trim().split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function getProductClass(product) {
  const value = String(product || "").toLowerCase();
  if (value.includes("diesel")) return "diesel";
  if (value.includes("petrol")) return "petrol";
  return "";
}

function parseNetposWetSalesCsv(text, fallbackStationId = "petromocVilankulo") {
  const cleanText = String(text || "").replaceAll(String.fromCharCode(13), "");
  const lines = cleanText.split(String.fromCharCode(10));
  const salesRows = [];
  const skippedRows = [];
  let currentDate = "";
  let stationId = fallbackStationId;
  lines.forEach((line, index) => {
    const cells = parseSimpleCsvLine(line).map((cell) => cell.trim()).filter(Boolean);
    if (cells.length === 0) return;
    const joined = cells.join(" ");
    const lower = joined.toLowerCase();
    if (lower.includes("petromoc")) stationId = "petromocVilankulo";
    const dateCell = cells.find((cell) => isSlashDate(cell));
    if (dateCell && !lower.includes("dates:")) { currentDate = dateCell; if (cells.length === 1) return; }
    if (lower.includes("day total") || lower.includes("grand total")) return;
    const tankCell = cells.find((cell) => Number.isInteger(Number(cell)) && Number(cell) >= 1 && Number(cell) <= 20);
    const litersCell = cells.find((cell) => cell.toLowerCase().includes("l") && cleanReportNumber(cell) > 0);
    if (!currentDate || !tankCell || !litersCell) { if (tankCell && !litersCell) skippedRows.push({ line: index + 1, reason: "Tank row found but litres missing" }); return; }
    const station = stations[stationId] || stations.petromocVilankulo;
    const tankId = `tank${tankCell}`;
    const tank = station.tanks?.[tankId];
    const moneyCells = cells.filter((cell) => cell.toLowerCase().includes("mt"));
    salesRows.push({ id: makeId(), date: slashDateToIso(currentDate), displayDate: currentDate, stationId, station: station.name, tankId, tank: tank?.name || `Tank ${tankCell}`, tankNumber: tankCell, product: tank?.product || "Unknown", liters: cleanReportNumber(litersCell), cos: cleanReportNumber(moneyCells[0]), gross: cleanReportNumber(moneyCells[1]), vat: cleanReportNumber(moneyCells[2]), amount: cleanReportNumber(moneyCells[3] || moneyCells[moneyCells.length - 1]) });
  });
  return { rows: salesRows, skippedRows };
}

function getDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthDateRange(monthValue) {
  if (!monthValue) return { from: "", to: "" };
  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return { from: "", to: "" };
  return { from: getDateInputValue(new Date(year, monthIndex, 1)), to: getDateInputValue(new Date(year, monthIndex + 1, 0)) };
}

function parseSavedDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function filterRowsByDateRange(rows = [], fromDate = "", toDate = "") {
  const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
  const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
  return rows.filter((row) => {
    const rowDate = parseSavedDate(row.date);
    if (!rowDate) return true;
    if (from && rowDate < from) return false;
    if (to && rowDate > to) return false;
    return true;
  });
}

function buildDeliveryReports(unloadingRows = []) {
  const groups = new Map();
  unloadingRows.forEach((row) => {
    const key = row.deliveryId || createTruckDeliveryId(row.reference, row.truckPlate, row.driverName);
    if (!groups.has(key)) groups.set(key, { deliveryId: key, reference: row.reference || "Not entered", truckPlate: row.truckPlate || "Not entered", driverName: row.driverName || "Not entered", date: row.date, rows: [], totalReceived: 0, totalInvoice: 0, totalVariance: 0, dieselReceived: 0, petrolReceived: 0, dieselVariance: 0, petrolVariance: 0 });
    const group = groups.get(key);
    const delivered = Number(row.deliveredLiters) || 0;
    const invoice = Number(row.invoiceLiters) || 0;
    const variance = Number(row.variance) || 0;
    group.rows.push(row);
    group.totalReceived += delivered;
    group.totalInvoice += invoice;
    group.totalVariance += variance;
    if (getProductClass(row.product) === "diesel") { group.dieselReceived += delivered; group.dieselVariance += variance; }
    if (getProductClass(row.product) === "petrol") { group.petrolReceived += delivered; group.petrolVariance += variance; }
  });
  return Array.from(groups.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function getTankLevelInfo(percentage) {
  const value = Number(percentage) || 0;
  if (value <= 10) return { className: "level-empty", label: "Empty / Critical", color: "#dc2626" };
  if (value <= 25) return { className: "level-low", label: "Low", color: "#ef4444" };
  if (value <= 45) return { className: "level-warning", label: "Warning", color: "#f97316" };
  if (value <= 65) return { className: "level-medium", label: "Medium", color: "#eab308" };
  if (value <= 85) return { className: "level-good", label: "Good", color: "#84cc16" };
  return { className: "level-full", label: "Full / Near Full", color: "#22c55e" };
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function makeId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeLocalStorageGet(key, fallback) {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try { const saved = window.localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; } catch { return fallback; }
}

function safeLocalStorageSet(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator?.standalone === true);
}

function Card({ children, style, className = "" }) { return <div className={`card ${className}`} style={style}>{children}</div>; }
function FieldLabel({ children }) { return <label className="field-label">{children}</label>; }
function ProductBadge({ product }) { return <span className={`product-badge ${getProductClass(product)}`}>{product}</span>; }

function HistoryLevelVisual({ percentage }) {
  const level = getTankLevelInfo(percentage);
  const safePercentage = Math.max(0, Math.min(Number(percentage) || 0, 100));
  return <div className="history-level-cell" style={{ "--level-color": level.color }}><div className="history-level-bar"><div className="history-level-fill" style={{ "--history-level-width": `${safePercentage}%` }} /></div><div className="history-level-text"><span>{formatNumber(safePercentage)}%</span><span>{level.label}</span></div></div>;
}

export default function FuelTankPWAPrototype() {
  const [loggedInUser, setLoggedInUser] = useState(() => safeLocalStorageGet(SESSION_KEY, null));
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePage, setActivePage] = useState("daily");
  const [selectedStationId, setSelectedStationId] = useState("petromocVilankulo");
  const [selectedTankId, setSelectedTankId] = useState("tank1");
  const [readingMm, setReadingMm] = useState("");
  const [dailyReadings, setDailyReadings] = useState({});
  const [operator, setOperator] = useState("");
  const [history, setHistory] = useState(() => safeLocalStorageGet(HISTORY_KEY, []));
  const [unloadingHistory, setUnloadingHistory] = useState(() => safeLocalStorageGet(UNLOADING_HISTORY_KEY, []));
  const [salesImportHistory, setSalesImportHistory] = useState(() => safeLocalStorageGet(SALES_IMPORT_HISTORY_KEY, []));
  const [salesImportStatus, setSalesImportStatus] = useState("No sales file imported yet.");
  const [unloadInitialMm, setUnloadInitialMm] = useState("");
  const [unloadFinalMm, setUnloadFinalMm] = useState("");
  const [truckInvoiceLiters, setTruckInvoiceLiters] = useState("");
  const [deliveryTankReadings, setDeliveryTankReadings] = useState({});
  const [unloadReference, setUnloadReference] = useState("");
  const [truckPlate, setTruckPlate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [editingUnloadingId, setEditingUnloadingId] = useState(null);
  const [reportMonth, setReportMonth] = useState(() => getMonthInputValue());
  const firstRange = useMemo(() => getMonthDateRange(getMonthInputValue()), []);
  const [reportFromDate, setReportFromDate] = useState(firstRange.from);
  const [reportToDate, setReportToDate] = useState(firstRange.to);
  const [isInstalled] = useState(() => isStandaloneApp());
  const unloadingSectionRef = useRef(null);

  const station = stations[selectedStationId] || stations.petromocVilankulo;
  const stationTanks = station.tanks || {};
  const tank = stationTanks[selectedTankId] || Object.values(stationTanks)[0];
  const capacity = Number(tank?.capacity) || 0;
  const maxMm = Number(tank?.maxMm) || 0;
  const liters = useMemo(() => interpolateLiters(readingMm, tank?.points || []), [readingMm, tank]);
  const percentage = capacity > 0 ? Math.min((liters / capacity) * 100, 100) : 0;
  const tankLevelInfo = useMemo(() => getTankLevelInfo(percentage), [percentage]);
  const ullage = Math.max(capacity - liters, 0);
  const unloading = useMemo(() => calculateUnloading(unloadInitialMm, unloadFinalMm, tank?.points || [], truckInvoiceLiters), [unloadInitialMm, unloadFinalMm, tank, truckInvoiceLiters]);
  const currentDeliveryId = useMemo(() => createTruckDeliveryId(unloadReference, truckPlate, driverName), [unloadReference, truckPlate, driverName]);
  const selectedStationName = station.name;
  const stationReadingHistory = useMemo(() => history.filter((row) => row.station === selectedStationName), [history, selectedStationName]);
  const stationUnloadingHistory = useMemo(() => unloadingHistory.filter((row) => row.station === selectedStationName), [unloadingHistory, selectedStationName]);
  const filteredUnloadingHistory = useMemo(() => filterRowsByDateRange(stationUnloadingHistory, reportFromDate, reportToDate), [stationUnloadingHistory, reportFromDate, reportToDate]);
  const deliveryReports = useMemo(() => buildDeliveryReports(filteredUnloadingHistory), [filteredUnloadingHistory]);
  const stationSalesImportHistory = useMemo(() => salesImportHistory.filter((row) => row.station === selectedStationName), [salesImportHistory, selectedStationName]);
  const salesTotals = useMemo(() => stationSalesImportHistory.reduce((total, row) => { const litres = Number(row.liters) || 0; total.liters += litres; total.amount += Number(row.amount) || 0; if (getProductClass(row.product) === "diesel") total.diesel += litres; if (getProductClass(row.product) === "petrol") total.petrol += litres; return total; }, { liters: 0, amount: 0, diesel: 0, petrol: 0 }), [stationSalesImportHistory]);
  const filteredReportTotals = useMemo(() => filteredUnloadingHistory.reduce((total, row) => { const delivered = Number(row.deliveredLiters) || 0; const invoice = Number(row.invoiceLiters) || 0; const variance = Number(row.variance) || 0; total.received += delivered; total.invoice += invoice; total.variance += variance; if (getProductClass(row.product) === "diesel") { total.dieselReceived += delivered; total.dieselVariance += variance; } if (getProductClass(row.product) === "petrol") { total.petrolReceived += delivered; total.petrolVariance += variance; } return total; }, { received: 0, invoice: 0, variance: 0, dieselReceived: 0, petrolReceived: 0, dieselVariance: 0, petrolVariance: 0 }), [filteredUnloadingHistory]);

  const readingNumber = Number(readingMm);
  const hasReading = readingMm !== "" && Number.isFinite(readingNumber);
  const readingHasError = (hasReading && readingNumber < 0) || (hasReading && maxMm > 0 && readingNumber > maxMm);
  const unloadInitialNumber = Number(unloadInitialMm);
  const unloadFinalNumber = Number(unloadFinalMm);
  const hasUnloadReadings = unloadInitialMm !== "" && unloadFinalMm !== "" && Number.isFinite(unloadInitialNumber) && Number.isFinite(unloadFinalNumber);
  const unloadReadingHasError = (hasUnloadReadings && unloadInitialNumber < 0) || (hasUnloadReadings && unloadFinalNumber < 0) || (hasUnloadReadings && unloadFinalNumber < unloadInitialNumber) || (hasUnloadReadings && maxMm > 0 && unloadFinalNumber > maxMm);

  const persistHistory = (rows) => { setHistory(rows); safeLocalStorageSet(HISTORY_KEY, rows); };
  const persistUnloadingHistory = (rows) => { setUnloadingHistory(rows); safeLocalStorageSet(UNLOADING_HISTORY_KEY, rows); };
  const persistSalesHistory = (rows) => { setSalesImportHistory(rows); safeLocalStorageSet(SALES_IMPORT_HISTORY_KEY, rows); };

  const selectStation = (stationId, clearReading = true) => {
    setSelectedStationId(stationId);
    setSelectedTankId(Object.keys(stations[stationId]?.tanks || {})[0] || "");
    if (clearReading) { setReadingMm(""); setDailyReadings({}); setUnloadInitialMm(""); setUnloadFinalMm(""); setDeliveryTankReadings({}); }
  };

  const updateDailyReading = (tankId, value) => {
    setDailyReadings((current) => ({ ...current, [tankId]: value }));
  };

  const saveReading = () => {
    const now = new Date().toLocaleString();
    const rowsToSave = Object.entries(stationTanks)
      .map(([tankId, tankItem]) => {
        const mmText = dailyReadings[tankId];
        const mmValue = Number(mmText);
        if (mmText === undefined || mmText === "" || !Number.isFinite(mmValue)) return null;
        if (mmValue < 0 || (Number(tankItem.maxMm) > 0 && mmValue > Number(tankItem.maxMm))) return null;
        const tankLiters = interpolateLiters(mmValue, tankItem.points || []);
        const tankCapacity = Number(tankItem.capacity) || 0;
        const tankPercentage = tankCapacity > 0 ? Math.min((tankLiters / tankCapacity) * 100, 100) : 0;
        const tankUllage = Math.max(tankCapacity - tankLiters, 0);
        return {
          id: makeId(),
          stationId: selectedStationId,
          date: now,
          station: station.name,
          tank: tankItem.name,
          product: tankItem.product,
          mm: mmValue,
          liters: tankLiters,
          percentage: tankPercentage,
          ullage: tankUllage,
          operator: operator || "Not entered",
        };
      })
      .filter(Boolean);

    if (rowsToSave.length === 0) return;
    persistHistory([...rowsToSave, ...history]);
    setDailyReadings({});
  };

  const resetUnloadingForm = () => { setUnloadInitialMm(""); setUnloadFinalMm(""); setTruckInvoiceLiters(""); setDeliveryTankReadings({}); setUnloadReference(""); setTruckPlate(""); setDriverName(""); setEditingUnloadingId(null); };
  const scrollToUnloadingSection = () => setTimeout(() => unloadingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);

  const startEditUnloading = (row) => {
    setActivePage("delivery");
    const stationEntry = Object.entries(stations).find(([, item]) => item.name === row.station);
    const nextStationId = stationEntry?.[0] || selectedStationId;
    const tankEntry = stationEntry ? Object.entries(stationEntry[1].tanks).find(([, item]) => item.name === row.tank && item.product === row.product) : null;
    setSelectedStationId(nextStationId);
    if (tankEntry) setSelectedTankId(tankEntry[0]);
    setDeliveryTankReadings(tankEntry ? { [tankEntry[0]]: { initialMm: String(row.initialMm ?? ""), finalMm: String(row.finalMm ?? ""), invoiceLiters: row.invoiceLiters ? String(row.invoiceLiters) : "" } } : {});
    setUnloadInitialMm(String(row.initialMm ?? ""));
    setUnloadFinalMm(String(row.finalMm ?? ""));
    setTruckInvoiceLiters(row.invoiceLiters ? String(row.invoiceLiters) : "");
    setUnloadReference(row.reference === "Not entered" ? "" : row.reference || "");
    setTruckPlate(row.truckPlate === "Not entered" ? "" : row.truckPlate || "");
    setDriverName(row.driverName === "Not entered" ? "" : row.driverName || "");
    setOperator(row.operator === "Not entered" ? "" : row.operator || "");
    setEditingUnloadingId(row.id);
    scrollToUnloadingSection();
  };

  const updateDeliveryTankReading = (tankId, field, value) => {
    setDeliveryTankReadings((current) => ({
      ...current,
      [tankId]: {
        ...(current[tankId] || {}),
        [field]: value,
      },
    }));
  };

  const getDeliveryLineCalculation = (tankItem, line = {}) => {
    return calculateUnloading(line.initialMm, line.finalMm, tankItem?.points || [], line.invoiceLiters || "");
  };

  const saveUnloading = () => {
    const now = new Date().toLocaleString();
    const rowsToSave = Object.entries(stationTanks)
      .map(([tankId, tankItem]) => {
        const line = deliveryTankReadings[tankId] || {};
        const initialValue = Number(line.initialMm);
        const finalValue = Number(line.finalMm);
        const hasLine = line.initialMm !== undefined && line.initialMm !== "" && line.finalMm !== undefined && line.finalMm !== "";
        if (!hasLine || !Number.isFinite(initialValue) || !Number.isFinite(finalValue)) return null;
        if (initialValue < 0 || finalValue < 0 || finalValue < initialValue || (Number(tankItem.maxMm) > 0 && finalValue > Number(tankItem.maxMm))) return null;
        const lineCalculation = getDeliveryLineCalculation(tankItem, line);
        return {
          id: editingUnloadingId && Object.keys(deliveryTankReadings).length === 1 ? editingUnloadingId : makeId(),
          stationId: selectedStationId,
          deliveryId: currentDeliveryId,
          date: now,
          updatedAt: editingUnloadingId ? now : undefined,
          station: station.name,
          tank: tankItem.name,
          product: tankItem.product,
          initialMm: initialValue,
          finalMm: finalValue,
          initialLiters: lineCalculation.initialLiters,
          finalLiters: lineCalculation.finalLiters,
          deliveredLiters: lineCalculation.deliveredLiters,
          invoiceLiters: lineCalculation.invoiceLiters,
          variance: lineCalculation.variance,
          reference: unloadReference || "Not entered",
          truckPlate: truckPlate || "Not entered",
          driverName: driverName || "Not entered",
          operator: operator || "Not entered",
        };
      })
      .filter(Boolean);

    if (rowsToSave.length === 0) return;
    if (editingUnloadingId) {
      persistUnloadingHistory([...rowsToSave, ...unloadingHistory.filter((row) => row.id !== editingUnloadingId)]);
      resetUnloadingForm();
      return;
    }
    persistUnloadingHistory([...rowsToSave, ...unloadingHistory]);
    resetUnloadingForm();
  };

  const handleSalesCsvFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = parseNetposWetSalesCsv(await file.text(), selectedStationId);
      const importId = makeId();
      const importedAt = new Date().toLocaleString();
      const rows = parsed.rows.map((row) => ({ ...row, stationId: selectedStationId, station: station.name, importId, importedAt, fileName: file.name }));
      persistSalesHistory([...rows, ...salesImportHistory]);
      setSalesImportStatus(`Imported ${rows.length} sales rows from ${file.name}. Skipped ${parsed.skippedRows.length} rows.`);
    } catch (error) {
      console.error(error);
      setSalesImportStatus("Could not import this CSV file. Try exporting again from NetPOS as CSV.");
    } finally { event.target.value = ""; }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const user = LOGIN_USERS.find((item) => item.username.toLowerCase() === loginUsername.trim().toLowerCase() && item.password === loginPassword);
    if (!user) { setLoginError("Wrong username or password."); return; }
    const safeUser = { username: user.username, role: user.role };
    safeLocalStorageSet(SESSION_KEY, safeUser);
    setLoggedInUser(safeUser);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
  };

  const handleLogout = () => { if (typeof window !== "undefined" && window.localStorage) window.localStorage.removeItem(SESSION_KEY); setLoggedInUser(null); };

  if (!loggedInUser) {
    return <div className="login-shell"><style>{styles}</style><div className="login-card"><div className="login-logo">⛽</div><div><h1 className="login-title">Fuel Tank Reading</h1><p className="login-subtitle">Login to access tank readings and saved history.</p></div><form className="login-form" onSubmit={handleLogin}><div><FieldLabel>Username</FieldLabel><input className="field-input" value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} placeholder="admin" autoComplete="username" /></div><div><FieldLabel>Password</FieldLabel><input className="field-input" type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Enter password" autoComplete="current-password" /></div>{loginError ? <p className="login-error">{loginError}</p> : null}<button type="submit" className="primary-button">🔐 Login</button></form><p className="small-text" style={{ margin: 0 }}>Temporary test logins: admin / 1234 or staff / 0000. Change these before real use.</p></div></div>;
  }

  const stationSelector = (clearReading) => <div><FieldLabel>Station</FieldLabel><select value={selectedStationId} onChange={(event) => selectStation(event.target.value, clearReading)} className="field-input">{Object.entries(stations).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></div>;
  const tankSelector = (clearDaily, clearUnload) => <div><FieldLabel>{clearUnload ? "Tank / Product" : "Tank"}</FieldLabel><select value={selectedTankId} onChange={(event) => { setSelectedTankId(event.target.value); if (clearDaily) setReadingMm(""); if (clearUnload) { setUnloadInitialMm(""); setUnloadFinalMm(""); } }} className="field-input">{Object.entries(stationTanks).map(([id, item]) => <option key={id} value={id}>{item.name} — {item.product}</option>)}</select></div>;

  return <div className="app-shell"><style>{styles}</style><div className="app-container">
    <header className="app-header"><div><h1 className="app-title">Fuel Tank Reading</h1><p className="app-subtitle">Fast mobile readings for liters, ullage, truck unloading, and delivery reports.</p></div><div className="status-row"><div className="status-pill">{loggedInUser.username} • {loggedInUser.role}</div><div className="status-pill">{isInstalled ? "Installed app mode" : "PWA-ready"}</div><button type="button" onClick={handleLogout} className="logout-button">Logout</button></div></header>
    <Card className="notice-card"><div className="card-content"><h2>Install on phone or computer</h2><p>On Android/Chrome or Windows/Edge, use the browser install button. On iPhone, open in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p></div></Card>
    <Card><div className="card-content form-grid"><div className="section-title"><span style={{ fontSize: 24 }}>🏪</span><h2>Current Station</h2></div><select value={selectedStationId} onChange={(event) => selectStation(event.target.value, true)} className="field-input">{Object.entries(stations).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select><p className="small-text" style={{ margin: 0 }}>Everything below now belongs only to <strong>{station.name}</strong>: readings, unloading, reports and sales imports.</p></div></Card>
    <nav className="page-nav" aria-label="App pages"><button type="button" className={`page-tab ${activePage === "daily" ? "active" : ""}`} onClick={() => setActivePage("daily")}>⛽ Daily Readings</button><button type="button" className={`page-tab ${activePage === "delivery" ? "active" : ""}`} onClick={() => setActivePage("delivery")}>🚚 Truck Delivery</button><button type="button" className={`page-tab ${activePage === "reports" ? "active" : ""}`} onClick={() => setActivePage("reports")}>📊 Reports</button><button type="button" className={`page-tab ${activePage === "sales" ? "active" : ""}`} onClick={() => setActivePage("sales")}>📥 Sales Import</button></nav>

    {activePage === "daily" ? <><Card><div className="card-content form-grid"><div className="section-title"><span style={{ fontSize: 24 }}>⛽</span><h2>Daily Readings</h2></div><p className="small-text" style={{ margin: 0 }}>Enter all tank readings for <strong>{station.name}</strong> at once. Leave a tank empty if you do not want to save it now.</p><div><FieldLabel>Operator / staff name</FieldLabel><input className="field-input" placeholder="Optional" value={operator} onChange={(event) => setOperator(event.target.value)} /></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Tank</th><th>Product</th><th>Reading MM</th><th>Liters</th><th>Available Space</th><th>Full</th><th>Level</th></tr></thead><tbody>{Object.entries(stationTanks).map(([tankId, tankItem]) => { const mmText = dailyReadings[tankId] || ""; const mmValue = Number(mmText); const hasValue = mmText !== "" && Number.isFinite(mmValue); const isInvalid = hasValue && (mmValue < 0 || (Number(tankItem.maxMm) > 0 && mmValue > Number(tankItem.maxMm))); const tankLiters = hasValue && !isInvalid ? interpolateLiters(mmValue, tankItem.points || []) : 0; const tankCapacity = Number(tankItem.capacity) || 0; const tankPercentage = tankCapacity > 0 ? Math.min((tankLiters / tankCapacity) * 100, 100) : 0; const tankUllage = Math.max(tankCapacity - tankLiters, 0); const tankLevel = getTankLevelInfo(tankPercentage); return <tr key={tankId} className={`history-row-${getProductClass(tankItem.product)}`}><td><strong>{tankItem.name}</strong><div className="small-text" style={{ marginTop: 4 }}>Max {tankItem.maxMm} mm</div></td><td><ProductBadge product={tankItem.product} /></td><td><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={mmText} onChange={(event) => updateDailyReading(tankId, event.target.value)} placeholder="MM" style={{ minWidth: 120 }} />{isInvalid ? <div className="small-text error-text">Invalid reading</div> : null}</td><td><strong>{formatNumber(tankLiters)} L</strong></td><td>{formatNumber(tankUllage)} L</td><td>{formatNumber(tankPercentage)}%</td><td><HistoryLevelVisual percentage={tankPercentage} /></td></tr>; })}</tbody></table></div><div className="unloading-actions"><button type="button" onClick={saveReading} className="primary-button">💾 Save All Entered Readings</button><button type="button" onClick={() => setDailyReadings({})} className="secondary-button">Clear Inputs</button></div></div></Card><Card><div className="card-content"><div className="history-header"><div><h2>Reading History</h2><p>Saved tank readings for {station.name} on this device/browser.</p></div><button type="button" onClick={() => persistHistory(history.filter((row) => row.station !== station.name))} className="secondary-button">🗑️ Clear This Station</button></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Date</th><th>Station</th><th>Tank</th><th>Product</th><th>MM</th><th>Liters</th><th>Level</th><th>Ullage</th><th>Operator</th></tr></thead><tbody>{stationReadingHistory.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={9}>No readings saved yet for this station.</td></tr> : stationReadingHistory.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td>{row.date}</td><td>{row.station}</td><td>{row.tank}</td><td><ProductBadge product={row.product} /></td><td>{row.mm}</td><td>{formatNumber(row.liters)} L</td><td><HistoryLevelVisual percentage={row.percentage} /></td><td>{formatNumber(row.ullage)} L</td><td>{row.operator}</td></tr>)}</tbody></table></div></div></Card></> : null}

    {activePage === "delivery" ? <><Card><div ref={unloadingSectionRef} className="card-content form-grid" style={{ scrollMarginTop: 24 }}><div className="section-title"><span style={{ fontSize: 24 }}>🚚</span><h2>Truck Delivery / Descarregamento</h2></div><p className="small-text" style={{ margin: 0 }}>Enter one truck delivery for <strong>{station.name}</strong>. Fill only the tanks that received fuel; empty tanks will be ignored when saving.</p>{editingUnloadingId ? <div className="edit-banner">Editing one saved unloading line. Update the tank line below, then press Save Delivery Lines.</div> : null}<div className="unloading-grid"><div><FieldLabel>Invoice / delivery note number</FieldLabel><input className="field-input" value={unloadReference} onChange={(event) => setUnloadReference(event.target.value)} placeholder="Example: INV123" /></div><div><FieldLabel>Truck plate</FieldLabel><input className="field-input" value={truckPlate} onChange={(event) => setTruckPlate(event.target.value)} placeholder="Example: ABC-123" /></div><div><FieldLabel>Driver name</FieldLabel><input className="field-input" value={driverName} onChange={(event) => setDriverName(event.target.value)} placeholder="Optional" /></div></div><div><FieldLabel>Operator / staff name</FieldLabel><input className="field-input" placeholder="Optional" value={operator} onChange={(event) => setOperator(event.target.value)} /></div><p className="small-text">Truck Delivery ID: <strong>{currentDeliveryId}</strong></p><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Tank</th><th>Product</th><th>Initial MM</th><th>Final MM</th><th>Invoice L</th><th>Initial L</th><th>Final L</th><th>Received L</th><th>Difference</th></tr></thead><tbody>{Object.entries(stationTanks).map(([tankId, tankItem]) => { const line = deliveryTankReadings[tankId] || {}; const initialValue = Number(line.initialMm); const finalValue = Number(line.finalMm); const hasLine = line.initialMm !== undefined && line.initialMm !== "" && line.finalMm !== undefined && line.finalMm !== ""; const isInvalid = hasLine && (!Number.isFinite(initialValue) || !Number.isFinite(finalValue) || initialValue < 0 || finalValue < 0 || finalValue < initialValue || (Number(tankItem.maxMm) > 0 && finalValue > Number(tankItem.maxMm))); const lineCalculation = getDeliveryLineCalculation(tankItem, line); return <tr key={tankId} className={`history-row-${getProductClass(tankItem.product)}`}><td><strong>{tankItem.name}</strong><div className="small-text" style={{ marginTop: 4 }}>Max {tankItem.maxMm} mm</div></td><td><ProductBadge product={tankItem.product} /></td><td><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={line.initialMm || ""} onChange={(event) => updateDeliveryTankReading(tankId, "initialMm", event.target.value)} placeholder="Before" style={{ minWidth: 115 }} /></td><td><input className="field-input" type="number" inputMode="decimal" min="0" max={tankItem.maxMm} value={line.finalMm || ""} onChange={(event) => updateDeliveryTankReading(tankId, "finalMm", event.target.value)} placeholder="After" style={{ minWidth: 115 }} />{isInvalid ? <div className="small-text error-text">Check readings</div> : null}</td><td><input className="field-input" type="number" inputMode="decimal" min="0" value={line.invoiceLiters || ""} onChange={(event) => updateDeliveryTankReading(tankId, "invoiceLiters", event.target.value)} placeholder="Optional" style={{ minWidth: 120 }} /></td><td>{formatNumber(hasLine && !isInvalid ? lineCalculation.initialLiters : 0)} L</td><td>{formatNumber(hasLine && !isInvalid ? lineCalculation.finalLiters : 0)} L</td><td><strong>{formatNumber(hasLine && !isInvalid ? lineCalculation.deliveredLiters : 0)} L</strong></td><td className={(lineCalculation.variance || 0) >= 0 ? "variance-positive" : "variance-negative"}>{formatNumber(hasLine && !isInvalid ? lineCalculation.variance : 0)} L</td></tr>; })}</tbody></table></div><div className="unloading-actions"><button type="button" onClick={saveUnloading} className="primary-button">💾 Save Delivery Lines</button><button type="button" onClick={resetUnloadingForm} className="secondary-button">Reset</button></div></div></Card><Card><div className="card-content"><div className="history-header"><div><h2>Unloading History</h2><p>Saved truck unloading records for {station.name} on this device/browser.</p></div><button type="button" onClick={() => persistUnloadingHistory(unloadingHistory.filter((row) => row.station !== station.name))} className="secondary-button">🗑️ Clear This Station</button></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Action</th><th>Date</th><th>Delivery ID</th><th>Station</th><th>Tank</th><th>Product</th><th>Initial MM</th><th>Final MM</th><th>Initial L</th><th>Final L</th><th>Received L</th><th>Invoice L</th><th>Diff L</th><th>Reference</th><th>Truck Plate</th><th>Driver</th><th>Operator</th></tr></thead><tbody>{stationUnloadingHistory.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={17}>No unloading records saved yet for this station.</td></tr> : stationUnloadingHistory.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td><button type="button" onClick={() => startEditUnloading(row)} className="secondary-button" style={{ minHeight: 34, padding: "7px 10px" }}>Edit</button></td><td>{row.date}</td><td>{row.deliveryId || createTruckDeliveryId(row.reference, row.truckPlate, row.driverName)}</td><td>{row.station}</td><td>{row.tank}</td><td><ProductBadge product={row.product} /></td><td>{row.initialMm}</td><td>{row.finalMm}</td><td>{formatNumber(row.initialLiters)} L</td><td>{formatNumber(row.finalLiters)} L</td><td>{formatNumber(row.deliveredLiters)} L</td><td>{formatNumber(row.invoiceLiters)} L</td><td className={row.variance >= 0 ? "variance-positive" : "variance-negative"}>{formatNumber(row.variance)} L</td><td>{row.reference}</td><td>{row.truckPlate || "Not entered"}</td><td>{row.driverName || "Not entered"}</td><td>{row.operator}</td></tr>)}</tbody></table></div></div></Card></> : null}

    {activePage === "reports" ? <Card><div className="card-content"><div className="history-header"><div><h2>Truck Delivery Reports</h2><p>Grouped by Truck Delivery ID for {station.name}, filtered by month or custom date range.</p></div></div><div className="filter-panel" style={{ marginBottom: 16 }}><div className="unloading-grid"><div><FieldLabel>Select month</FieldLabel><input className="field-input" type="month" value={reportMonth} onChange={(event) => { const value = event.target.value; const range = getMonthDateRange(value); setReportMonth(value); setReportFromDate(range.from); setReportToDate(range.to); }} /></div><div><FieldLabel>From date</FieldLabel><input className="field-input" type="date" value={reportFromDate} onChange={(event) => { setReportFromDate(event.target.value); setReportMonth(""); }} /></div><div><FieldLabel>To date</FieldLabel><input className="field-input" type="date" value={reportToDate} onChange={(event) => { setReportToDate(event.target.value); setReportMonth(""); }} /></div></div><div className="filter-actions"><button type="button" className="secondary-button" onClick={() => { const month = getMonthInputValue(); const range = getMonthDateRange(month); setReportMonth(month); setReportFromDate(range.from); setReportToDate(range.to); }}>This Month</button><button type="button" className="secondary-button" onClick={() => { setReportMonth(""); setReportFromDate(""); setReportToDate(""); }}>All Dates</button></div><div className="report-metrics"><div className="metric-box"><p className="metric-label">Filtered records</p><p className="metric-value">{filteredUnloadingHistory.length}</p></div><div className="metric-box"><p className="metric-label">Total received</p><p className="metric-value">{formatNumber(filteredReportTotals.received)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel received</p><p className="metric-value">{formatNumber(filteredReportTotals.dieselReceived)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol received</p><p className="metric-value">{formatNumber(filteredReportTotals.petrolReceived)} L</p></div><div className="metric-box"><p className="metric-label">Invoice total</p><p className="metric-value">{formatNumber(filteredReportTotals.invoice)} L</p></div><div className="metric-box"><p className="metric-label">Total difference</p><p className={`metric-value ${filteredReportTotals.variance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(filteredReportTotals.variance)} L</p></div><div className="metric-box diesel-diff"><p className="metric-label">Diesel difference</p><p className={`metric-value ${filteredReportTotals.dieselVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(filteredReportTotals.dieselVariance)} L</p></div><div className="metric-box petrol-diff"><p className="metric-label">Petrol difference</p><p className={`metric-value ${filteredReportTotals.petrolVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(filteredReportTotals.petrolVariance)} L</p></div></div></div><div className="report-list">{deliveryReports.length === 0 ? <p style={{ margin: 0, color: "#64748b" }}>No truck delivery reports for the selected period.</p> : deliveryReports.map((report) => <div key={report.deliveryId} className="report-card"><div className="report-top"><div><p className="report-title">{report.deliveryId}</p><p className="report-subtitle">Invoice: {report.reference} • Truck: {report.truckPlate} • Driver: {report.driverName}</p></div><span className="report-pill">{report.rows.length} tank record{report.rows.length === 1 ? "" : "s"}</span></div><div className="report-metrics"><div className="metric-box"><p className="metric-label">Total received</p><p className="metric-value">{formatNumber(report.totalReceived)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel received</p><p className="metric-value">{formatNumber(report.dieselReceived)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol received</p><p className="metric-value">{formatNumber(report.petrolReceived)} L</p></div><div className="metric-box"><p className="metric-label">Total invoice</p><p className="metric-value">{formatNumber(report.totalInvoice)} L</p></div><div className="metric-box"><p className="metric-label">Total difference</p><p className={`metric-value ${report.totalVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(report.totalVariance)} L</p></div><div className="metric-box diesel-diff"><p className="metric-label">Diesel difference</p><p className={`metric-value ${report.dieselVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(report.dieselVariance)} L</p></div><div className="metric-box petrol-diff"><p className="metric-label">Petrol difference</p><p className={`metric-value ${report.petrolVariance >= 0 ? "variance-positive" : "variance-negative"}`}>{formatNumber(report.petrolVariance)} L</p></div><div className="metric-box"><p className="metric-label">Date</p><p className="metric-value" style={{ fontSize: 16 }}>{report.date || "Not entered"}</p></div></div><div className="report-lines">{report.rows.map((row) => <div key={row.id} className={`report-line ${getProductClass(row.product)}`}><strong>{row.station} • {row.tank}</strong> <ProductBadge product={row.product} /><br />Initial: {row.initialMm}mm / {formatNumber(row.initialLiters)}L → Final: {row.finalMm}mm / {formatNumber(row.finalLiters)}L<br />Received: {formatNumber(row.deliveredLiters)}L • Invoice: {formatNumber(row.invoiceLiters)}L • Difference: <span className={row.variance >= 0 ? "variance-positive" : "variance-negative"}>{formatNumber(row.variance)}L</span><br /><button type="button" onClick={() => startEditUnloading(row)} className="secondary-button" style={{ marginTop: 8, minHeight: 36, padding: "8px 12px" }}>✏️ Edit</button></div>)}</div></div>)}</div></div></Card> : null}

    {activePage === "sales" ? <><Card><div className="card-content form-grid"><div className="section-title"><span style={{ fontSize: 24 }}>📥</span><h2>Sales CSV Import</h2></div><div className="import-box"><p style={{ margin: 0 }}>Upload the NetPOS Wet Sales CSV export. The app will read sales by date, tank and litres.</p><input className="field-input" type="file" accept=".csv,.txt" onChange={handleSalesCsvFile} /><div className="warning-box">{salesImportStatus}</div></div><div className="import-summary"><div className="metric-box"><p className="metric-label">Imported rows</p><p className="metric-value">{stationSalesImportHistory.length}</p></div><div className="metric-box"><p className="metric-label">Total sales</p><p className="metric-value">{formatNumber(salesTotals.liters)} L</p></div><div className="metric-box diesel"><p className="metric-label">Diesel sales</p><p className="metric-value">{formatNumber(salesTotals.diesel)} L</p></div><div className="metric-box petrol"><p className="metric-label">Petrol sales</p><p className="metric-value">{formatNumber(salesTotals.petrol)} L</p></div></div><button type="button" className="secondary-button" onClick={() => { persistSalesHistory([]); setSalesImportStatus("Sales imports cleared."); }}>Clear Imported Sales</button></div></Card><Card><div className="card-content"><div className="history-header"><div><h2>Imported Sales History</h2><p>Rows imported from NetPOS CSV files.</p></div></div><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Date</th><th>Station</th><th>Tank</th><th>Product</th><th>Litres</th><th>Gross</th><th>Amount</th><th>File</th><th>Imported At</th></tr></thead><tbody>{stationSalesImportHistory.length === 0 ? <tr><td style={{ padding: "22px 8px", color: "#64748b" }} colSpan={9}>No sales imported yet for this station.</td></tr> : stationSalesImportHistory.map((row) => <tr key={row.id} className={`history-row-${getProductClass(row.product)}`}><td>{row.displayDate || row.date}</td><td>{row.station}</td><td>{row.tank}</td><td><ProductBadge product={row.product} /></td><td>{formatNumber(row.liters)} L</td><td>MT{formatNumber(row.gross)}</td><td>MT{formatNumber(row.amount)}</td><td>{row.fileName || "CSV"}</td><td>{row.importedAt}</td></tr>)}</tbody></table></div></div></Card></> : null}
  </div></div>;
}
