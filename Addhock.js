const fs = require('fs');
const { parse } = require('@babel/parser');
const { default: traverse } = require('@babel/traverse');

function getFunctionInfo(filePath, targetLine) {
  const code = fs.readFileSync(filePath, 'utf-8');

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  let functionName = null;
  let functionStartLine = null;
  let functionBodyStartLine = null;

  traverse(ast, {
    FunctionDeclaration(path) {
      const { start, end } = path.node.loc;
      const bodys = path.node.body.body;

      if (start.line <= targetLine && end.line >= targetLine) {
        functionName = path.node.id.name;
        functionStartLine = start.line;

        if (!functionName && path.parentPath.isFunctionDeclaration()) {
          functionName = path.parentPath.node.id.name;
        }

        if (bodys.length > 0) {
          functionBodyStartLine = bodys[0].loc.start.line - 1;
        }

        path.stop();
      }
    },
  });

  return {
    functionName,
    functionBodyStartLine,
  };
}

// Load the en.json file
const enFilePath = './i18n-messages/en.json';
const enData = fs.readFileSync(enFilePath, 'utf-8');
const skippedFiles = [];
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
  console.log(`Processing: ${filePath}, startLine: ${startLine}, endLine: ${endLine}`);

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { functionName, functionBodyStartLine } = getFunctionInfo(filePath, parseInt(startLine, 10));

  if (functionName) {
    console.log(`Function Name: ${functionName}`);
    console.log(`Start Line: ${functionBodyStartLine}`);

    // Check if the line already exists at the beginning of the function body
    const lines = fileContent.split('\n');
    const lineToAdd = "const { t } = useTranslation();";
    const lineAlreadyExists = lines[functionBodyStartLine]?.trim() === lineToAdd;

    if (!lineAlreadyExists) {
      lines.splice(functionBodyStartLine, 0, lineToAdd);
      const modifiedCode = lines.join('\n');
      fs.writeFileSync(filePath, modifiedCode, 'utf-8');
      console.log("Added hook");
    } else {
      console.log("Hook already exists. Skipping...");
    }
  } else {
    skippedFiles.push(filePath);
    console.log("Unable to find function start. Skipping...");
  }

  console.log("-------------------");
});

if (skippedFiles.length > 0) {
  const skippedFilesContent = skippedFiles.join('\n');
  fs.writeFileSync('skippedFiles.txt', skippedFilesContent, 'utf-8');
  console.log("Skipped files written to skippedFiles.txt");
}

