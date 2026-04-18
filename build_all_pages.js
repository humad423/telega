const fs = require('fs');
const https = require('https');
const path = require('path');

const files = {
  "channel_detail": {
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc0YzQ0MDBiNDlhMDQ0YzM4ODlmNjRjNDhiNGVmY2VmEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
    route: "channel/[id]"
  },
  "search": {
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk5NzE4ZTNkZjRiNzRmYmRhOTA1ZWNjMWUzN2NhNTIwEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
    route: "search"
  },
  "admin": {
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA0NDM5NzY5MWUxODQ5YzFhMTBiNTQwNTk5ODFkYmU2EgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
    route: "admin"
  },
  "dashboard": {
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAxYjUwNDMzNWI2NTQ1OTZhMjNiZTQ3ZDIwNGQyODRjEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
    route: "dashboard"
  },
  "blog": {
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzUyMDJhMGZiN2M1MDRiOWI5YmM0NzdmZTZjMTU5NWUwEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
    route: "blog"
  }
};

async function downloadHtmlText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => resolve(data));
      } else {
        reject(`Failed: ${response.statusCode}`);
      }
    }).on('error', reject);
  });
}

function htmlToJsx(html) {
  let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  if (!bodyMatch) return '';
  let bodyContent = bodyMatch[1];
  
  // To JSX
  bodyContent = bodyContent.replace(/class=/g, 'className=');
  bodyContent = bodyContent.replace(/for=/g, 'htmlFor=');
  bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styleString) => {
    const styles = styleString.split(';').filter(s => s.trim()).map(s => {
      let [key, ...values] = s.split(':');
      key = key.trim();
      let value = values.join(':').trim();
      const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
      return `'${camelKey}': '${value.replace(/'/g, "\\'")}'`;
    });
    return `style={{${styles.join(', ')}}}`;
  });
  bodyContent = bodyContent.replace(/<img(.*?[^\/])>/g, '<img$1 />');
  bodyContent = bodyContent.replace(/<input(.*?[^\/])>/g, '<input$1 />');
  bodyContent = bodyContent.replace(/<hr(.*?[^\/])>/g, '<hr$1 />');
  bodyContent = bodyContent.replace(/<br(.*?[^\/])>/g, '<br$1 />');
  bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Strip out header and footer if they exactly exist, OR just rip out main to avoid double header
  // Since we already put header and footer in LocaleLayout, we just want `<main ...>` or everything that's NOT header/footer
  // For safety and exact matching, some variants might have sidebars. Let's just extract the <main> block if it exists.
  const mainMatch = bodyContent.match(/<main[\s\S]*?<\/main>/);
  if (mainMatch) {
    return mainMatch[0];
  } else {
    // If no main, strip header/footer
    bodyContent = bodyContent.replace(/<header[\s\S]*?<\/header>/g, '');
    bodyContent = bodyContent.replace(/<footer[\s\S]*?<\/footer>/g, '');
    return bodyContent;
  }
}

async function main() {
  for (const [name, meta] of Object.entries(files)) {
    console.log(`Processing ${name}...`);
    try {
      const htmlText = await downloadHtmlText(meta.url);
      const jsx = htmlToJsx(htmlText);
      
      const dirPath = path.join(__dirname, 'src', 'app', '[locale]', meta.route);
      fs.mkdirSync(dirPath, { recursive: true });
      
      const pagePath = path.join(dirPath, 'page.tsx');
      
      // Capitalize first letter for component name
      const componentName = meta.route.split('/').map(p => p.replace(/[^a-zA-Z]/g, '')).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') || name.charAt(0).toUpperCase() + name.slice(1);
      
      const content = `export default function ${componentName}Page() {\n  return (\n    <>\n      ${jsx}\n    </>\n  );\n}\n`;
      
      fs.writeFileSync(pagePath, content);
      console.log(`Wrote ${pagePath}`);
    } catch (e) {
      console.error(e);
    }
  }
}

main();
