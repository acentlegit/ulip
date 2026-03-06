// Fix incorrectly replaced API URLs
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

const files = findFiles('frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix patterns like "getApiUrl("endpoint")" to getApiUrl("endpoint")
  content = content.replace(/"getApiUrl\(([^)]+)\)"/g, (match, endpoint) => {
    modified = true;
    return `getApiUrl(${endpoint})`;
  });
  
  // Fix patterns like `getApiUrl("endpoint")` in template literals
  content = content.replace(/`getApiUrl\(([^)]+)\)`/g, (match, endpoint) => {
    modified = true;
    return `getApiUrl(${endpoint})`;
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done fixing files!');
