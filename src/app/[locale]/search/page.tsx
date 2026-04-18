import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { getEntries, getCategories } from '@/lib/data';
import SearchBar from '@/components/ui/SearchBar';
import DirectoryCard from '@/components/ui/DirectoryCard';
import SearchFilters from '@/components/search/SearchFilters';
import SortFilter from '@/components/search/SortFilter';
import { formatMembers } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SearchPage({ 
  params,
  searchParams 
}: { 
  params: { locale: string } | Promise<{ locale: string }>,
  searchParams: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);
  
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const maxMembers = typeof resolvedSearchParams.maxMembers === 'string' ? parseInt(resolvedSearchParams.maxMembers) : 100000000;
  const isVerifiedFilter = resolvedSearchParams.isVerified === 'true';

  // Fetch real data
  const { data: entries, count } = await getEntries({
    locale,
    search: query,
    sortBy: sort,
    maxMembers: maxMembers,
    isVerified: isVerifiedFilter,
    limit: 12,
    offset: (page - 1) * 12
  });

  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <>
      <main className="pt-24 pb-20 max-w-[1536px] mx-auto px-6 flex flex-col md:flex-row gap-8 min-h-screen font-['Inter','Tajawal']">
        {/* Sidebar: Advanced Filters (Client Component) */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <SearchFilters 
              dict={dict} 
              locale={locale} 
              initialMaxMembers={maxMembers > 50000000 ? 50000000 : maxMembers} 
            />
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.searchFoundCount?.split(' ')[0] || 'Stats'}</span>
              <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">
                {dict.searchFoundCount?.replace('{count}', (count || 0).toString()) || `${count || 0} results`}
              </p>
              {query && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                   <p className="text-xs font-bold text-slate-500">Searching for:</p>
                   <p className="text-sm font-black text-primary truncate max-w-full">"{query}"</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Top Search Bar & Sort Header */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-outline-variant/10">
              <SearchBar placeholder={dict.searchPlaceholder} locale={locale} initialValue={query} />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/15 shadow-sm">
              <nav className="flex items-center gap-2 text-sm">
                <Link className="text-slate-400 hover:text-primary transition-colors font-medium" href={prefix || '/'}>{dict.breadcrumbHome}</Link>
                <span className="material-symbols-outlined text-slate-300 text-xs rtl:rotate-180">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-black uppercase tracking-tight">{dict.navSearch || 'Search Results'}</span>
              </nav>
              
              <SortFilter 
                dict={dict} 
                locale={locale} 
                initialSort={sort} 
              />
            </div>
          </div>

          {/* Results Grid */}
          {entries && entries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {entries.map((item: any) => (
                <DirectoryCard 
                  key={item.id} 
                  item={{
                    id: item.slug || item.id,
                    title: item.title,
                    description: item.description,
                    members: formatMembers(item.members_count),
                    type: item.type,
                    image: item.image_url || 'https://via.placeholder.com/150',
                    is_verified: item.is_verified || false
                  }} 
                  locale={locale} 
                  dict={dict} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30 py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{dict.noResultsTitle || 'No results found'}</h3>
              <p className="text-slate-500 mt-2 max-w-sm font-medium leading-relaxed">{dict.noResultsDesc || "We couldn't find anything matching your filters. Try adjusting the member count or keywords."}</p>
              <Link href={prefix || '/'} className="mt-8 px-10 py-3.5 bg-primary text-white font-black rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
                {dict.backToHome || 'Back to Home'}
              </Link>
            </div>
          )}

          {/* Pagination Mockup */}
          {count && count > 12 && (
            <div className="flex justify-center pt-8 border-t border-slate-100 dark:border-slate-800/50">
              <button className="flex items-center gap-3 px-10 py-4 bg-white dark:bg-slate-900 border border-outline-variant/30 rounded-xl text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/50 hover:text-primary transition-all group shadow-sm active:scale-95">
                <span>{dict.btnLoadMore || 'Load More Results'}</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-y-1 transition-transform">expand_more</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
