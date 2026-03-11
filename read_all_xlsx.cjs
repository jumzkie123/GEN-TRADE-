const xlsx = require('xlsx');

const files = [
  'Number of Farmers.xlsx',
  'Production Area by Barangay (Different Commodities).xlsx',
  'Volume of Production by Barangay (Different Commodities).xlsx'
];

files.forEach(file => {
  try {
    const workbook = xlsx.readFile(`c:\\Users\\Admin\\Downloads\\GEN. TRADE -TERRITORY\\${file}`);
    console.log(`\n=== ${file} ===`);
    workbook.SheetNames.forEach(sheetName => {
      console.log(`  Sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`  Headers (row 0):`, JSON.stringify(data[0] || []));
      console.log(`  Row 1:`, JSON.stringify(data[1] || []));
      console.log(`  Row 2:`, JSON.stringify(data[2] || []));
      console.log(`  Total rows:`, data.length);
    });
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
});
