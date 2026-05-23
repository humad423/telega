import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { getDictionary } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string } | Promise<{ locale: string }> }): Promise<Metadata> {
    const resolvedParams = await Promise.resolve(params);
    const locale = resolvedParams.locale;
    const dict = await getDictionary(locale);
    
    return {
        title: `${dict.blogTitle || 'Blog'} | TeleCurator`,
        description: dict.blogSubheader || 'The ultimate directory to discover the best channels, groups, and bots on Telegram.',
        alternates: {
            canonical: `/${locale}/blog`,
        }
    };
}
export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage({ 
  params,
  searchParams
}: { 
  params: { locale: string } | Promise<{ locale: string }>,
  searchParams: { category?: string } | Promise<{ category?: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearch = await Promise.resolve(searchParams);
  const locale = resolvedParams.locale;
  const currentCategory = resolvedSearch.category || 'all';
  const dict = await getDictionary(locale);

  // Fetch articles
  let query = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('locale', locale)
    .order('created_at', { ascending: false });

  if (currentCategory !== 'all') {
    // If the database doesn't have category yet, this will filter out, 
    // but we assume category might be a column later.
    query = query.eq('category', currentCategory);
  }

  const { data: articles } = await query;
  
  const allArticles = articles || [];
  const featured = currentCategory === 'all' ? allArticles[0] : null;
  const others = currentCategory === 'all' ? allArticles.slice(1) : allArticles;

  // Mock Categories for SEO and filtering
  const categories = [
    { id: 'all', name: locale === 'ar' ? 'الكل' : 'All' },
    { id: 'tips', name: locale === 'ar' ? 'شروحات' : 'Tips & Tricks' },
    { id: 'news', name: locale === 'ar' ? 'أخبار وتحديثات' : 'News & Updates' },
    { id: 'marketing', name: locale === 'ar' ? 'تسويق' : 'Marketing' },
  ];

  return (
    <>
      <main className="pt-8 lg:pt-20 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1536px] mx-auto min-h-screen font-['Inter','Tajawal'] relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header className="mb-12 text-center max-w-3xl mx-auto">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-widest mb-4">
            {dict.blogHeader || 'Curated Insights'}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white leading-tight">
            {locale === 'ar' ? 'اكتشف أسرار وتحديثات تيليجرام' : 'Discover Telegram Secrets & Updates'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            {dict.blogSubheader || 'Read the latest insights, tutorials, and ecosystem updates.'}
          </p>
        </header>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-16 flex-wrap">
            {categories.map((cat) => (
                <Link 
                    key={cat.id} 
                    href={`/${locale}/blog${cat.id === 'all' ? '' : `?category=${cat.id}`}`}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                        currentCategory === cat.id 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/10 scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                    }`}
                >
                    {cat.name}
                </Link>
            ))}
        </div>

        {allArticles.length === 0 && (
            <div className="p-16 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-400">edit_document</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{dict.blogEmptyTitle || 'Insights Pending'}</h3>
                <p className="text-slate-500 font-medium">{dict.blogEmptyDesc || 'We are currently preparing professional content for this section.'}</p>
            </div>
        )}

        {/* Featured Article Hero */}
        {featured && (
          <Link href={`/${locale}/blog/${featured.slug}`} className="block group mb-16">
            <article className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all duration-500 border border-slate-200/50 dark:border-slate-800/50 flex flex-col lg:flex-row items-center hover:border-primary/30">
              <div className="lg:w-3/5 w-full aspect-video lg:aspect-auto lg:h-[450px] relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all duration-500 z-10"></div>
                <Image 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  src={featured.image_url || 'https://placehold.co//png'} 
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase shadow-sm">
                        {locale === 'ar' ? 'مقال مميز' : 'Featured'}
                    </span>
                </div>
              </div>
              <div className="lg:w-2/5 w-full p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary mb-4">
                  <span>{new Date(featured.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> 5 Min Read</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight leading-tight text-slate-900 dark:text-white">
                  {featured.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 text-base md:text-lg font-medium leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">person</span>
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">TeleCurator Editor</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{locale === 'ar' ? 'فريق التحرير' : 'Editorial Team'}</p>
                    </div>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Grid Archive */}
        {others.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {others.map(article => (
                <Link key={article.id} href={`/${locale}/blog/${article.slug}`} className="block group">
                <article className="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-md shadow-slate-200/20 dark:shadow-none hover:shadow-xl transition-all duration-500 border border-slate-200/60 dark:border-slate-800 h-full flex flex-col group-hover:-translate-y-1 group-hover:border-primary/20">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 relative">
                    <Image className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" src={article.image_url || 'https://placehold.co//png'} alt={article.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {locale === 'ar' ? 'مقالات' : 'Article'}
                    </div>
                    </div>
                    <div className="px-3 pb-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                            <span>{new Date(article.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> 3 Min</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-black mb-3 tracking-tight leading-snug text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium line-clamp-2 leading-relaxed">
                            {article.excerpt}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[12px] text-slate-500">person</span>
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Editor</span>
                            </div>
                            <span className="material-symbols-outlined text-primary text-xl -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all rtl:translate-x-2 rtl:group-hover:translate-x-0">arrow_forward</span>
                        </div>
                    </div>
                </article>
                </Link>
            ))}
            </div>
        )}
      </main>
    </>
  );
}
