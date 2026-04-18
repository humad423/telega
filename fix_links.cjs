const fs = require('fs');

function fixCardsInFile(filename) {
    if (!fs.existsSync(filename)) return;
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Ensure ChannelsPage, GroupsPage, BotsPage have `locale` defined
    if (filename.includes('channels') || filename.includes('groups') || filename.includes('bots')) {
        const pageNameMatch = content.match(/export default function ([A-Za-z]+Page)\(\) \{/);
        if (pageNameMatch) {
            const pageName = pageNameMatch[1];
            content = content.replace(
                `export default function ${pageName}() {`,
                `export default async function ${pageName}({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {\n  const resolvedParams = await Promise.resolve(params);\n  const locale = resolvedParams.locale;`
            );
        }
    }

    // 2. Wrap cards in <Link>
    // In page.tsx, we have "bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 flex items-center justify-between hover:shadow-md transition-shadow"
    const cardRegex = /<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant\/15 flex items-center justify-between hover:shadow-md transition-shadow">([\s\S]*?)<\/button>\s*<\/div>/g;
    
    content = content.replace(cardRegex, (match, innerHtml) => {
        // change <button> to <div> for valid HTML inside an <a> tag
        let fixedInner = innerHtml.replace(/<button /g, '<div ').replace(/<\/button>/g, '</div>');
        return `<Link href={\`/\${locale}/channel/demo\`} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 flex items-center justify-between hover:shadow-md transition-shadow group cursor-pointer block">\n${fixedInner}</div>\n</Link>`;
    });

    // 3. Fix the "Join" buttons in the Featured section on the homepage
    if (filename.includes('page.tsx') && !filename.includes('channels') && !filename.includes('groups') && !filename.includes('bots')) {
        // Change <Link href="/search" className="...btnJoin..."> 
        content = content.replace(/<Link className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 uppercase text-xs font-bold tracking-wider px-6 py-2\.5 rounded-md transition-all active:scale-95 text-center mt-2 w-full max-w-\[200px\]" href="\/search">/g,
            `<Link className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 uppercase text-xs font-bold tracking-wider px-6 py-2.5 rounded-md transition-all active:scale-95 text-center mt-2 w-full max-w-[200px]" href={\`/\${locale}/channel/demo\`}>`);
    }

    fs.writeFileSync(filename, content);
    console.log(`Fixed card links in ${filename}`);
}

const filesToFix = [
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/channels/page.tsx',
    'src/app/[locale]/groups/page.tsx',
    'src/app/[locale]/bots/page.tsx'
];

filesToFix.forEach(fixCardsInFile);
