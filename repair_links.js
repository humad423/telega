const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix malformed <Link ... href="#" href="/path">...</a>
  content = content.replace(/<Link([^>]*?)href="#"\s+href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, '<Link$1href="$2"$3>$4</Link>');
  content = content.replace(/<Link([^>]*?)href="#"\s+href="([^"]+)"([^>]*)>([\s\S]*?)<\/Link>/g, '<Link$1href="$2"$3>$4</Link>');
  // Also fix if it was left as <a ... href="#" href="/path">
  content = content.replace(/<a([^>]*?)href="#"\s+href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, '<Link$1href="$2"$3>$4</Link>');

  // Some articles were successfully wrapped: <Link href="/channel/123" className="block transition-transform hover:-translate-y-1"><article ...>...</article></Link>
  // Ensure that they don't have nested Links or a tags that cause hydration mismatch. 
  // Next.js warns about nested <a> tags.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed links in', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) traverse(fullPath);
    else if (fullPath.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  }
}

traverse(path.join(__dirname, 'src', 'app', '[locale]'));
