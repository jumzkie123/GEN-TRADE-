const xlsx = require('xlsx');

// Read the detailed sheets
const files = [
  { name: 'Number of Farmers.xlsx', startRow: 3 },
  { name: 'Volume of Production by Barangay (Different Commodities).xlsx', startRow: 3 },
];

files.forEach(({ name, startRow }) => {
  try {
    const workbook = xlsx.readFile(`c:\\Users\\Admin\\Downloads\\GEN. TRADE -TERRITORY\\${name}`);
    console.log(`\n=== ${name} ===`);
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`  Sheet: ${sheetName}`);
      for(let i = 0; i < Math.min(8, data.length); i++) {
        if (data[i] && data[i].length > 0) {
          console.log(`  Row ${i}:`, JSON.stringify(data[i]));
        }
      }
    });
  } catch (e) {
    console.error(`Error reading ${name}:`, e.message);
  }
});
