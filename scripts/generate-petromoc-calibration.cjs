const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const workbookPath = path.join(__dirname, "..", "calibration", "PETROMOC_CALIBRATION.xlsx");
const workbook = XLSX.readFile(workbookPath);
const sheet = workbook.Sheets["Sheet2"];

const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  raw: true,
  defval: "",
});

function cleanNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function extractPair(mmColumn, litersColumn) {
  return rows
    .map((row) => [cleanNumber(row[mmColumn]), cleanNumber(row[litersColumn])])
    .filter(([mm, liters]) => mm !== null && liters !== null && mm >= 0 && liters >= 0)
    .sort((a, b) => a[0] - b[0]);
}

const tank1 = extractPair(0, 1);   // A,B
const tank2 = extractPair(3, 4);   // D,E
const tank3 = extractPair(6, 7);   // G,H
const tank4 = extractPair(9, 10);  // J,K

const output = `// EXACT PETROMOC VILANKULO calibration generated from Excel.

export const petromocTank1Points = ${JSON.stringify(tank1, null, 2)};

export const petromocTank2Points = ${JSON.stringify(tank2, null, 2)};

export const petromocTank3Points = ${JSON.stringify(tank3, null, 2)};

export const petromocTank4Points = ${JSON.stringify(tank4, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "..", "src", "petromocVilankuloCalibration.js"), output);

console.log("Tank 1:", tank1.length, tank1[tank1.length - 1]);
console.log("Tank 2:", tank2.length, tank2[tank2.length - 1]);
console.log("Tank 3:", tank3.length, tank3[tank3.length - 1]);
console.log("Tank 4:", tank4.length, tank4[tank4.length - 1]);