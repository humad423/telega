import React from 'react';
import { Inter, Tajawal } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/Providers';
import { getDictionary } from '@/lib/i18n';
import { SiteShell } from '@/components/layout/Shell.client';
import NextTopLoader from 'nextjs-toploader';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({ subsets: ['arabic'], weight: ['400', '500', '700', '800'], variable: '--font-tajawal' });

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export async function generateMetadata({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const isAr = locale === 'ar';

  const title = isAr 
    ? 'تليجا - دليل قنوات ومجموعات وبوتات تيليجرام'
    : 'Telega - Telegram Channels, Groups & Bots Directory';

  const description = isAr
    ? 'تليجا هو الدليل النهائي والمنصة الأكبر لاكتشاف وتصفح أفضل قنوات ومجموعات وبوتات تيليجرام المصنفة والموثقة.'
    : 'Telega is the ultimate and largest directory to discover and browse the best Telegram channels, groups, and bots, verified and categorized.';

  return {
    title: {
      template: isAr ? '%s | تليجا' : '%s | Telega',
      default: title,
    },
    description,
    metadataBase: new URL('https://telega-beryl.vercel.app'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ar': '/ar',
        'en': '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      title,
      description,
      siteName: 'Telega',
      locale: isAr ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode, params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-primary/20 overflow-x-hidden">
        <NextTopLoader color="#f59e0b" height={2} showSpinner={false} initialPosition={0.75} speed={100} crawlSpeed={50} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SiteShell locale={locale} dict={dict}>
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
