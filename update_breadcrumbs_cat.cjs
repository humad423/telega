const fs = require('fs');

function updateBreadcrumbsWithCategory(filepath, categoryLabel, categoryPath) {
    if (!fs.existsSync(filepath)) return;
    let c = fs.readFileSync(filepath, 'utf8');

    // We are looking for:
    // <Link href={`/${locale}/${categoryPath}`} className="hover:text-primary transition-colors">${categoryLabel}</Link>
    // <span className="material-symbols-outlined text-xs">chevron_right</span>
    // <span className="text-slate-800 dark:text-slate-200">Tech Insights Daily</span>

    const regex = new RegExp(
        `<Link href={\`\/\\\${locale}\/${categoryPath}\`} className="hover:text-primary transition-colors">${categoryLabel}<\\/Link>\\s*` + 
        `<span className="material-symbols-outlined text-xs">chevron_right<\\/span>\\s*` + 
        `<span className="text-slate-800 dark:text-slate-200">Tech Insights Daily<\\/span>`
    );

    const replacement = 
        `<Link href={\`/\${locale}/${categoryPath}\`} className="hover:text-primary transition-colors">${categoryLabel}</Link>\n` +
        `            <span className="material-symbols-outlined text-xs">chevron_right</span>\n` +
        `            <Link href={\`/\${locale}/${categoryPath}?category=technology\`} className="hover:text-primary transition-colors">Technology</Link>\n` +
        `            <span className="material-symbols-outlined text-xs">chevron_right</span>\n` +
        `            <span className="text-slate-800 dark:text-slate-200">Tech Insights Daily</span>`;

    if (regex.test(c)) {
        c = c.replace(regex, replacement);
        fs.writeFileSync(filepath, c);
        console.log('Updated ' + filepath);
    } else {
        console.log('Could not match regex in ' + filepath);
        console.log('Regex was:', regex);
    }
}

updateBreadcrumbsWithCategory('src/app/[locale]/channels/[id]/page.tsx', 'Channels', 'channels');
updateBreadcrumbsWithCategory('src/app/[locale]/groups/[id]/page.tsx', 'Groups', 'groups');
updateBreadcrumbsWithCategory('src/app/[locale]/bots/[id]/page.tsx', 'Bots', 'bots');
