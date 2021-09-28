const xlsx = require('xlsx');
const fs = require('fs');
const excel = xlsx.readFile('map.xlsx');
const sheetName = excel.SheetNames;
const sheets = [];
const jsonData = [];
let latlng = [];

sheetName.map(sheet => sheets.push(excel.Sheets[sheet]));

sheets.map(sheet => 
  jsonData.push(xlsx.utils.sheet_to_json(sheet, { defval : "" })));

jsonData.forEach((arr, dong) => {
  arr.forEach((data, index) => {
    latlng.push({ 
      dong: sheetName[dong],
      index: index + 2,
      roadName: data['소재지도로명주소'],
      name: data['설치장소'],
      lat: data['위도'], 
      lng: data['경도']
    });
  });
});

fs.writeFile('./public/multi-latlng.json', JSON.stringify(latlng), 'utf8', () => {
  console.log('Done');  
});
