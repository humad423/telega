const fs = require('fs');
let c = fs.readFileSync('src/app/[locale]/page.tsx', 'utf8');

c = c.replace(
  /<Link href="\/search"([^>]+)>\s*\{dict\.viewAllChannels\}/g,
  '<Link href={`/${locale}/channels`}$1>\n{dict.viewAllChannels}'
);

c = c.replace(
  /<Link href="\/search"([^>]+)>\s*\{dict\.viewAllGroups\}/g,
  '<Link href={`/${locale}/groups`}$1>\n{dict.viewAllGroups}'
);

c = c.replace(
  /<Link href="\/search"([^>]+)>\s*\{dict\.viewAllBots\}/g,
  '<Link href={`/${locale}/bots`}$1>\n{dict.viewAllBots}'
);

fs.writeFileSync('src/app/[locale]/page.tsx', c);
console.log('Homepage View All links updated');
