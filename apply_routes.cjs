const fs = require('fs');

function fixCardsInPage() {
    let content = fs.readFileSync('src/app/[locale]/page.tsx', 'utf8');

    // 1. Replace the 18 instances of `/channel/demo` with their respective paths
    let counter = 0;
    content = content.replace(/\/channel\/demo/g, (match) => {
        counter++;
        if (counter <= 6) return '/channels/demo';
        if (counter <= 12) return '/groups/demo';
        return '/bots/demo';
    });
    
    // 2. Fix the 3 featured buttons that say href="/search"
    // Since we know the order: CM Trading (groups), Tech Insider (channels), AI Crypto (bots)
    let searchCounter = 0;
    // The pattern is: hover:-translate-y-1 transition-all duration-300"> ... href="/search"
    // But let's just match href="/search" explicitly, assuming these are the only ones left in page.tsx that we want to turn into details pages.
    // Wait, are there other href="/search"? Let's only replace the ones looking like buttons.
    // Actually, earlier we changed the "View All X" buttons to `/${locale}/channels` etc.
    // Let's just catch all href="/search" and see. Wait, "Search" in header is in HeaderNav.tsx. 
    // In page.tsx, the featured join buttons have `href="/search"`.
    
    // Let's replace href="/search" with the dynamic strings specifically
    content = content.replace(/href="\/search"/g, () => {
        searchCounter++;
        if (searchCounter === 1) return 'href={`/${locale}/groups/cmtradingacademy`}';
        if (searchCounter === 2) return 'href={`/${locale}/channels/thetechinsider`}';
        if (searchCounter === 3) return 'href={`/${locale}/bots/aicryptotrader`}';
        return 'href="/search"'; // fallback if there are more
    });

    // Also update any other demo urls for testing if we want 
    // Wait, the Top Channels / Active Groups / Bots link to '/channels/demo' etc.
    // Which is perfectly fine for the mockup.

    fs.writeFileSync('src/app/[locale]/page.tsx', content);
    console.log('Fixed page.tsx routing logic');
}

function replaceInFile(filename, replaceWhat, replaceWith) {
    let content = fs.readFileSync(filename, 'utf8');
    content = content.replace(new RegExp(replaceWhat, 'g'), replaceWith);
    fs.writeFileSync(filename, content);
    console.log(`Updated routing in ${filename}`);
}

fixCardsInPage();
replaceInFile('src/app/[locale]/channels/page.tsx', '\\/channel\\/demo', '/channels/demo');
replaceInFile('src/app/[locale]/groups/page.tsx', '\\/channel\\/demo', '/groups/demo');
replaceInFile('src/app/[locale]/bots/page.tsx', '\\/channel\\/demo', '/bots/demo');
