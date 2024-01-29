const fs = require('fs');
const { parse } = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');

// Load the en.json file
const enFilePath = './i18n-messages/en.json';
const enData = fs.readFileSync(enFilePath, 'utf-8');
const enJson = JSON.parse(enData);
// Iterate over each element in enJson
enJson.forEach((element, index) => {
  const { source } = element;
  const location = source[0]?.location;
  const id = element.id;
  console.log(location);
  console.log(id);
  if (!location) {
    console.log(`Invalid location for element at index ${index}. Skipping...`);
    console.log("-------------------");
    return;
  }

  const [filePath, startLine, _, endLine] = location.split('#').slice(0, 4);

  console.log(`Processing: ${filePath}, Start Line: ${startLine}, End Line: ${endLine}`);

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const lines = fileContent.split('\n');
  const newLines = lines.map((line, lineNumber) => {
    console.log(`Line: ${line}, LineNo: ${lineNumber}`);
    if (lineNumber >= startLine - 2 && lineNumber <= endLine + 2) {
      const text = element.id;
      const isInQuotes = line.includes(`"${text}"`) || line.includes(`'${text}'`);
      
      if (isInQuotes) {
        if (line.includes(`=`)) {
           r_text = `{t('${text}')}`;
        } else {
           r_text = `t('${text}')`;
        }
        return line.replace(/['"]([^'"]*)['"]/g, (match, p1) => {
          if (p1 === text) {
            console.log(`text: ${line}, replace to: ${r_text}`);
            return r_text;
          }
          return match;
        });
      } else {
        r_text = `{t('${text}')}`;
        const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        console.log(`text: ${line}, replace to: ${r_text}`);
        return line.replace(new RegExp(`\\b${escapedText}\\b`, 'g'), r_text);
      }
    }
    return line;
  });

  const newContent = newLines.join('\n');

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Replaced '${id}' successfully`);

  console.log("-------------------");
});

