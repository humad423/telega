'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
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
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const switchLanguage = (newLocale: string) => {
        if (typeof window !== 'undefined' && (window as any).__localePaths) {
            const registeredPaths = (window as any).__localePaths;
            if (registeredPaths[newLocale]) {
                setIsMobileMenuOpen(false);
                router.push(registeredPaths[newLocale]);
                return;
            }
        }
        let newPath = pathname;
        if (newLocale === 'ar') {
            if (!pathname.startsWith('/ar') && pathname !== '/ar') {
                newPath = `/ar${pathname === '/' ? '' : pathname}`;
            }
        } else {
            if (pathname.startsWith('/ar/')) {
                newPath = pathname.substring(3);
            } else if (pathname === '/ar') {
                newPath = '/';
            }
        }
        setIsMobileMenuOpen(false);
        router.push(newPath || '/');
    };

    useEffect(() => {
        setMounted(true);
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
                <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 max-w-[1536px] mx-auto w-full font-['Inter','Tajawal'] antialiased tracking-tight">
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
                            className="md:hidden p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors active:scale-95 ml-1 rtl:ml-0 rtl:mr-1"
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
                    <div className="fixed top-0 bottom-0 ltr:right-0 rtl:left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-950 p-6 shadow-2xl flex flex-col justify-start overflow-y-auto transition-transform duration-300 ease-out transform translate-x-0 animate-in slide-in-from-right rtl:slide-in-from-left font-['Inter','Tajawal'] border-l ltr:border-slate-200 rtl:border-r rtl:border-slate-800 dark:border-slate-800">
                        {/* Top Section */}
                        <div className="flex flex-col gap-6 pb-6">
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
                            {/* Drawer Settings (Theme & Lang) */}
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={toggleTheme}
                                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-800"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {mounted && resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
                                    </span>
                                    {mounted && resolvedTheme === 'dark' ? (locale === 'ar' ? 'الوضع النهاري' : 'Light Mode') : (locale === 'ar' ? 'الوضع الليلي' : 'Dark Mode')}
                                </button>

                                <button 
                                    onClick={() => switchLanguage(locale === 'en' ? 'ar' : 'en')}
                                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-800"
                                >
                                    <span className="material-symbols-outlined text-xl">language</span>
                                    {locale === 'en' ? 'العربية' : 'English'}
                                </button>
                            </div>

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

            <footer className="w-full relative overflow-hidden border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 font-['Inter','Tajawal']">
                {/* Background ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-[1536px] mx-auto px-6 pt-16 pb-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
                        
                        {/* 1. Brand Column */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <Link href={`/${locale}`} className="flex items-center gap-3 w-fit group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-active:scale-95">
                                    <span className="material-symbols-outlined text-[24px]">send</span>
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">
                                    TeleCurator
                                </span>
                            </Link>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                                {locale === 'ar' 
                                    ? 'الدليل الشامل والأفضل لاكتشاف أروع القنوات، المجموعات، والبوتات على تيليجرام. انضم لمجتمعنا وشارك مواردك!' 
                                    : 'The ultimate directory to discover the best channels, groups, and bots on Telegram. Join our community and share your resources!'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.027-2.76-.863c-.6-.188-.614-.6.126-.89l10.81-4.168c.5-.188.94.116.805.903z"/></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* 2. Quick Links */}
                        <div className="lg:col-span-2 lg:col-start-6 flex flex-col gap-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-sm mb-2">
                                {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                            </h3>
                            <Link href={`/${locale}`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.breadcrumbHome}
                            </Link>
                            <Link href={`/${locale}/channels`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.navChannels}
                            </Link>
                            <Link href={`/${locale}/groups`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.navGroups}
                            </Link>
                            <Link href={`/${locale}/bots`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.navBots}
                            </Link>
                        </div>

                        {/* 3. Legal & Support */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-sm mb-2">
                                {locale === 'ar' ? 'الدعم والقانونية' : 'Legal & Support'}
                            </h3>
                            <Link href={`/${locale}/about`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.footerAbout}
                            </Link>
                            <Link href={`/${locale}/contact`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.footerContact}
                            </Link>
                            <Link href={`/${locale}/privacy`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.footerPrivacy}
                            </Link>
                            <Link href={`/${locale}/terms`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium w-fit group flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0 rtl:ml-0 rtl:-mr-5 rtl:group-hover:mr-0">chevron_right</span>
                                {dict.footerTerms}
                            </Link>
                        </div>

                        {/* 4. CTA / Submit */}
                        <div className="lg:col-span-3 flex flex-col gap-4">
                            <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-sm mb-2">
                                {locale === 'ar' ? 'أضف قناتك/مجموعتك' : 'Add Your Resource'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
                                {locale === 'ar' ? 'هل تملك قناة أو بوت مفيد؟ أضفه الآن لدليلنا للوصول لآلاف المستخدمين مجاناً.' : 'Have a useful channel or bot? Add it to our directory now to reach thousands of users for free.'}
                            </p>
                            <Link href={`/${locale}/contact`} className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl overflow-hidden shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-primary/30 transition-all active:scale-95">
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    {locale === 'ar' ? 'أضف الآن' : 'Submit Now'}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-start">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            © {new Date().getFullYear()} TeleCurator. {dict.footerRights}
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                Made with <span className="material-symbols-outlined text-[14px] text-rose-500" style={{fontVariationSettings: '"FILL" 1'}}>favorite</span>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
