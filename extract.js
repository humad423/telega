const fs = require('fs');

const html = fs.readFileSync('home.html', 'utf-8');

// Extract tailwind config
const configMatch = html.match(/tailwind\.config = (\{[\s\S]*?\})/);
let colors = {};
let borderRadiuses = {};
if (configMatch) {
  // Dirty eval to parse the config object
  const configStr = configMatch[1];
  const themeMatch = configStr.match(/colors:\s*(\{[\s\S]*?\})\s*,?\s*fontFamily/);
  if (themeMatch) {
    const colorStr = themeMatch[1]
      .replace(/"/g, '')
      .replace(/([a-zA-Z0-9-]+):/g, '"$1":')
      .replace(/'/g, '"');
    try {
      colors = JSON.parse(colorStr);
    } catch(e) {
      console.log('JSON Parse failed for colors, trying manual parse');
      const lines = colorStr.split('\n');
      for (const line of lines) {
        const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
        if (match) colors[match[1]] = match[2];
      }
    }
  }
}

// Write globals.css
let globalsCss = `@import "tailwindcss";\n\n@theme {\n`;
for (const [k, v] of Object.entries(colors)) {
  globalsCss += `  --color-${k.replace(/-/g, '-')}: ${v};\n`;
}
globalsCss += `  --font-body: Inter, Tajawal, sans-serif;\n`;
globalsCss += `  --font-headline: Inter, Tajawal, sans-serif;\n`;
globalsCss += `  --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n`;
globalsCss += `}\n\n`;

globalsCss += `@layer base {\n  body {\n    background-color: var(--color-background);\n    color: var(--color-on-surface);\n  }\n}\n\n`;

globalsCss += `@utility glass-header {\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n}\n\n`;
globalsCss += `@utility featured-glow {\n  box-shadow: 0 0 20px rgba(0, 136, 204, 0.15);\n}\n\n`;
globalsCss += `@utility no-scrollbar {\n  &::-webkit-scrollbar { display: none; }\n}\n`;

fs.writeFileSync('src/app/globals.css', globalsCss);
console.log('globals.css written.');

// Extract body components
// We'll separate TopNavBar, main, Footer
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
  let bodyContent = bodyMatch[1];
  
  // convert class= to className=
  bodyContent = bodyContent.replace(/class=/g, 'className=');
  // convert for= to htmlFor=
  bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
  // convert inline styles
  bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styleString) => {
    const styles = styleString.split(';').filter(s => s.trim()).map(s => {
      const [key, value] = s.split(':').map(str => str.trim());
      const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
      return `'${camelKey}': '${value}'`;
    });
    return `style={{${styles.join(', ')}}}`;
  });
  // auto-close img tags
  bodyContent = bodyContent.replace(/<img(.*?[^\/])>/g, '<img$1 />');
  // auto-close input tags
  bodyContent = bodyContent.replace(/<input(.*?[^\/])>/g, '<input$1 />');
  // replace <!-- comments --> with {/* comments */}
  bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Extract parts
  const headerMatch = bodyContent.match(/<header[\s\S]*?<\/header>/);
  const footerMatch = bodyContent.match(/<footer[\s\S]*?<\/footer>/);
  const mainMatch = bodyContent.match(/<main[\s\S]*?<\/main>/);

  const header = headerMatch ? headerMatch[0] : '';
  const footer = footerMatch ? footerMatch[0] : '';
  const main = mainMatch ? mainMatch[0] : '';

  // Write layout.tsx (overwrite)
  const layoutFilePath = 'src/app/[locale]/layout.tsx';
  let layoutContent = fs.readFileSync(layoutFilePath, 'utf-8');
  layoutContent = `import { Inter, Tajawal } from 'next/font/google';\n\nconst inter = Inter({ subsets: ['latin'], variable: '--font-inter' });\nconst tajawal = Tajawal({ subsets: ['arabic'], weight: ['400', '500', '700', '800'], variable: '--font-tajawal' });\n\nexport default function LocaleLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en" className={\`\${inter.variable} \${tajawal.variable}\`}>\n      <body className="bg-background text-on-surface font-body selection:bg-primary/20">\n        ${header}\n        {children}\n        ${footer}\n      </body>\n    </html>\n  );\n}\n`;
  fs.writeFileSync(layoutFilePath, layoutContent);
  console.log('layout.tsx written.');

  // Write page.tsx
  const pageFilePath = 'src/app/[locale]/page.tsx';
  let pageContent = `export default function Home() {\n  return (\n    <>\n      ${main}\n    </>\n  );\n}\n`;
  fs.writeFileSync(pageFilePath, pageContent);
  console.log('page.tsx written.');
}
