const fs = require('fs');
let lines = fs.readFileSync('src/app/[locale]/page.tsx', 'utf8').split('\n');

// Arrays are 0-indexed, but the line numbers are 1-indexed.
// Deletions: 
// 205 to 234
// 338 to 367
// 458 to 483
// Note: delete from bottom to top so line indices don't shift!

lines.splice(457, 483 - 458 + 1); // Delete 458 to 483
lines.splice(337, 367 - 338 + 1); // Delete 338 to 367
lines.splice(204, 234 - 205 + 1); // Delete 205 to 234

fs.writeFileSync('src/app/[locale]/page.tsx', lines.join('\n'));
console.log('Cards deleted');
