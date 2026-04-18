const fs = require('fs');

function enhanceCards(filename) {
    if (!fs.existsSync(filename)) return;
    let c = fs.readFileSync(filename, 'utf8');

    // Remove ' block' from Link className to fix any flex breakages (just in case)
    c = c.replace(/cursor-pointer block"/g, 'cursor-pointer"');

    // Increase image size to w-16
    c = c.replace(/w-14 h-14 rounded-full overflow-hidden min-w-14 min-h-14/g, 'w-16 h-16 rounded-full overflow-hidden min-w-16 min-h-16 shadow-inner ring-1 ring-slate-100 dark:ring-slate-800');

    // Increase title size and add hover effects
    c = c.replace(/<h4 className="font-bold text-base leading-tight text-slate-900 dark:text-white">/g, 
                 '<h4 className="font-extrabold text-[17px] leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">');

    // Button hover effects for generic add/chat buttons (channels, groups)
    c = c.replace(/<div className="p-2 rounded-full hover:bg-surface-container-high text-primary/g, 
                 '<div className="p-2.5 rounded-full group-hover:bg-primary/10 text-primary transition-colors shadow-sm bg-surface-container-lowest');

    // Button hover effects for Bots (Start button)
    // Wait, let's just replace the exact span or div for generic buttons
    // Actually, I can replace '<div className="p-2 rounded-full ' with '<div className="p-2.5 rounded-full group-hover:bg-primary/10 '
    
    // For Bots specifically:
    c = c.replace(/<div className="px-3 py-1\.5 rounded-md bg-surface-container text-primary font-bold text-xs uppercase hover:bg-primary hover:text-white transition-colors/g, 
                 '<div className="px-4 py-2 rounded-[10px] bg-primary/5 text-primary font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm');
                 
    // Fix channel/groups generic button hover
    c = c.replace(/<div className="p-2 rounded-full hover:bg-surface-container-high text-primary">/g,
                  '<div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">');
                  
    // Also, there are some hardcoded `<button>` inside bots/channels pages if they weren't matched originally?
    // Let's also match <button className="p-2 rounded-full hover:bg-surface-container-high text-primary bg-primary/5">
    c = c.replace(/<button className="p-2 rounded-full hover:bg-surface-container-high text-primary bg-primary\/5">/g,
                  '<div className="p-2 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">');

    fs.writeFileSync(filename, c);
    console.log(`Enhanced ${filename}`);
}

const files = [
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/channels/page.tsx',
    'src/app/[locale]/groups/page.tsx',
    'src/app/[locale]/bots/page.tsx'
];

files.forEach(enhanceCards);
