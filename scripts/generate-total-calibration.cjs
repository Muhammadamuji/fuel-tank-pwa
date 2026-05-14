const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const workbookPath = path.join(
  __dirname,
  "..",
  "calibration",
  "TOTAL_CALIBRATION.xlsx"
);

const workbook = XLSX.readFile(workbookPath);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  raw: true,
});

function cleanNumber(value) {
  if (value === undefined || value === null || value === "") return null;

  const num = Number(
    String(value)
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(num) ? num : null;
}

function extractPair(mmColumn, litersColumn) {
  const points = [];

  rows.forEach((row) => {
    const mm = cleanNumber(row[mmColumn]);
    const liters = cleanNumber(row[litersColumn]);

    if (
      mm !== null &&
      liters !== null &&
      mm >= 0 &&
      liters >= 0
    ) {
      points.push([mm, liters]);
    }
  });

  const unique = [];
  const used = new Set();

  points.forEach((point) => {
    const key = `${point[0]}-${point[1]}`;

    if (!used.has(key)) {
      used.add(key);
      unique.push(point);
    }
  });

  unique.sort((a, b) => a[0] - b[0]);

  return unique;
}

/*
  COLUMN MAP:

  A = Tank1 MM
  B = Tank1 Liters

  D = Tank2 MM
  E = Tank2 Liters

  G = Tank3 MM
  H = Tank3 Liters

  J = Tank4 MM
  K = Tank4 Liters
*/

const tank1 = extractPair(0, 1);
const tank2 = extractPair(3, 4);
const tank3 = extractPair(6, 7);
const tank4 = extractPair(9, 10);

console.log("Tank 1:", tank1.length, tank1[tank1.length - 1]);
console.log("Tank 2:", tank2.length, tank2[tank2.length - 1]);
console.log("Tank 3:", tank3.length, tank3[tank3.length - 1]);
console.log("Tank 4:", tank4.length, tank4[tank4.length - 1]);

const output = `
export const totalTank1Points = ${JSON.stringify(tank1, null, 2)};

export const totalTank2Points = ${JSON.stringify(tank2, null, 2)};

export const totalTank3Points = ${JSON.stringify(tank3, null, 2)};

export const totalTank4Points = ${JSON.stringify(tank4, null, 2)};
`;

const outputPath = path.join(
  __dirname,
  "..",
  "src",
  "totalVilankuloCalibration.js"
);

fs.writeFileSync(outputPath, output);

console.log("\\nCalibration file generated:");
console.log(outputPath);