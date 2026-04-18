const fs = require('fs');

function tweakPage(filepath) {
    if (!fs.existsSync(filepath)) return;
    let c = fs.readFileSync(filepath, 'utf8');

    // 1. Add "use client"; if not present
    if (!c.includes('"use client"')) {
        c = '"use client";\n\n' + c;
    }

    // 2. Enlarge Avatar
    c = c.replace(/className="w-32 h-32 md:w-40 md:h-40 rounded-3xl/g, 'className="w-40 h-40 md:w-48 md:h-48 rounded-3xl');

    // 3. Remove Favorite button and update Share button to have onClick functionality
    // The relevant block starts at "{/* Secondary Actions */}" and ends with exactly two buttons.
    const searchString = `{/* Secondary Actions */}
                <button className="w-14 h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center group">
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">share</span>
                </button>
                <button className="w-14 h-14 rounded-2xl bg-surface-container hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-200 dark:hover:border-rose-500/30 hover:text-rose-500 transition-all duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined">favorite</span>
                </button>`;

    const newButtons = `{/* Secondary Actions */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (navigator.share) {
                      navigator.share({ title: 'Tech Insights Daily', url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  title="Share"
                  className="w-14 h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center group active:scale-95"
                >
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">share</span>
                </button>`;

    if (c.includes(searchString)) {
        c = c.replace(searchString, newButtons);
    } else {
        // Fallback regex if formatting slightly differently
        const shareRegex = /\{\/\* Secondary Actions \*\/\}[\s\S]*?<span className="material-symbols-outlined">favorite<\/span>\s*<\/button>/m;
        c = c.replace(shareRegex, newButtons);
    }

    fs.writeFileSync(filepath, c);
    console.log('Updated ' + filepath);
}

const files = [
    'src/app/[locale]/channels/[id]/page.tsx',
    'src/app/[locale]/groups/[id]/page.tsx',
    'src/app/[locale]/bots/[id]/page.tsx'
];

files.forEach(tweakPage);
