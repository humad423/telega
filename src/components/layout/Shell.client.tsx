'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from './HeaderNav';
import { HeaderActions } from './HeaderActions';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then((res: any) => {
            setUser(res.data?.user ?? null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // Define patterns that should NOT show the global header/footer
    // Primarily the article editor routes
    const isFullScreenEditor = pathname.includes('/admin/articles/create') || 
                               pathname.includes('/admin/articles/edit') ||
                               pathname.includes('/admin/articles/new'); 

    // If it's the editor, return only children to give full control to the Blogger UI
    if (isFullScreenEditor) {
        return <>{children}</>;
    }

    const prefix = locale === 'en' ? '' : `/${locale}`;
    
    const navItems = [
        {
            name: dict.navExplore,
            href: `${prefix}/` || '/',
            isActive: pathname === `${prefix}` || pathname === `${prefix}/` || (prefix === '' && pathname === '/'),
            icon: 'explore'
        },
        {
            name: dict.navGroups,
            href: `${prefix}/groups`,
            isActive: pathname.startsWith(`${prefix}/groups`),
            icon: 'groups'
        },
        {
            name: dict.navChannels,
            href: `${prefix}/channels`,
            isActive: pathname.startsWith(`${prefix}/channels`),
            icon: 'campaign'
        },
        {
            name: dict.navBots,
            href: `${prefix}/bots`,
            isActive: pathname.startsWith(`${prefix}/bots`),
            icon: 'smart_toy'
        },
        {
            name: dict.navBlog,
            href: `${prefix}/blog`,
            isActive: pathname.startsWith(`${prefix}/blog`),
            icon: 'article'
        },
    ];

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
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        <HeaderActions dict={dict} locale={locale} />
                        
                        {/* Mobile Menu Toggle Button */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors active:scale-95 ml-1 rtl:ml-0 rtl:mr-1"
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Panel */}
                    <div className="fixed top-0 bottom-0 ltr:left-0 rtl:right-0 w-80 max-w-[85vw] bg-white dark:bg-slate-950 p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform translate-x-0 animate-in slide-in-from-left rtl:slide-in-from-right font-['Inter','Tajawal'] border-r ltr:border-slate-200 rtl:border-l rtl:border-slate-800 dark:border-slate-800">
                        {/* Top Section */}
                        <div className="flex flex-col gap-6">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
                                <Link 
                                    className="text-xl font-bold tracking-tighter text-sky-700 dark:text-sky-400" 
                                    href={locale === 'en' ? '/' : `/${locale}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    TeleCurator
                                </Link>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg flex items-center justify-center transition-colors"
                                    aria-label="Close menu"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link 
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg font-bold transition-all ${
                                            item.isActive 
                                                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400' 
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-950 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                            {item.name}
                                        </span>
                                        <span className="material-symbols-outlined text-sm opacity-50 ltr:rotate-0 rtl:rotate-180">chevron_right</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Bottom Actions inside Drawer */}
                        <div className="flex flex-col gap-4 pt-6 border-t border-slate-100 dark:border-slate-900">
                            {/* "Add to TeleCurator" CTA button */}
                            <Link 
                                href={user ? `${prefix}/dashboard` : `${prefix}/login`} 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white text-center text-sm font-bold rounded-lg transition-all shadow-md shadow-sky-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                {dict.navAddGroup}
                            </Link>

                            {/* Profile details summary when logged in */}
                            {user && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg flex items-center gap-3 border border-slate-100 dark:border-slate-900">
                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                                        {user.email?.[0] || 'U'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-400 truncate">{locale === 'ar' ? 'مسجل كـ' : 'Logged in as'}</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
