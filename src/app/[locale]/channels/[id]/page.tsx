import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from '@/lib/i18n';
import DirectoryCard from '@/components/ui/DirectoryCard';
import { getEntryBySlug, getEntries } from '@/lib/data';
import { notFound } from 'next/navigation';
import { formatMembers } from '@/lib/utils';

export const revalidate = 3600;

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string, id: string } | Promise<{ locale: string, id: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const id = decodeURIComponent(resolvedParams.id);
  const isAr = locale === 'ar';

  const entry = await getEntryBySlug(id, locale);
  if (!entry) return {};

  const title = isAr
    ? `رابط انضمام قناة ${entry.title} تيليجرام - دليل تليجا`
    : `Join ${entry.title} Telegram Channel Link - Telega`;

  const description = isAr
    ? `تصفح تفاصيل قناة ${entry.title} على تيليجرام وانضم إليها مباشرة. ${entry.description?.slice(0, 120)}...`
    : `Browse details and join ${entry.title} channel on Telegram. ${entry.description?.slice(0, 120)}...`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/channels/${id}`,
    },
    openGraph: {
      title,
      description,
      images: entry.image_url ? [{ url: entry.image_url }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: entry.image_url ? [entry.image_url] : [],
    }
  };
}

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
    language: entry.language?.toUpperCase() || (locale === 'ar' ? 'عربي' : 'EN'),
    lastUpdated: new Date(entry.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', year: '2-digit' }),
    tags: [entry.categories?.name, entry.is_verified ? 'Verified' : null].filter(Boolean),
    image: entry.image_url || 'https://placehold.co//png',
    link: entry.link
  };

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineCommunity',
    'name': entry.title,
    'description': entry.description,
    'image': entry.image_url || 'https://placehold.co/png',
    'url': `https://telega-beryl.vercel.app/${locale}/channels/${id}`,
    'memberCount': entry.members_count || 0
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      <main className="min-h-screen pt-4 lg:pt-12">
        
        {/* --- 1. Immersive Clean Hero Section --- */}
        <section className="relative w-full max-w-[1536px] mx-auto px-1.5 sm:px-6 pt-2 pb-3 sm:pb-6">
          
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

          <div className="bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-14 border border-slate-200/50 dark:border-slate-700/30 relative overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
            
            {/* Soft decorative blur */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            {/* Content Layout Container */}
            <div className="relative z-10 flex flex-col md:flex-row gap-5 md:gap-8 lg:gap-14 items-start md:items-center">
              
              {/* Mobile Avatar + Title (flex row on mobile, hidden on md) */}
              <div className="flex md:hidden items-center gap-3 w-full">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-md p-1 ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                  <Image 
                    className="object-cover rounded-lg" 
                    src={item.image} 
                    alt={item.title} 
                    fill
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {item.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 text-[8px] font-black uppercase tracking-wider border border-slate-200/50 dark:border-slate-700/50 shadow-sm font-['Tajawal']">
                        <span className="text-primary mr-0.5 rtl:mr-0 rtl:ml-0.5">#</span>{tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1 font-['Tajawal'] antialiased">
                    <span className="truncate">{item.title}</span>
                    {entry.is_verified && <span className="material-symbols-outlined text-sky-500 text-lg shrink-0" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>}
                  </h1>
                </div>
              </div>

              {/* Desktop Avatar (hidden on mobile, block on md) */}
              <div className="hidden md:flex relative shrink-0 justify-center">
                <div className="relative w-44 md:w-56 h-44 md:h-56 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl p-2.5 ring-1 ring-slate-200 dark:ring-slate-700 group transition-transform duration-500 hover:scale-105">
                  <Image 
                    className="object-cover rounded-lg" 
                    src={item.image} 
                    alt={item.title} 
                    fill
                    sizes="(max-width: 768px) 176px, 224px"
                    priority
                  />
                </div>
              </div>

              {/* Title & Info & Actions */}
              <div className="flex-1 space-y-4 md:space-y-5 w-full min-w-0">
                {/* Desktop-only tags & title */}
                <div className="hidden md:block space-y-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] border border-slate-200/50 dark:border-slate-700/50 shadow-sm font-['Inter','Tajawal']">
                        <span className="text-primary mr-1 rtl:mr-0 rtl:ml-1">#</span>{tag}
                      </span>
                    ))}
                  </div>
                  
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2 sm:gap-4 font-['Inter','Tajawal'] antialiased">
                    {item.title}
                    {entry.is_verified && <span className="material-symbols-outlined text-sky-500 text-2xl sm:text-4xl md:text-6xl" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>}
                  </h1>
                </div>
                
                <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-bold font-['Inter','Tajawal'] opacity-90">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 sm:gap-5 pt-1 sm:pt-6 w-full">
                  {/* Primary Join Button */}
                  <Link href={item.link || '#'} target="_blank" className="flex-1 sm:flex-none relative overflow-hidden group px-4 py-3 sm:px-10 sm:py-5 justify-center bg-primary hover:bg-sky-600 active:bg-sky-700 text-white font-black text-sm sm:text-xl rounded-xl shadow-xl shadow-primary/30 transition-all duration-300 active:scale-95 flex items-center gap-2 sm:gap-3 font-['Inter','Tajawal']">
                    <span className="material-symbols-outlined relative z-10 text-lg sm:text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>send</span>
                    <span className="relative z-10 tracking-tight whitespace-nowrap">{dict.detailsJoin}</span>
                  </Link>
                  
                  {/* Share Action */}
                  <button 
                    title="Share"
                    className="w-11 h-11 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center group active:scale-95 shadow-lg shadow-slate-200/10 dark:shadow-none"
                  >
                    <span className="material-symbols-outlined group-hover:text-primary transition-colors text-lg sm:text-2xl">share</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- 2. Clean Stats Grid --- */}
        <section className="relative z-30 max-w-[1536px] mx-auto px-1.5 sm:px-6 mb-10 sm:mb-16">
          <div className="grid grid-cols-4 gap-1 sm:gap-6">
            <div className="bg-surface-container-lowest p-1 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-rose-500 mb-1 sm:mb-3 text-xl sm:text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>groups</span>
              <div className="text-[9px] sm:text-3xl font-black text-slate-900 dark:text-white mb-0.5 font-['Inter'] truncate w-full px-0.5">{item.members}</div>
              <span className="text-[6px] sm:text-[10px] font-black uppercase tracking-normal sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-0.5">{dict.cardSubscribers}</span>
            </div>

            <div className="bg-surface-container-lowest p-1 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-amber-500 mb-1 sm:mb-3 text-xl sm:text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>category</span>
              <div className="text-[9px] sm:text-3xl font-black text-slate-900 dark:text-white mb-0.5 font-['Inter','Tajawal'] truncate w-full px-0.5">{item.category}</div>
              <span className="text-[6px] sm:text-[10px] font-black uppercase tracking-normal sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-0.5">{dict.breadcrumbCategory}</span>
            </div>

            <div className="bg-surface-container-lowest p-1 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-emerald-500 mb-1 sm:mb-3 text-xl sm:text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>translate</span>
              <div className="text-[9px] sm:text-3xl font-black text-slate-900 dark:text-white mb-0.5 font-['Inter'] truncate w-full px-0.5">{item.language}</div>
              <span className="text-[6px] sm:text-[10px] font-black uppercase tracking-normal sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-0.5">{locale === 'ar' ? 'اللغة' : 'Language'}</span>
            </div>

            <div className="bg-surface-container-lowest p-1 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden">
              <span className="material-symbols-outlined text-purple-500 mb-1 sm:mb-3 text-xl sm:text-4xl">update</span>
              <div className="text-[8px] sm:text-2xl font-black text-slate-900 dark:text-white mb-0.5 font-['Inter','Tajawal'] truncate w-full px-0.5">{item.lastUpdated}</div>
              <span className="text-[6px] sm:text-[10px] font-black uppercase tracking-normal sm:tracking-[0.2em] text-slate-400 font-['Inter','Tajawal'] truncate w-full px-0.5">{locale === 'ar' ? 'تحديث' : 'Updated'}</span>
            </div>
          </div>
        </section>

        {/* --- 3. Content Area --- */}
        <section className="max-w-[1536px] mx-auto px-1.5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 mb-16 sm:mb-24">
          <div className="lg:col-span-8 space-y-6 sm:space-y-10">
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-8 md:p-12 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6 sm:space-y-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white border-s-4 sm:border-s-8 border-primary ps-3 sm:ps-6 font-['Inter','Tajawal'] antialiased">
                {locale === 'ar' ? 'حول هذا المجتمع' : 'About this Community'}
              </h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base md:text-lg leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400 font-['Inter','Tajawal']">
                <p>{item.description}</p>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <button className="text-slate-400 hover:text-rose-500 font-bold transition-colors text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">flag</span>
                    {dict.detailsReport}
                 </button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6 sm:space-y-10">
            <div className="p-6 sm:p-10 bg-gradient-to-br from-surface-container to-surface-container-high rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center relative overflow-hidden group shadow-lg shadow-slate-100/50 dark:shadow-none">
              <div className="absolute top-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <span className="material-symbols-outlined text-3xl sm:text-5xl text-primary mb-4 sm:mb-6 bg-white dark:bg-slate-900 w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mx-auto rounded-xl shadow-xl transition-transform group-hover:scale-110">ads_click</span>
              <h4 className="font-black text-slate-800 dark:text-white text-lg sm:text-xl mb-3 font-['Inter','Tajawal']">{dict.promoteChannel}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 font-bold leading-relaxed">{dict.promoteDesc}</p>
              <button className="w-full py-3 sm:py-4 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-black text-xs sm:text-sm hover:opacity-90 transition-all shadow-xl active:scale-95">{dict.promoteBtn}</button>
            </div>
          </aside>
        </section>

        {/* --- Suggested Section --- */}
        <section className="bg-slate-50 dark:bg-slate-900/30 py-12 sm:py-24 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-[1536px] mx-auto px-1.5 sm:px-6">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight border-s-4 sm:border-s-8 border-primary ps-3 sm:ps-6 mb-8 sm:mb-12 font-['Inter','Tajawal'] antialiased">
              {locale === 'ar' ? 'مقترح لك' : 'Suggested for you'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
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
                      image: e.image_url || 'https://placehold.co//png'
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
