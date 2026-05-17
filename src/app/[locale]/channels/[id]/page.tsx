import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import DirectoryCard from '@/components/ui/DirectoryCard';
import { getEntryBySlug, getEntries } from '@/lib/data';
import { notFound } from 'next/navigation';
import { formatMembers } from '@/lib/utils';

export default async function DetailsPage({ 
  params 
}: { 
  params: { locale: string, id: string } | Promise<{ locale: string, id: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const id = decodeURIComponent(resolvedParams.id); // decoded slug
  const dict = await getDictionary(locale);

  const entry = await getEntryBySlug(id, locale);

  if (!entry) {
    notFound();
  }

  const { data: suggestedData } = await getEntries({ 
    locale, 
    type: 'channel', 
    categorySlug: entry.categories?.slug, 
    limit: 3 
  });
  const suggestedEntries = suggestedData || [];

  const prefix = locale === 'en' ? '' : `/${locale}`;
  
  const item = {
    title: entry.title,
    description: entry.description,
    members: formatMembers(entry.members_count),
    category: entry.categories?.name || dict.catGeneral,
    categorySlug: entry.categories?.slug || 'all',
    lastUpdated: new Date(entry.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US'),
    tags: [entry.categories?.name, entry.is_verified ? 'Verified' : null].filter(Boolean),
    image: entry.image_url || 'https://via.placeholder.com/300',
    link: entry.link
  };

  return (
    <>
      <main className="min-h-screen pt-12">
        
        {/* --- 1. Immersive Clean Hero Section --- */}
        <section className="relative w-full max-w-[1536px] mx-auto px-6 pt-2 pb-12">
          
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 w-fit px-4 sm:px-5 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-surface-container-lowest shadow-sm font-['Inter','Tajawal']">
            <Link href={prefix || '/'} className="hover:text-primary transition-colors">{dict.breadcrumbHome}</Link>
            <span className="material-symbols-outlined text-[10px] sm:text-xs rtl:rotate-180">chevron_right</span>
            <Link href={`${prefix}/channels`} className="hover:text-primary transition-colors">{dict.breadcrumbChannels}</Link>
            <span className="material-symbols-outlined text-[10px] sm:text-xs rtl:rotate-180">chevron_right</span>
            <Link href={`${prefix}/category/${item.categorySlug}`} className="hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-none">{item.category}</Link>
            <span className="material-symbols-outlined text-[10px] sm:text-xs rtl:rotate-180">chevron_right</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[120px] sm:max-w-none">{item.title}</span>
          </nav>

          <div className="bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container rounded-3xl p-6 sm:p-8 md:p-14 border border-slate-200/50 dark:border-slate-700/30 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-14 items-start lg:items-center relative overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
            
            {/* Soft decorative blur */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            {/* Avatar */}
            <div className="relative shrink-0 z-10 w-full sm:w-fit flex justify-center">
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl p-2.5 ring-1 ring-slate-200 dark:ring-slate-700 group transition-transform duration-500 hover:scale-105">
                <img 
                  className="w-full h-full object-cover rounded-lg" 
                  src={item.image} 
                  alt={item.title} 
                />
              </div>
            </div>

            {/* Title & Info */}
            <div className="flex-1 space-y-5 z-10">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                {item.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.15em] border border-slate-200/50 dark:border-slate-700/50 shadow-sm font-['Inter','Tajawal']">
                    <span className="text-primary mr-1 rtl:mr-0 rtl:ml-1">#</span>{tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2 sm:gap-4 font-['Inter','Tajawal'] antialiased">
                {item.title}
                {entry.is_verified && <span className="material-symbols-outlined text-sky-500 text-3xl sm:text-4xl md:text-6xl" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>}
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-bold font-['Inter','Tajawal'] opacity-90">
                {item.description}
              </p>

              <div className="flex items-center gap-3 sm:gap-5 pt-4 sm:pt-6 w-full">
                {/* Primary Join Button */}
                <Link href={item.link || '#'} target="_blank" className="flex-1 sm:flex-none relative overflow-hidden group px-4 py-3 sm:px-10 sm:py-5 justify-center bg-primary hover:bg-sky-600 active:bg-sky-700 text-white font-black text-base sm:text-xl rounded-xl shadow-xl shadow-primary/30 transition-all duration-300 active:scale-95 flex items-center gap-2 sm:gap-3 font-['Inter','Tajawal']">
                  <span className="material-symbols-outlined relative z-10 text-xl sm:text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>send</span>
                  <span className="relative z-10 tracking-tight whitespace-nowrap">{dict.detailsJoin}</span>
                </Link>
                
                {/* Secondary Actions */}
                <button 
                  title="Share"
                  className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center group active:scale-95 shadow-lg shadow-slate-200/10 dark:shadow-none"
                >
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors text-xl sm:text-2xl">share</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* --- 2. Clean Stats Grid --- */}
        <section className="relative z-30 max-w-[1536px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-rose-500 mb-2 sm:mb-3 text-3xl sm:text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>groups</span>
              <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 font-['Inter'] truncate w-full px-2">{item.members}</div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-1">{dict.cardSubscribers}</span>
            </div>

            <div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-amber-500 mb-2 sm:mb-3 text-3xl sm:text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>category</span>
              <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 font-['Inter','Tajawal'] truncate w-full px-2">{item.category}</div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-1">{dict.breadcrumbCategory}</span>
            </div>

            <div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-emerald-500 mb-2 sm:mb-3 text-3xl sm:text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>translate</span>
              <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 font-['Inter'] truncate w-full px-2">EN / AR</div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-1">{locale === 'ar' ? 'اللغة' : 'Language'}</span>
            </div>

            <div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-purple-500 mb-2 sm:mb-3 text-3xl sm:text-4xl">update</span>
              <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 font-['Inter','Tajawal'] truncate w-full px-2">{item.lastUpdated}</div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-1">{locale === 'ar' ? 'آخر تحديث' : 'Last Updated'}</span>
            </div>
          </div>
        </section>

        {/* --- 3. Content Area --- */}
        <section className="max-w-[1536px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-24">
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-8">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white border-s-8 border-primary ps-6 font-['Inter','Tajawal'] antialiased">
                {locale === 'ar' ? 'حول هذا المجتمع' : 'About this Community'}
              </h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400 font-['Inter','Tajawal']">
                <p>{item.description}</p>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <button className="text-slate-400 hover:text-rose-500 font-bold transition-colors text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">flag</span>
                    {dict.detailsReport}
                 </button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div className="p-10 bg-gradient-to-br from-surface-container to-surface-container-high rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center relative overflow-hidden group shadow-lg shadow-slate-100/50 dark:shadow-none">
              <div className="absolute top-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <span className="material-symbols-outlined text-5xl text-primary mb-6 bg-white dark:bg-slate-900 w-20 h-20 flex items-center justify-center mx-auto rounded-xl shadow-xl transition-transform group-hover:scale-110">ads_click</span>
              <h4 className="font-black text-slate-800 dark:text-white text-xl mb-3 font-['Inter','Tajawal']">{dict.promoteChannel}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-bold leading-relaxed">{dict.promoteDesc}</p>
              <button className="w-full py-4 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-black text-sm hover:opacity-90 transition-all shadow-xl active:scale-95">{dict.promoteBtn}</button>
            </div>
          </aside>
        </section>

        {/* --- Suggested Section --- */}
        <section className="bg-slate-50 dark:bg-slate-900/30 py-24 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-[1536px] mx-auto px-6">
            <h2 className="text-3xl font-black tracking-tight border-s-8 border-primary ps-6 mb-12 font-['Inter','Tajawal'] antialiased">
              {locale === 'ar' ? 'مقترح لك' : 'Suggested for you'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {suggestedEntries.map((e: any) => (
                 <DirectoryCard 
                    key={e.id}
                    locale={locale}
                    dict={dict}
                    item={{
                      id: e.slug || e.id,
                      title: e.title,
                      members: formatMembers(e.members_count),
                      description: e.description,
                      type: e.type,
                      image: e.image_url || 'https://via.placeholder.com/200'
                    }}
                 />
               ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
