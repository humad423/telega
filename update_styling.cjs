const fs = require('fs');
let c = fs.readFileSync('src/app/[locale]/page.tsx', 'utf8');

// 1. Featured Item 2 Fix
c = c.replace(
  'to-purple-50/50 dark:to-purple-900/10 p-5 rounded-2xl border border-purple-200/50 dark:border-purple-700/30',
  'to-amber-50/50 dark:to-amber-900/10 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-700/30'
);
c = c.replace('bg-purple-400/10 dark:bg-purple-500/10', 'bg-amber-400/10 dark:bg-amber-500/10');
c = c.replace('ring-purple-400/30', 'ring-amber-400/30');
c = c.replace(
  'from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600',
  'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
);

// 2. Categories "All" button
c = c.replace(
  'bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-sky-500/30 active:scale-95 whitespace-nowrap border border-sky-400/20',
  'bg-primary text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 whitespace-nowrap border border-transparent'
);

// 3. Regular Categories (hover state unification)
const regexes = [
  /hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700/g,
  /hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700/g,
  /hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700/g,
  /hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/g,
  /hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-700/g
];
regexes.forEach(r => {
  c = c.replace(r, 'hover:text-primary dark:hover:text-primary hover:border-primary/40 dark:hover:border-primary/40');
});

// Also remove the colored group-hover on the material icons
const iconRegexes = [
  /group-hover:text-sky-500 dark:group-hover:text-sky-400/g,
  /group-hover:text-amber-500 dark:group-hover:text-amber-400/g,
  /group-hover:text-emerald-500 dark:group-hover:text-emerald-400/g,
  /group-hover:text-indigo-500 dark:group-hover:text-indigo-400/g,
  /group-hover:text-pink-500 dark:group-hover:text-pink-400/g
];
iconRegexes.forEach(r => {
  c = c.replace(r, 'group-hover:text-primary dark:group-hover:text-primary');
});

fs.writeFileSync('src/app/[locale]/page.tsx', c);
console.log('Homepage styling updated successfully.');
