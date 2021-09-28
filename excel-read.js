function parseExcel() {
  const xlsx = require('xlsx');
  const fs = require('fs');
  const excel = xlsx.readFile('map.xlsx');
  const sheetName = excel.SheetNames[0];
  const firstSheet = excel.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(firstSheet, { defval : "" });

  const latlng = jsonData.map((data, index) => {
    return { 
      index: index + 2,
      roadName: data['placePostAddress'],
      name: data['placeName'],
      lat: data['latitude'], 
      lng: data['longitude']
    }
  });

  fs.writeFile('./public/latlng.json', JSON.stringify(latlng), 'utf8', () => {
    console.log('Done');  
  });
}

module.exports = parseExcel;
