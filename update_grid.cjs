const fs = require('fs');

let c = fs.readFileSync('src/app/[locale]/page.tsx', 'utf8');

// Replace grid classes 
c = c.replace(/lg:grid-cols-4 gap-4/g, 'lg:grid-cols-3 xl:grid-cols-3 gap-6');

// We currently have 3 sections, each with 8 cards.
// Each section looks like:
// <div className="grid ...">
//   <div className="bg-surface...">...</div> (x8)
// </div>
// Since we are changing to a 3-column layout, we want exactly 6 items (3x2).
// To do this reliably, we can find the grid div, count its child divs, and truncate the last two.
// But doing it via regex might be tricky. Let's just do a manual string manipulation or AST if needed.
// A simpler way: since we know the HTML structure, we can just split around `<div className="bg-surface-container-lowest`
// and count them per section.

// A Regex to find the 8 items in each of the 3 sections:
// Actually, it's easier. Just split the file by `<!-- Repeat for 8 items total -->` and such. Let's see if we can just leave it as 8. 8 items in a 3-column grid is 3-3-2. Sometimes it's fine. Wait, with `md:grid-cols-2` it's 2-2-2-2 (4 rows). With `lg:grid-cols-3`, it's 3-3-2. 
// The user said "خلي يظهر 3 بطاقات بدل 4". I will change the class first, and the browser will wrap the 8th card. 
// If they complain about 8 cards not fitting evenly into 3 columns, I'll delete two cards later.
fs.writeFileSync('src/app/[locale]/page.tsx', c);
console.log('Done');
