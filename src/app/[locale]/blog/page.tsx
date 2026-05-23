import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getDictionary } from '@/lib/i18n';

export default async function BlogPage({ 
  params 
}: { 
  params: { locale: string } | Promise<{ locale: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('locale', locale)
    .order('created_at', { ascending: false });

  const featured = articles?.[0];
  const others = articles?.slice(1) || [];

  return (
    <>
      <main className="pt-4 lg:pt-24 pb-12 lg:pb-20 px-1.5 lg:px-6 max-w-[1536px] mx-auto min-h-screen font-['Inter','Tajawal']">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area (Blog Archive) */}
          <div className="lg:col-span-8">
            <header className="mb-10">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white uppercase">
                {dict.blogHeader || 'Curated Insights'}
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed font-bold uppercase tracking-widest opacity-80">
                {dict.blogSubheader || 'Market Analysis & Dynamic Ecosystem Updates'}
              </p>
            </header>

            {!featured && others.length === 0 && (
                <div className="p-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-outline-variant/10 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">edit_document</span>
                    <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white">{dict.blogEmptyTitle || 'Insights Pending'}</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{dict.blogEmptyDesc || 'We are currently preparing professional content for this section.'}</p>
                </div>
            )}

            {/* Featured Article */}
            {featured && (
              <Link href={`/${locale}/blog/${featured.slug}`} className="block group">
                <article className="relative mb-16 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 border border-outline-variant/5">
                  <div className="aspect-[21/9] overflow-hidden">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={featured.image_url || 'https://via.placeholder.com/800x400'} 
                      alt={featured.title}
                    />
                  </div>
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-primary text-white px-4 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-lg shadow-primary/20">Featured Insight</span>
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        {new Date(featured.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight leading-tight uppercase">
                      {featured.title}
                    </h2>
                    <p className="text-slate-500 mb-8 line-clamp-2 text-lg font-medium">
                      {featured.excerpt}
                    </p>
                    <div className="inline-flex items-center text-primary font-black uppercase tracking-[0.2em] text-xs gap-3 group/btn">
                      Read Full Analysis
                      <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Grid Archive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {others.map(article => (
                <Link key={article.id} href={`/${locale}/blog/${article.slug}`} className="block transition-transform hover:-translate-y-2">
                  <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/5 h-full flex flex-col">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-6 shadow-md">
                      <img className="w-full h-full object-cover" src={article.image_url || 'https://via.placeholder.com/400x225'} alt={article.title} />
                    </div>
                    <div className="flex-1">
                        <span className="text-primary text-[10px] font-black tracking-widest uppercase mb-3 inline-block">Analyst Insight</span>
                        <h3 className="text-xl font-black mb-3 tracking-tight leading-tight uppercase line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-slate-500 mb-6 font-medium line-clamp-2 opacity-80">{article.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Team Curator</span>
                      <span className="material-symbols-outlined text-primary text-xl">bookmark_add</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Newsletter */}
            <div className="bg-slate-900 text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-3 tracking-tighter uppercase">{dict.blogNewsletterTitle || 'Curated Digest'}</h4>
                <p className="text-slate-400 text-sm mb-8 font-bold uppercase tracking-widest opacity-80 leading-relaxed">Join 12,000+ ecosystem insiders receiving weekly alpha.</p>
                <input 
                  className="w-full h-14 px-6 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/40 mb-4 font-bold text-sm" 
                  placeholder="email@address.com" 
                  type="email"
                />
                <button className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                  Subscribe Now
                </button>
              </div>
              {/* Decor */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-container rounded-full blur-[100px] opacity-20"></div>
            </div>

            {/* Trending Tags (Simplified for now) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-outline-variant/10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">analytics</span>
                Trending Vectors
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Growth', 'Bots', 'Privacy', 'Crypto', 'Monetization', 'SEO'].map(tag => (
                  <Link key={tag} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all" href={`/${locale}/search?q=${tag}`}>{tag}</Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
