'use client';

import { useActionState } from 'react';
import { login } from '@/app/[locale]/auth/actions';

export function LoginForm({ locale, dict }: { locale: string; dict: any }) {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form className="space-y-5" action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      
      {state?.error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {state.error}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          {dict.emailLabel}
        </label>
        <div className="relative">
          <span className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <span className="material-symbols-outlined text-sm">mail</span>
          </span>
          <input 
            name="email"
            type="email" 
            placeholder="name@example.com" 
            className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl px-11 py-3.5 text-slate-900 dark:text-white transition-all text-sm font-medium outline-none" 
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          {dict.passwordLabel}
        </label>
        <div className="relative">
          <span className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <span className="material-symbols-outlined text-sm">lock</span>
          </span>
          <input 
            name="password"
            type="password" 
            placeholder="••••••••" 
            className="w-full bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl px-11 py-3.5 text-slate-900 dark:text-white transition-all text-sm font-medium outline-none" 
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (locale === 'ar' ? 'جاري الدخول...' : 'Signing in...') : dict.loginBtn}
        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
      </button>
    </form>
  );
}
