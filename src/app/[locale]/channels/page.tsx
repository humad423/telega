import Link from 'next/link';
import DirectoryCard from '@/components/ui/DirectoryCard';
import Pagination from '@/components/ui/Pagination';
import SortSelect from '@/components/ui/SortSelect';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { getDictionary } from '@/lib/i18n';
import { getCategories, getEntries } from '@/lib/data';
import { formatMembers } from '@/lib/utils';

export const revalidate = 3600;

export async function generateMetadata({ 
  params,
  searchParams 
}: { 
  params: { locale: string } | Promise<{ locale: string }>,
  searchParams: { page?: string } | Promise<{ page?: string }>
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const locale = resolvedParams.locale;
  const isAr = locale === 'ar';
  
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const pageSuffix = page > 1 ? (isAr ? ` - صفحة ${page}` : ` - Page ${page}`) : '';

  const title = isAr
    ? `قنوات تيليجرام - دليل القنوات النشطة والمميزة${pageSuffix}`
    : `Telegram Channels - Active & Featured Channels Directory${pageSuffix}`;

  const description = isAr
    ? `تصفح واستكشف أفضل قنوات تيليجرام المصنفة والنشطة والموثقة في كافة المجالات.${pageSuffix}`
    : `Browse and explore the best categorized, active, and verified Telegram channels across all fields.${pageSuffix}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/channels`,
    }
  };
}

export default async function ChannelsPage({ 
  params,
  searchParams 
}: { 
  params: { locale: string } | Promise<{ locale: string }>,
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);
  
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'members';
  const isVerified = resolvedSearchParams.isVerified === 'true';
  const maxMembers = typeof resolvedSearchParams.maxMembers === 'string' ? parseInt(resolvedSearchParams.maxMembers) : 100000000;
  
  const selectedCats = Array.isArray(resolvedSearchParams.categories) ? resolvedSearchParams.categories : 
                       typeof resolvedSearchParams.categories === 'string' ? [resolvedSearchParams.categories] : [];
                       
  const selectedTypes = Array.isArray(resolvedSearchParams.types) ? resolvedSearchParams.types : 
                        typeof resolvedSearchParams.types === 'string' ? [resolvedSearchParams.types] : ['channel'];

  const itemsPerPage = 12;
  const offset = (page - 1) * itemsPerPage;

  // Fetch categories and entries in parallel
  const [dbCategories, entriesResult] = await Promise.all([
    getCategories(locale),
    getEntries({
      locale,
      types: selectedTypes,
      categorySlugs: selectedCats,
      sortBy: sort,
      isVerified: isVerified,
      maxMembers,
      limit: itemsPerPage,
      offset
    })
  ]);

  const categoryOptions = dbCategories.map(cat => ({ 
    name: cat.slug, 
    label: cat.name 
  }));

  const { data: entries, count } = entriesResult;

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  const items = (entries || []).map((e: any) => ({
    id: e.slug || e.id,
    title: e.title,
    description: e.description,
    members: formatMembers(e.members_count),
    type: e.type,
    image: e.image_url || 'https://placehold.co//png',
    is_verified: e.is_verified || false
  }));

  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <>
      <main className="pt-4 lg:pt-24 pb-12 lg:pb-20 max-w-[1536px] mx-auto px-1.5 lg:px-6 flex flex-col lg:flex-row gap-4 lg:gap-8 min-h-screen">
        <FilterSidebar 
          title={dict.filterRefine}
          subtitle={dict.navChannels}
          categories={categoryOptions}
          dict={dict}
          initialCategory={selectedCats}
          initialType={selectedTypes}
          showTypeFilter={true}
        />

        <div className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 shadow-sm">
            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link className="text-slate-400 hover:text-primary transition-colors font-['Inter','Tajawal']" href={prefix || '/'}>{dict.breadcrumbHome}</Link>
              <span className="material-symbols-outlined text-slate-300 text-xs rtl:rotate-180">chevron_right</span>
              <span className="text-slate-900 font-black dark:text-white uppercase tracking-tight font-['Inter','Tajawal']">{dict.breadcrumbChannels}</span>
            </nav>
            <SortSelect defaultValue={sort} dict={dict} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => (
              <DirectoryCard key={item.id} item={item} locale={locale} dict={dict} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages || 1} baseUrl={`${prefix}/channels`} dict={dict} />
        </div>
      </main>
    </>
  );
}
