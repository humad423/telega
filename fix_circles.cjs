const fs = require('fs');

function fixCircularButtons(filename) {
    if (!fs.existsSync(filename)) return;
    let c = fs.readFileSync(filename, 'utf8');

    // Make the add/chat generic buttons perfectly round
    c = c.replace(/className="p-2\.5 rounded-full/g, 'className="w-10 h-10 flex items-center justify-center rounded-full shrink-0');
    c = c.replace(/className="p-2 rounded-full/g, 'className="w-10 h-10 flex items-center justify-center rounded-full shrink-0');

    fs.writeFileSync(filename, c);
    console.log(`Fixed buttons in ${filename}`);
}

const files = [
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/channels/page.tsx',
    'src/app/[locale]/groups/page.tsx',
    'src/app/[locale]/bots/page.tsx'
];

files.forEach(fixCircularButtons);
