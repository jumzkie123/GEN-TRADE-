const xlsx = require('xlsx');
try {
  const workbook = xlsx.readFile('c:\\\\Users\\\\Admin\\\\Downloads\\\\GEN. TRADE -TERRITORY\\\\Production Area by Barangay (Different Commodities).xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  console.log("Headers:", data[0] || []);
  console.log("Row 1:", data[1] || []);
  console.log("Row 2:", data[2] || []);
} catch (e) {
  console.error("Error reading file:", e.message);
}
