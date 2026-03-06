// Fix import paths for config/api
const fs = require('fs');
const path = require('path');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = findFiles('frontend/src/pages');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Count depth - how many levels deep from pages/
  const relativePath = path.relative('frontend/src/pages', file);
  const depth = relativePath.split(path.sep).length - 1;
  
  // If file is in a subdirectory (depth > 0), need ../../ instead of ../
  if (depth > 0 && content.includes('from "../config/api"')) {
    content = content.replace(/from "\.\.\/config\/api"/g, 'from "../../config/api"');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${file} (depth: ${depth})`);
  }
});

console.log('Done fixing imports!');
