import Link from 'next/link';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm.client';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton.client';
import { getDictionary } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Login - The Digital Curator',
  description: 'Sign in to your account',
};

export default async function LoginPage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0f141a]">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-sky-400/10 dark:bg-sky-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-surface-container-low rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-200/50 dark:border-slate-800/50">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">{dict.loginTitle}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{dict.loginDesc}</p>
          </div>

          <LoginForm locale={locale} dict={dict} />

          <div className="mt-8 relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute"></div>
            <span className="bg-white dark:bg-surface-container-low px-4 text-xs font-medium text-slate-500 dark:text-slate-400 relative z-10">
              {dict.orContinue}
            </span>
          </div>

          <div className="mt-6">
            <GoogleSignInButton locale={locale} dict={dict} />
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {dict.noAccount}{' '}
            <Link href={locale === 'en' ? '/signup' : `/${locale}/signup`} className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
              {dict.signUpLink}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
