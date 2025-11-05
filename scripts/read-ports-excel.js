const XLSX = require('xlsx');

// Read the Excel file
const filePath = 'C:\\Users\\Lenovo\\OneDrive\\Documents\\UNLOCODE Comparision Sep 2025.xlsx';

console.log('Reading Excel file:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  
  console.log('\nSheet Names:', workbook.SheetNames);
  
  // Check each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n=== Sheet ${index + 1}: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Total rows:', data.length);
    console.log('Column headers:', Object.keys(data[0] || {}));
    
    // Show first row
    if (data.length > 0) {
      console.log('First row sample:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
    // Check for Function column
    const funcColumn = Object.keys(data[0] || {}).find(key => 
      key.toLowerCase().includes('function') || key.toLowerCase().includes('func')
    );
    
    if (funcColumn) {
      console.log('\nFunction column found:', funcColumn);
      
      // Count ports with Function = 1
      const seaPorts = data.filter(row => {
        const func = row[funcColumn];
        return func && func.toString().includes('1');
      });
      
      console.log('Ports with Function = 1 (sea ports):', seaPorts.length);
      
      if (seaPorts.length > 0) {
        console.log('\nFirst sea port example:');
        console.log(JSON.stringify(seaPorts[0], null, 2));
      }
    }
  });
  
} catch (error) {
  console.error('Error reading Excel file:', error.message);
  process.exit(1);
}
