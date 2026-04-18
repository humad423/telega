const fs = require('fs');

function updateBreadcrumbs(filepath, categoryLabel, categoryPath) {
    if (!fs.existsSync(filepath)) return;
    let c = fs.readFileSync(filepath, 'utf8');

    const searchString = `<Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-800 dark:text-slate-200">Tech Insights Daily</span>`;
            
    const newBreadcrumbs = `<Link href={\`/\${locale}\`} className="hover:text-primary transition-colors">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href={\`/\${locale}/\${categoryPath}\`} className="hover:text-primary transition-colors">${categoryLabel}</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-800 dark:text-slate-200">Tech Insights Daily</span>`;

    if (c.includes(searchString)) {
        c = c.replace(searchString, newBreadcrumbs.replace(/\${categoryPath}/g, categoryPath));
    } else {
        // Fallback robust regex
        const regex = /<Link href="\/".*?>Home<\/Link>\s*<span.*?<\/span>\s*<span className="text-slate-800 dark:text-slate-200">.*?<\/span>/s;
        c = c.replace(regex, newBreadcrumbs.replace(/\${categoryPath}/g, categoryPath));
    }

    fs.writeFileSync(filepath, c);
    console.log('Updated ' + filepath);
}

updateBreadcrumbs('src/app/[locale]/channels/[id]/page.tsx', 'Channels', 'channels');
updateBreadcrumbs('src/app/[locale]/groups/[id]/page.tsx', 'Groups', 'groups');
updateBreadcrumbs('src/app/[locale]/bots/[id]/page.tsx', 'Bots', 'bots');
