const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Fix variations of invalid ''FILL' 1' or '\\'FILL\\' 1'
      content = content.replace(/style=\{\{'fontVariationSettings': [^\}]+\}\}/g, "style={{fontVariationSettings: '\"FILL\" 1'}}");
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir(path.join(__dirname, 'src', 'app', '[locale]'));
console.log('Fixed inline styles.');
