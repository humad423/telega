import Link from 'next/link';
import DirectoryCard from '@/components/ui/DirectoryCard';
import Pagination from '@/components/ui/Pagination';
import SortSelect from '@/components/ui/SortSelect';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { getDictionary } from '@/lib/i18n';
import { getCategories, getEntries } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { formatMembers } from '@/lib/utils';

export default async function CategorySlugPage({ 
  params,
  searchParams 
}: { 
  params: { locale: string, slug: string } | Promise<{ locale: string, slug: string }>,
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const locale = resolvedParams.locale;
  const slug = decodeURIComponent(resolvedParams.slug);
  const dict = await getDictionary(locale);
  
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const isVerified = resolvedSearchParams.isVerified === 'true';
  const maxMembers = typeof resolvedSearchParams.maxMembers === 'string' ? parseInt(resolvedSearchParams.maxMembers) : 100000000;
  
  const selectedTypes = Array.isArray(resolvedSearchParams.types) ? resolvedSearchParams.types : 
                        typeof resolvedSearchParams.types === 'string' ? [resolvedSearchParams.types] : [];

  const extraCategories = Array.isArray(resolvedSearchParams.categories) ? resolvedSearchParams.categories : 
                          typeof resolvedSearchParams.categories === 'string' ? [resolvedSearchParams.categories] : [];

  // Combine the main route category with any extra selected categories from sidebar
  const allCategorySlugs = [slug !== 'all' ? slug : null, ...extraCategories].filter(Boolean) as string[];

  // Fetch actual category from DB
  let categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  if (slug === 'all') {
    categoryName = dict.catAll;
  } else {
    const { data: catData } = await supabase
      .from('categories')
      .select('name')
      .eq('slug', slug)
      .eq('locale', locale)
      .single();
    if (catData) categoryName = catData.name;
  }

  // Fetch all categories for the sidebar
  const dbCategories = await getCategories(locale);
  const categoryOptions = dbCategories.map(cat => ({ 
    name: cat.slug, 
    label: cat.name 
  }));

  const itemsPerPage = 12;
  const offset = (page - 1) * itemsPerPage;

  const { data: entries, count } = await getEntries({
    locale,
    categorySlugs: allCategorySlugs.length > 0 ? allCategorySlugs : undefined,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    sortBy: sort,
    isVerified,
    maxMembers,
    limit: itemsPerPage,
    offset
  });

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  const items = (entries || []).map((e: any) => ({
    id: e.slug || e.id,
    title: e.title,
    description: e.description,
    members: formatMembers(e.members_count),
    type: e.type,
    image: e.image_url || 'https://via.placeholder.com/150',
    is_verified: e.is_verified || false
  }));

  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <>
      <main className="pt-24 pb-20 max-w-[1536px] mx-auto px-6 flex flex-col lg:flex-row gap-8 min-h-screen">
        <FilterSidebar 
          title={dict.filterRefine}
          subtitle={categoryName}
          categories={categoryOptions}
          dict={dict}
          initialCategory={extraCategories}
          initialType={selectedTypes}
          showTypeFilter={true}
        />

        <div className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 shadow-sm">
            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link className="text-slate-400 hover:text-primary transition-colors font-['Inter','Tajawal']" href={prefix || '/'}>{dict.breadcrumbHome}</Link>
              <span className="material-symbols-outlined text-slate-300 text-xs rtl:rotate-180">chevron_right</span>
              <span className="text-slate-400 font-['Inter','Tajawal']">{dict.breadcrumbCategory}</span>
              <span className="material-symbols-outlined text-slate-300 text-xs rtl:rotate-180">chevron_right</span>
              <span className="text-slate-900 font-black dark:text-white uppercase tracking-tight font-['Inter','Tajawal']">{categoryName}</span>
            </nav>
            <SortSelect defaultValue={sort} dict={dict} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between px-2 gap-4">
            <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-['Inter','Tajawal']">{categoryName}</h1>
               <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest font-['Inter','Tajawal'] opacity-80">{dict.catStatsTrending}</p>
            </div>
            <div className="text-xs font-black text-primary bg-primary/10 px-4 py-1.5 rounded-lg border border-primary/20 uppercase tracking-tighter shadow-sm flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
               {count} {dict.catStatsResults}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => (
              <DirectoryCard key={item.id} item={item} locale={locale} dict={dict} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages || 1} baseUrl={`${prefix}/category/${slug}`} dict={dict} />
        </div>
      </main>
    </>
  );
}
