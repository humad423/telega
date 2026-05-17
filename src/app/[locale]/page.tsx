import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { HeroSlider } from '@/components/home/HeroSlider';
import SearchBar from '@/components/ui/SearchBar';
import { getEntries, getCategories, getSliderItems } from '@/lib/data';
import DirectoryCard from '@/components/ui/DirectoryCard';
import { formatMembers } from '@/lib/utils';

export default async function Home({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);

  // Fetch real data from Supabase
  const slides = await getSliderItems(locale);
  const categories = await getCategories(locale);
  const { data: featuredData } = await getEntries({ locale, limit: 12, isFeatured: true });
  const { data: topChannelsData } = await getEntries({ locale, type: 'channel', limit: 6 });
  const { data: topGroupsData } = await getEntries({ locale, type: 'group', limit: 6 });
  const { data: topBotsData } = await getEntries({ locale, type: 'bot', limit: 6 });
  const { data: verifiedData } = await getEntries({ locale, limit: 12, isVerified: true });

  const featured = featuredData || [];
  const topChannels = topChannelsData || [];
  const topGroups = topGroupsData || [];
  const topBots = topBotsData || [];
  const verified = verifiedData || [];

  // Map entries to DirectoryItem format for the cards
  const mapEntry = (e: any) => ({
    id: e.slug || e.id,
    title: e.title,
    description: e.description,
    members: formatMembers(e.members_count),
    type: e.type,
    image: e.image_url || 'https://via.placeholder.com/150',
    is_verified: e.is_verified || false
  });

  return (
    <>
      <HeroSlider locale={locale} dict={dict} slides={slides} />
      <main className="max-w-[1536px] mx-auto px-6 pt-12 pb-8 space-y-16">
        {/* 2. Featured Showcase */}
        <section className="space-y-8">
<div className="flex items-end justify-between">
<div>
<h2 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
  <span className="material-symbols-outlined text-amber-500" data-icon="star">star</span>
  {dict.featuredChannels}
</h2>
<p className="text-on-surface-variant mt-1 text-sm font-medium opacity-80">{dict.featuredDesc}</p>
</div>
</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {featured.length > 0 ? featured.map((item: any) => (
        <div key={item.id} className="relative overflow-hidden bg-gradient-to-br from-white dark:from-surface-container to-amber-50/50 dark:to-amber-900/10 p-5 rounded-xl border border-amber-200/50 dark:border-amber-700/30 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 w-full">
            <div className="flex items-center gap-4 w-full sm:w-auto flex-grow min-w-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0 bg-surface-container ring-2 ring-amber-400/30 ring-offset-2 ring-offset-white dark:ring-offset-surface-container">
                <img alt={item.title} className="w-full h-full object-cover" src={item.image_url || 'https://via.placeholder.com/150'}/>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg md:text-2xl text-slate-900 dark:text-white truncate">{item.title}</h3>
                  {item.is_verified && <span className="material-symbols-outlined text-sky-500 text-lg shrink-0" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>}
                  <span className="shrink-0 px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-widest border border-sky-200 dark:border-sky-700/50">
                    {item.type === 'channel' ? dict.tagChannel : item.type === 'group' ? dict.tagGroup : dict.tagBot}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">groups</span> {formatMembers(item.members_count)}</span>
                  {item.categories && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">category</span> {item.categories.name}</span>}
                </div>
                <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 mt-2 md:mt-2.5 line-clamp-2 pr-4">{item.description}</p>
              </div>
            </div>
            <Link className="mt-4 sm:mt-0 w-full sm:w-auto text-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap" href={`/${locale}/${item.type}s/${item.slug || item.id}`}>{dict.btnJoin}</Link>
          </div>
        </div>
      )) : (
        <div className="col-span-full py-12 text-center text-slate-400">No featured items found in this language.</div>
      )}
    </div>
</section>


{/* 3. Search & Filters */}
<section className="space-y-6">
<SearchBar placeholder={dict.searchPlaceholder} locale={locale} />
        <div className="flex gap-4 justify-start sm:justify-center overflow-x-auto no-scrollbar pb-6 pt-3 px-2">
          <Link href={`/${locale}/category/all`} className="shrink-0 group flex items-center gap-3 px-8 py-3.5 rounded-lg bg-primary text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 whitespace-nowrap border border-transparent">
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
            {dict.catAll}
          </Link>
          {categories.slice(0, 5).map((cat: any) => (
            <Link key={cat.id} href={`/${locale}/category/${cat.slug}`} className="shrink-0 group flex items-center gap-3 px-8 py-3.5 rounded-lg bg-white/70 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-bold text-base transition-all hover:bg-white dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-lg active:scale-95 whitespace-nowrap">
              <span className="material-symbols-outlined text-[24px] text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-primary transition-colors">{cat.icon || 'category'}</span>
              {cat.name}
            </Link>
          ))}
          <Link href="/categories" className="shrink-0 group flex items-center gap-3 px-8 py-3.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base transition-all hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-xl active:scale-95 whitespace-nowrap border border-transparent">
            {dict.catShowMore}
            <span className="material-symbols-outlined text-[24px] transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">arrow_forward</span>
          </Link>
        </div>
</section>

      {/* Verified Resources - Unified Compact Block */}
      {verified.length > 0 && (
        <section className="mx-4 lg:mx-0 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden mb-12">
          <div className="p-4 pb-5 space-y-4">
            {/* Unified Header */}
            <div className="px-2">
              <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-500 font-black text-lg">verified</span>
                {dict.verifiedTitle}
              </h2>
            </div>

            {/* Content Row with 5 items + Arrow */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 w-full flex-grow gap-4">
                {verified.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="transition-transform duration-300 hover:scale-[1.02]">
                    <DirectoryCard item={mapEntry(item)} locale={locale} dict={dict} isCompact={true} />
                  </div>
                ))}
              </div>
              
              {/* Animated Arrow Link - Brand Colors */}
              <Link 
                href={`/${locale}/search?isVerified=true`}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-90 shrink-0 group mt-2 lg:mt-0"
              >
                <span className="material-symbols-outlined font-black text-xl transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      )}

{/* 4. Top Channels */}
<section className="space-y-8">
<h2 className="text-2xl font-bold tracking-tight border-s-4 border-primary ps-4">{dict.topChannels}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {topChannels.length > 0 ? topChannels.map((item: any) => (
        <DirectoryCard key={item.id} item={mapEntry(item)} locale={locale} dict={dict} />
      )) : (
        <div className="col-span-full py-12 text-center text-slate-400">No channels found in this language.</div>
      )}
    </div>
<div className="flex justify-end mt-4">
<Link href={`/${locale}/channels`} className="text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
{dict.viewAllChannels} <span className="material-symbols-outlined text-sm rtl:rotate-180" data-icon="arrow_forward">arrow_forward</span>
</Link>
</div>
</section>
{/* 5. Active Groups */}
<section className="space-y-8">
<h2 className="text-2xl font-bold tracking-tight border-s-4 border-primary ps-4">{dict.activeGroups}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {topGroups.length > 0 ? topGroups.map((item: any) => (
        <DirectoryCard key={item.id} item={mapEntry(item)} locale={locale} dict={dict} />
      )) : (
        <div className="col-span-full py-12 text-center text-slate-400">No groups found in this language.</div>
      )}
    </div>
<div className="flex justify-end mt-4">
<Link href={`/${locale}/groups`} className="text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
{dict.viewAllGroups} <span className="material-symbols-outlined text-sm rtl:rotate-180" data-icon="arrow_forward">arrow_forward</span>
</Link>
</div>
</section>
{/* 6. Useful Bots */}
<section className="space-y-8">
<h2 className="text-2xl font-bold tracking-tight border-s-4 border-primary ps-4">{dict.usefulBots}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {topBots.length > 0 ? topBots.map((item: any) => (
        <DirectoryCard key={item.id} item={mapEntry(item)} locale={locale} dict={dict} />
      )) : (
        <div className="col-span-full py-12 text-center text-slate-400">No bots found in this language.</div>
      )}
    </div>
<div className="flex justify-end mt-4">
<Link href={`/${locale}/bots`} className="text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
{dict.viewAllBots} <span className="material-symbols-outlined text-sm rtl:rotate-180" data-icon="arrow_forward">arrow_forward</span>
</Link>
</div>
</section>
</main>
    </>
  );
}
