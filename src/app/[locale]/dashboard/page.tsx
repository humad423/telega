import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n';
import Image from 'next/image';

export default async function DashboardPage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch user entries
  const { data: userEntries } = await supabase
    .from('entries')
    .select('*, categories(name)')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false });

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: locale === 'ar' ? 'قيد المراجعة' : 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: locale === 'ar' ? 'مقبول' : 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rejected: { label: locale === 'ar' ? 'مرفوض' : 'Rejected', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' }
  };

  return (
    <main className="max-w-[1536px] mx-auto px-6 py-12 flex flex-col gap-10">
      
      {/* 1. Dashboard Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {dict.navDashboard || 'My Dashboard'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {locale === 'ar' ? 'أهلاً بك في لوحتك الخاصة' : 'Welcome to your private dashboard'}
          </p>
        </div>
        
        <Link 
          href={`/${locale}/dashboard/submit`}
          className="px-8 py-4 bg-primary text-white font-black rounded-lg transition-all shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined font-black">add</span>
          {dict.navAddGroup || 'Add New Listing'}
        </Link>
      </header>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'إجمالي الاشتراكات' : 'Total Listings'}</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2">{userEntries?.length || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'قيد المراجعة' : 'Pending'}</p>
          <h3 className="text-4xl font-black text-amber-600 mt-2">{userEntries?.filter(e => e.status === 'pending').length || 0}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'تم قبولها' : 'Approved'}</p>
          <h3 className="text-4xl font-black text-emerald-600 mt-2">{userEntries?.filter(e => e.status === 'approved').length || 0}</h3>
        </div>
      </div>

      {/* 3. Submissions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{locale === 'ar' ? 'طلباتك' : 'Your Submissions'}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-left rtl:text-right text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'العنصر' : 'Item'}</th>
                <th className="px-8 py-5 text-left rtl:text-right text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="px-8 py-5 text-left rtl:text-right text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'الرصيد' : 'Status'}</th>
                <th className="px-8 py-5 text-left rtl:text-right text-xs font-black text-slate-400 uppercase tracking-widest">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {userEntries && userEntries.length > 0 ? userEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                        <Image alt={entry.title} className="object-cover" src={entry.image_url || 'https://placehold.co//png'} fill sizes="48px" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{entry.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{entry.link}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                    {entry.type}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${statusMap[entry.status].color}`}>
                      {statusMap[entry.status].label}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-500 font-medium font-['Inter']">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">
                    {locale === 'ar' ? 'لا توجد طلبات بعد' : 'No submissions yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
