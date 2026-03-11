const xlsx = require('xlsx');

// Get NUMBER OF FARMERS column headers
const wbFarm = xlsx.readFile(`c:\\Users\\Admin\\Downloads\\GEN. TRADE -TERRITORY\\Number of Farmers.xlsx`);
const wsFarm = wbFarm.Sheets['Sheet1'];
const farmData = xlsx.utils.sheet_to_json(wsFarm, { header: 1 });
console.log("=== Number of Farmers - All rows ===");
farmData.forEach((row, i) => {
  if (row && row.length > 0) console.log(`Row ${i}:`, JSON.stringify(row));
});

// Get VOLUME OF PRODUCTION column headers
const wbVol = xlsx.readFile(`c:\\Users\\Admin\\Downloads\\GEN. TRADE -TERRITORY\\Volume of Production by Barangay (Different Commodities).xlsx`);
const wsVol = wbVol.Sheets['Volume of Prod. per Barangay (1'];
const volData = xlsx.utils.sheet_to_json(wsVol, { header: 1 });
console.log("\n=== Volume of Production Sheet 1 - All rows ===");
volData.forEach((row, i) => {
  if (row && row.length > 0) console.log(`Row ${i}:`, JSON.stringify(row));
});
