const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add Link import if not exists
  if (!content.includes("from 'next/link'") && (content.includes(' href="') || content.includes('<article'))) {
    content = `import Link from 'next/link';\n` + content;
    changed = true;
  }

  // Replace standard anchor links based on text/context
  const linkReplacements = [
    // Dashboard sidebar
    { match: /<a([^>]*)>Dashboard<\/a>/g, replace: '<Link$1 href="/dashboard">Dashboard</Link>' },
    { match: /<a([^>]*)>My Channels<\/a>/g, replace: '<Link$1 href="/dashboard">My Channels</Link>' },
    { match: /<a([^>]*)>Advertise<\/a>/g, replace: '<Link$1 href="/admin">Advertise</Link>' },
    { match: /<a([^>]*)>Settings<\/a>/g, replace: '<Link$1 href="/admin">Settings</Link>' },
    { match: /<a([^>]*)>Submit Channel<\/a>/g, replace: '<Link$1 href="/dashboard">Submit Channel</Link>' },
    
    // Blog navigation
    { match: /<a([^>]*)>Blog<\/a>/g, replace: '<Link$1 href="/blog">Blog</Link>' },
    { match: /<a([^>]*)>Crypto Channels<\/a>/g, replace: '<Link$1 href="/search">Crypto Channels</Link>' },
    { match: /<a([^>]*)>Bot Tutorials<\/a>/g, replace: '<Link$1 href="/search">Bot Tutorials</Link>' },

    // generic View All
    { match: /<a([^>]*)>View All(.*?)<\/a>/g, replace: '<Link$1 href="/search">View All$2</Link>' },

    // Generic href="#" fallback (be careful) to /search
    { match: /<a([^>]*href="#")([^>]*)>/g, replace: '<Link$1 href="/search"$2>' }
  ];

  for (let rule of linkReplacements) {
    let newContent = content.replace(rule.match, rule.replace);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }

  // Wrap featured <article> blocks in Link to channel detail
  // <article className="bg-... group"> -> <Link href="/channel/demo"><article ...></article></Link>
  // Actually, replacing html strings like this can be tricky. But since the code structure is consistent:
  const articleRegex = /<article\b[^>]*>[\s\S]*?<\/article>/g;
  content = content.replace(articleRegex, (match) => {
    // If it's already wrapped or contains a link, don't double wrap
    if (match.includes('href="')) return match; 
    
    // Wrap the card
    return `<Link href="/channel/123" className="block transition-transform hover:-translate-y-1">${match}</Link>`;
  });

  // Make <button> "View All" or "Search" clickable by wrapping them or changing to Link
  const buttonRegex = /<button([^>]*)>(.*?)<\/button>/g;
  content = content.replace(buttonRegex, (match, attrs, text) => {
    if (text.includes('View All') || text.includes('Explore') || text.includes('search')) {
      return `<Link href="/search"><button${attrs}>${text}</button></Link>`;
    }
    if (text.includes('Submit') || text.includes('Add')) {
      return `<Link href="/dashboard"><button${attrs}>${text}</button></Link>`;
    }
    return match;
  });

  if (content !== fs.readFileSync(filePath, 'utf8')) {
     fs.writeFileSync(filePath, content, 'utf8');
     console.log('Processed', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) traverse(fullPath);
    else if (fullPath.endsWith('.tsx')) {
       // Skip layout.tsx since we did it manually and it has fixed Links
       if (!fullPath.includes('layout.tsx')) {
         processFile(fullPath);
       }
    }
  }
}

traverse(path.join(__dirname, 'src', 'app', '[locale]'));
