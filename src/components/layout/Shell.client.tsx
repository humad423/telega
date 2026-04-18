'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from './HeaderNav';
import { HeaderActions } from './HeaderActions';

export function SiteShell({ 
    children, 
    locale, 
    dict 
}: { 
    children: React.ReactNode, 
    locale: string, 
    dict: any 
}) {
    const pathname = usePathname();
    
    // Define patterns that should NOT show the global header/footer
    // Primarily the article editor routes
    const isFullScreenEditor = pathname.includes('/admin/articles/create') || 
                               pathname.includes('/admin/articles/edit') ||
                               pathname.includes('/admin/articles/new'); 

    // If it's the editor, return only children to give full control to the Blogger UI
    if (isFullScreenEditor) {
        return <>{children}</>;
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-[1536px] mx-auto w-full font-['Inter','Tajawal'] antialiased tracking-tight">
                    <div className="flex items-center gap-4 sm:gap-8">
                        <Link className="text-xl sm:text-2xl font-bold tracking-tighter text-sky-700 dark:text-sky-400 shrink-0" href={locale === 'en' ? '/' : `/${locale}`}>
                            TeleCurator
                        </Link>
                        <HeaderNav locale={locale} dict={dict} />
                    </div>
                    <HeaderActions dict={dict} locale={locale} />
                </div>
            </header>

            <main className="min-h-[calc(100vh-200px)]">
                {children}
            </main>

            <footer className="w-full border-t border-slate-200/15 dark:border-slate-800/15 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-[1536px] mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">TeleCurator</span>
                        <p className="text-sm font-['Inter','Tajawal'] text-slate-500 dark:text-slate-400">© 2024 TeleCurator. {dict.footerRights}</p>
                    </div>
                    <nav className="flex gap-8">
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-sky-600 transition-colors text-sm font-bold uppercase tracking-widest font-['Inter','Tajawal']" href="/about">{dict.footerAbout}</Link>
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-sky-600 transition-colors text-sm font-bold uppercase tracking-widest font-['Inter','Tajawal']" href="/privacy">{dict.footerPrivacy}</Link>
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-sky-600 transition-colors text-sm font-bold uppercase tracking-widest font-['Inter','Tajawal']" href="/terms">{dict.footerTerms}</Link>
                        <Link className="text-slate-500 dark:text-slate-400 hover:text-sky-600 transition-colors text-sm font-bold uppercase tracking-widest font-['Inter','Tajawal']" href="/contact">{dict.footerContact}</Link>
                    </nav>
                </div>
            </footer>
        </>
    );
}
