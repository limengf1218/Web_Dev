const fs = require('fs');
const { parse } = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');
const header = "import { useTranslation } from 'react-i18next';"; 


// Load the en.json file
const enFilePath = './i18n-messages/en.json';
const enData = fs.readFileSync(enFilePath, 'utf-8');
const enJson = JSON.parse(enData);

enJson.forEach((element, index) => {
  const { source } = element;
  const location = source[0]?.location;
  if (!location) {
    console.log(`Invalid location for element at index ${index}. Skipping...`);
    console.log("-------------------");
    return;
  }
  const [filePath, startLine, _, endLine] = location.split('#').slice(0, 4);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (fileContent.includes(header)) {
  console.log('Header already exists. Skipping...');
  }
  else{
  const lines = fileContent.split('\n')
  lines.splice(0, 0, header);
  const modifiedContent = lines.join('\n'); 
  fs.writeFileSync(filePath, modifiedContent, 'utf-8');
  console.log("ADDED");
  }
});

