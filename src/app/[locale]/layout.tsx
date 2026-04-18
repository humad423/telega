import { Inter, Tajawal } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/Providers';
import { getDictionary } from '@/lib/i18n';
import { SiteShell } from '@/components/layout/Shell.client';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({ subsets: ['arabic'], weight: ['400', '500', '700', '800'], variable: '--font-tajawal' });

export default async function LocaleLayout({ children, params }: { children: React.ReactNode, params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-primary/20">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteShell locale={locale} dict={dict}>
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
