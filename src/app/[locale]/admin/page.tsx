import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { approveEntry, rejectEntry, deleteEntry, toggleFeatured, toggleVerified, toggleAdmin, upsertSliderItem, deleteSliderItem, upsertEntry, upsertCategory, deleteCategory, toggleBan, updateProfile } from './actions';
import Link from 'next/link';
import Image from 'next/image';
import { SliderManager } from '@/components/admin/SliderManager.client';
import { DirectoryManager } from '@/components/admin/DirectoryManager.client';
import { UserManager } from '@/components/admin/UserManager.client';
import { CategoryManager } from '@/components/admin/CategoryManager.client';
import { ArticleManager } from '@/components/admin/ArticleManager.client';
import { PageManager } from '@/components/admin/PageManager.client';
import { AdminSidebar } from '@/components/admin/AdminSidebar.client';
import { getDictionary } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ 
  params, 
  searchParams 
}: { 
  params: { locale: string } | Promise<{ locale: string }>,
  searchParams: { tab?: string, userId?: string } | Promise<{ tab?: string, userId?: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const locale = resolvedParams.locale;
  const tab = resolvedSearchParams.tab || 'overview';
  const supabase = await createClient();

  const dict = await getDictionary(locale);

  // 1. Auth & Admin Authorization check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect(`/${locale}/dashboard`);

  // 2. Fetch required data based on tab
  let content = null;

  switch (tab) {
    case 'overview':
      const stats = {
        totalEntries: (await supabase.from('entries').select('*', { count: 'exact', head: true })).count || 0,
        pendingCount: (await supabase.from('entries').select('*', { count: 'exact', head: true }).eq('status', 'pending')).count || 0,
        totalUsers: (await supabase.from('profiles').select('*', { count: 'exact', head: true })).count || 0,
        featuredCount: (await supabase.from('entries').select('*', { count: 'exact', head: true }).eq('is_featured', true)).count || 0,
      };
      content = renderOverview(stats, dict);
      break;

    case 'review':
      const { data: pending } = await supabase
        .from('entries')
        .select('*, categories(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      content = renderReviewQueue(pending || [], dict);
      break;

    case 'slider':
      const { data: slides } = await supabase
        .from('slider_items')
        .select('*')
        .order('order_index', { ascending: true });
      content = <SliderManager initialSlides={slides || []} locale={locale} />;
      break;

    case 'users':
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      content = <UserManager users={users || []} locale={locale} />;
      break;

    case 'directory':
      const userId = resolvedSearchParams.userId;
      let query = supabase.from('entries').select('*');
      if (userId) {
        query = query.eq('submitted_by', userId);
      }
      
      const { data: allEntries } = await query.order('created_at', { ascending: false }).limit(200);
      
      const { data: categoriesForDir } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      content = <DirectoryManager initialEntries={allEntries || []} categories={categoriesForDir || []} locale={locale} />;
      break;

    case 'categories':
      const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      content = <CategoryManager initialCategories={allCategories || []} locale={locale} />;
      break;

    case 'articles':
      const { data: allArticles } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      content = <ArticleManager initialArticles={allArticles || []} locale={locale} />;
      break;

    case 'pages':
      const { data: allPages } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });
      content = <PageManager initialPages={allPages || []} locale={locale} />;
      break;

    default:
      content = <div className="p-12 text-center text-slate-500">Coming Soon...</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-black">
      <AdminSidebar locale={locale} tab={tab} dict={dict} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {content}
      </main>
    </div>
  );
}

// --- SUB-RENDERERS ---

function renderOverview(stats: any, dict: any) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label={dict.adminTotalEntries} value={stats.totalEntries} icon="database" color="blue" />
            <StatCard label={dict.adminPendingReview} value={stats.pendingCount} icon="hourglass_empty" color="amber" />
            <StatCard label={dict.adminFeaturedItems} value={stats.featuredCount} icon="star" color="purple" />
            <StatCard label={dict.adminTotalUsers} value={stats.totalUsers} icon="group" color="emerald" />
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
    );
}

function renderReviewQueue(entries: any[], dict: any) {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{dict.adminReviewList}</h2>
            </header>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {entries.length === 0 ? <p className="text-slate-500">{dict.adminNoPending}</p> : entries.map(entry => {
                    const approveAction = approveEntry.bind(null, entry.id) as any;
                    const rejectAction = rejectEntry.bind(null, entry.id) as any;
                    return (
                        <div key={entry.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-outline-variant/10 flex flex-col gap-4 shadow-sm">
                            <div className="flex gap-4">
                                <Image src={entry.image_url || '/placeholder.png'} className="rounded-xl object-cover bg-slate-100" width={64} height={64} alt={entry.title} />
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg">{entry.title}</h4>
                                    <p className="text-xs text-primary font-bold uppercase">{entry.categories?.name}</p>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{entry.link}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{entry.description}</p>
                            <div className="flex gap-3 mt-2">
                                 <form action={approveAction} className="flex-1">
                                    <button className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20">{dict.adminApprove}</button>
                                 </form>
                                 <form action={rejectAction} className="flex-1">
                                    <button className="w-full bg-slate-100 dark:bg-slate-800 py-3 rounded-xl font-bold text-sm">{dict.adminReject}</button>
                                 </form> 
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}



