import { getDictionary } from '@/lib/i18n';
import SubmitForm from '@/components/dashboard/SubmitForm.client';
import { createClient } from '@/utils/supabase/server';

export default async function SubmitEntryPage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);
  
  // Fetch all categories to allow client-side filtering by entry language
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories').select('*');

  return (
    <main className="min-h-[calc(100vh-80px)] py-12 px-6 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-slate-200/60 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none">
        
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            {locale === 'ar' ? 'نمو سريع لمجتمعك' : 'Grow Your Community Fast'}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase italic">
            {locale === 'ar' ? 'أضف قناتك أو مجموعتك' : 'Global Submission'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {locale === 'ar' ? 'شارك مجتمعك مع آلاف المهتمين مجاناً وبكل سهولة' : 'Share your community with thousands of users with a single link.'}
          </p>
        </header>

        <SubmitForm categories={categories || []} locale={locale} dict={dict} />
      </div>
    </main>
  );
}
