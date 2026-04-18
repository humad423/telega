const fs = require('fs');

function extractCards(pageContent, startWord) {
    const startIndex = pageContent.indexOf(startWord);
    if (startIndex === -1) return [];
    
    // The `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">` contains 6 cards inside it, split by `</Link>`
    const gridStart = pageContent.indexOf('<Link href', startIndex);
    const gridEndStr = "</div>\n<div className=\"flex justify-end mt-4\">";
    let gridEnd = pageContent.indexOf(gridEndStr, gridStart);
    if (gridEnd === -1) gridEnd = pageContent.indexOf('<div className="flex justify-end mt-4">', gridStart);
    // fallback if we can't find it exactly
    if (gridEnd === -1) gridEnd = gridStart + 5000;
    
    let rawHtml = pageContent.substring(gridStart, gridEnd);
    
    // let's split by </Link> and take the first 3!
    const cards = rawHtml.split('</Link>').filter(c => c.trim().length > 0).slice(0, 3).map(c => c + '</Link>');
    return cards.join('\n');
}

function updateDetailPage(filepath, cardsHtml) {
    if (!fs.existsSync(filepath)) return;
    let c = fs.readFileSync(filepath, 'utf8');
    
    // 1. Remove the "Report this content" whole block
    // It starts with `<div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">`
    // And ends with `</div>` after the `</button>`.
    const reportBlockRegex = /<div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200\/60 dark:border-slate-800 flex items-center justify-between">[\s\S]*?<\/button>\s*<\/div>/g;
    c = c.replace(reportBlockRegex, '');
    
    // 2. Replace the Suggestion block grid completely
    // We look for `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">` and end at `</section>`
    const suggestionStart = c.indexOf('<h2 className="text-2xl font-extrabold tracking-tight border-s-4 border-primary ps-4 mb-8">Suggested for you</h2>');
    if (suggestionStart !== -1) {
        const gridStart = c.indexOf('<div className="grid', suggestionStart);
        // We know the end of the section is just before `</main>`
        const sectionEnd = c.indexOf('</section>', gridStart);
        
        const newGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">\n${cardsHtml}\n</div>\n          </div>\n        `;
        
        c = c.substring(0, gridStart) + newGrid + c.substring(sectionEnd);
    }
    
    // Also change `const locale = 'en';` to `const locale = 'en';` (already exists) but let's make sure things compile if dict is missing.
    // The `<Link href={\`/\${locale}/...> ` works because locale is defined.
    
    fs.writeFileSync(filepath, c);
    console.log(`Updated ${filepath}`);
}

const mainContent = fs.readFileSync('src/app/[locale]/page.tsx', 'utf8');

const channelCards = extractCards(mainContent, 'Top Channels');
const groupCards = extractCards(mainContent, 'Active Groups');
const botCards = extractCards(mainContent, 'Useful Bots');

updateDetailPage('src/app/[locale]/channels/[id]/page.tsx', channelCards);
updateDetailPage('src/app/[locale]/groups/[id]/page.tsx', groupCards);
updateDetailPage('src/app/[locale]/bots/[id]/page.tsx', botCards);
