"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { signOut } from "@/app/[locale]/auth/actions";

import Link from "next/link";

export function HeaderActions({ dict, locale }: { dict: any, locale: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Get initial session and re-fetch on navigation
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user ?? null;
      setUser(user);
      if (user) {
        supabase.from('profiles').select('is_admin').eq('id', user.id).single().then((profileRes: any) => {
          setIsAdmin(profileRes.data?.is_admin ?? false);
        });
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
        setIsAdmin(data?.is_admin ?? false);
      } else {
        setIsAdmin(false);
      }
    });

    // Close dropdowns on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const switchLanguage = (newLocale: string) => {
    // Check if there is a registered path mapping in window.__localePaths
    if (typeof window !== 'undefined' && (window as any).__localePaths) {
      const registeredPaths = (window as any).__localePaths;
      if (registeredPaths[newLocale]) {
        setLangOpen(false);
        router.push(registeredPaths[newLocale]);
        return;
      }
    }

    let newPath = pathname;
    
    if (newLocale === 'ar') {
      // Switch to Arabic: if path doesn't start with /ar, prepend /ar
      if (!pathname.startsWith('/ar') && pathname !== '/ar') {
        newPath = `/ar${pathname === '/' ? '' : pathname}`;
      }
    } else {
      // Switch to English: if path starts with /ar, remove the /ar segment
      if (pathname.startsWith('/ar/')) {
        newPath = pathname.substring(3);
      } else if (pathname === '/ar') {
        newPath = '/';
      }
    }
    
    setLangOpen(false);
    router.push(newPath || '/');
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut(locale);
  };

  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      
      {/* 1. Add Group Link */}
      <Link 
        href={user ? `${prefix}/dashboard` : `${prefix}/login`} 
        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-md transition-all shadow-md shadow-sky-600/20 active:scale-95 hidden lg:block"
      >
        {dict.navAddGroup}
      </Link>

      {/* 2. Authentication Section */}
      {!user ? (
        <Link 
          href={`${prefix}/login`}
          className="p-2 sm:px-5 sm:py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-md transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px] sm:hidden">login</span>
          <span className="hidden sm:inline">{dict.navSignIn}</span>
        </Link>
      ) : (
        <div className="relative" ref={userRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-9 h-9 rounded bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-black shadow-sm ring-2 ring-white dark:ring-slate-900 uppercase">
               {user.email?.[0] || 'U'}
            </div>
            <span className="material-symbols-outlined text-slate-400 text-sm hidden sm:block">expand_more</span>
          </button>

          {userMenuOpen && (
            <div className="absolute top-12 right-0 rtl:right-auto rtl:left-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col min-w-[200px] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'مرحباً' : 'Welcome'}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
              </div>
              
              <Link 
                href={`${prefix}/dashboard`}
                onClick={() => setUserMenuOpen(false)}
                className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                {dict.navDashboard}
              </Link>

              {isAdmin && (
                <Link 
                  href={`${prefix}/admin`}
                  onClick={() => setUserMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-amber-600 flex items-center gap-3 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="px-4 py-3 text-sm font-bold text-rose-600 flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border-t border-slate-100 dark:border-slate-800/50 w-full text-left rtl:text-right"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                {dict.navSignOut}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 3. Language Selector */}
      <div className="relative" ref={langRef}>
        <button 
          onClick={() => setLangOpen(!langOpen)}
          className={`p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-lg flex items-center justify-center ${langOpen ? 'bg-slate-100 dark:bg-slate-800 shadow-inner' : ''}`}
          aria-label="Toggle language"
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">language</span>
        </button>
        
        {langOpen && (
          <div className="absolute top-12 right-0 rtl:right-auto rtl:left-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl flex flex-col min-w-[150px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <button 
              onClick={() => switchLanguage('en')} 
              className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-colors ${locale === 'en' ? 'text-primary' : ''}`}
            >
              <span className="text-xl">🇺🇸</span> English {locale === 'en' && '✓'}
            </button>
            <button 
              onClick={() => switchLanguage('ar')} 
              className={`px-4 py-3.5 text-sm font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-colors border-t border-slate-100 dark:border-slate-800/50 ${locale === 'ar' ? 'text-primary' : ''}`}
            >
              <span className="text-xl">🇸🇦</span> العربية {locale === 'ar' && '✓'}
            </button>
          </div>
        )}
      </div>

      {/* 4. Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-lg flex items-center justify-center group"
        aria-label="Toggle dark mode"
      >
        {mounted && resolvedTheme === "dark" ? (
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 group-hover:text-amber-400 group-hover:rotate-45 transition-all">light_mode</span>
        ) : (
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 group-hover:text-sky-600 group-hover:-rotate-12 transition-all">dark_mode</span>
        )}
      </button>
    </div>
  );
}
