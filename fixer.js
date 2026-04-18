const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Clean double links
  content = content.replace(/<Link href="\/search"><Link href="\/search">/g, '<Link href="/search">');
  content = content.replace(/<\/Link><\/Link>/g, '</Link>');
  
  content = content.replace(/<Link href="\/channel\/123"[^>]*><Link href="\/channel\/123"[^>]*>/g, '<Link href="/channel/123" className="block transition-transform hover:-translate-y-1">');
  content = content.replace(/<\/article><\/Link><\/Link>/g, '</article></Link>');

  // Clean malformed <a> tags converted to <Link> incorrectly
  content = content.replace(/href="#"\s*href="([^"]+)"/g, 'href="$1"');
  content = content.replace(/<a([^>]*)(href="[^"]+")([^>]*)>([\s\S]*?)<\/a>/g, (match, p1, p2, p3, p4) => {
    // Only convert to Link if it's a local route
    if (p2.includes('href="/')) {
      return `<Link${p1}${p2}${p3}>${p4}</Link>`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) traverse(fullPath);
    else if (fullPath.endsWith('.tsx') && !fullPath.includes('layout.tsx')) {
      cleanFile(fullPath);
    }
  }
}

traverse(path.join(__dirname, 'src', 'app', '[locale]'));
