"use client";
// Force turbo rebuild
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type NavProps = {
  locale: string;
  dict: {
    navExplore: string;
    navGroups: string;
    navChannels: string;
    navBots: string;
    navBlog: string;
  };
};

function NavLinks({ locale, dict }: NavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get('type');

  const prefix = locale === 'en' ? '' : `/${locale}`;

  const navItems = [
    {
      name: dict.navExplore,
      href: `${prefix}/` || '/',
      isActive: pathname === `${prefix}` || pathname === `${prefix}/` || (prefix === '' && pathname === '/') || (pathname === `${prefix}/search` && !typeParam),
    },
    {
      name: dict.navGroups,
      href: `${prefix}/groups`,
      isActive: pathname.startsWith(`${prefix}/groups`),
    },
    {
      name: dict.navChannels,
      href: `${prefix}/channels`,
      isActive: pathname.startsWith(`${prefix}/channels`),
    },
    {
      name: dict.navBots,
      href: `${prefix}/bots`,
      isActive: pathname.startsWith(`${prefix}/bots`),
    },
    {
      name: dict.navBlog,
      href: `${prefix}/blog`,
      isActive: pathname.startsWith(`${prefix}/blog`),
    },
  ];

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => (
        <Link 
          key={item.href}
          href={item.href}
          className={`transition-all duration-300 ${
            item.isActive 
              ? 'text-sky-700 dark:text-sky-400 font-semibold border-b-2 border-sky-600 pb-1' 
              : 'text-slate-600 dark:text-slate-400 font-medium hover:text-sky-600 dark:hover:text-sky-300'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

export function HeaderNav(props: NavProps) {
  return (
    <Suspense fallback={
      <nav className="hidden md:flex items-center gap-6">
        <span className="text-slate-600 dark:text-slate-400 font-medium">{props.dict.navExplore}</span>
        <span className="text-slate-600 dark:text-slate-400 font-medium">{props.dict.navGroups}</span>
        <span className="text-slate-600 dark:text-slate-400 font-medium">{props.dict.navChannels}</span>
        <span className="text-slate-600 dark:text-slate-400 font-medium">{props.dict.navBots}</span>
        <span className="text-slate-600 dark:text-slate-400 font-medium">{props.dict.navBlog}</span>
      </nav>
    }>
      <NavLinks {...props} />
    </Suspense>
  );
}
