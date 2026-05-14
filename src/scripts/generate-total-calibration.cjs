const XLSX = require("xlsx");
const fs = require("fs");

const workbook = XLSX.readFile("calibration/TOTAL_CALIBRATION.xlsx");
const sheet = workbook.Sheets["Sheet1"];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

function extractPair(mmCol, litersCol) {
  return rows
    .map(row => [Number(row[mmCol]), Number(row[litersCol])])
    .filter(([mm, liters]) => Number.isFinite(mm) && Number.isFinite(liters))
    .sort((a, b) => a[0] - b[0]);
}

const tank1 = extractPair(1, 2);   // columns B,C
const tank2 = extractPair(4, 5);   // columns E,F
const tank3 = extractPair(7, 8);   // columns H,I
const tank4 = extractPair(10, 11); // columns K,L

const output = `// EXACT TOTAL VILANKULO calibration generated from Excel.
// Do not edit manually.

export const totalTank1Points = ${JSON.stringify(tank1, null, 2)};

export const totalTank2Points = ${JSON.stringify(tank2, null, 2)};

export const totalTank3Points = ${JSON.stringify(tank3, null, 2)};

export const totalTank4Points = ${JSON.stringify(tank4, null, 2)};
`;

fs.writeFileSync("src/totalVilankuloCalibration.js", output);

console.log("Generated src/totalVilankuloCalibration.js");
console.log("Tank 1 points:", tank1.length);
console.log("Tank 2 points:", tank2.length);
console.log("Tank 3 points:", tank3.length);
console.log("Tank 4 points:", tank4.length);
console.log("Check Tank 1 496mm:", tank1.find(p => p[0] === 496));