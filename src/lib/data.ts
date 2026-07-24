import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { supabase } from './supabase';

export const getCategories = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('locale', locale)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      return data || [];
    },
    [`categories-${locale}`],
    { revalidate: 3600, tags: ['categories'] }
  )();
});

export const getCategoryBySlug = cache(async (slug: string, locale: string) => {
  if (slug === 'all') {
    return { name: locale === 'ar' ? 'الكل' : 'All', slug: 'all' };
  }

  return unstable_cache(
    async () => {
      let { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

      if (!catData) {
        const { data: fallbackCat } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        catData = fallbackCat;
      }
      return catData || null;
    },
    [`category-${slug}-${locale}`],
    { revalidate: 3600, tags: ['categories'] }
  )();
});

async function rawGetEntries({ 
  locale, 
  type, 
  types,
  limit = 20, 
  offset = 0,
  isFeatured = false,
  isVerified = false,
  categorySlug = null,
  categorySlugs = [],
  sortBy = 'newest',
  lang,
  search,
  minMembers,
  maxMembers
}: { 
  locale: string, 
  type?: string, 
  types?: string[],
  limit?: number, 
  offset?: number,
  isFeatured?: boolean,
  isVerified?: boolean,
  categorySlug?: string | null,
  categorySlugs?: string[],
  sortBy?: string,
  lang?: string,
  search?: string,
  minMembers?: number,
  maxMembers?: number
}) {
  const hasCategoryFilter = (categorySlug && categorySlug !== 'all') || (categorySlugs && categorySlugs.length > 0);
  
  let query = supabase
    .from('entries')
    .select(hasCategoryFilter ? '*, categories!inner(*)' : '*, categories(*)', { count: 'exact' })
    .eq('status', 'approved');

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const effectiveLocale = lang && lang !== 'all' ? lang : locale;
  query = query.eq('locale', effectiveLocale);

  if (type) {
    query = query.eq('type', type);
  }

  if (types && types.length > 0) {
    query = query.in('type', types);
  }

  if (minMembers !== undefined) {
    query = query.gte('members_count', minMembers);
  }

  if (maxMembers !== undefined) {
    query = query.lte('members_count', maxMembers);
  }

  if (isFeatured) {
    query = query.eq('is_featured', true);
  }

  if (isVerified) {
    query = query.eq('is_verified', true);
  }

  if (categorySlug && categorySlug !== 'all') {
    query = query.filter('categories.slug', 'eq', categorySlug);
  }

  if (categorySlugs && categorySlugs.length > 0) {
    query = query.in('categories.slug', categorySlugs);
  }

  if (sortBy === 'members') {
    query = query.order('members_count', { ascending: false });
  } else if (sortBy === 'trending') {
    query = query.order('trending_score', { ascending: false });
  } else if (sortBy === 'growth') {
    query = query.order('growth_rate', { ascending: false });
  } else if (sortBy === 'rating') {
    query = query.order('rating', { ascending: false });
  } else if (sortBy === 'activity') {
    query = query.order('activity_level', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching entries:', error);
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
}

export const getEntries = cache(async (params: Parameters<typeof rawGetEntries>[0]) => {
  // Generate cache key string from params
  const cacheKey = JSON.stringify(params);
  return unstable_cache(
    async () => rawGetEntries(params),
    [`entries-${cacheKey}`],
    { revalidate: 1800, tags: ['entries'] }
  )();
});

export const getEntryBySlug = cache(async (slug: string, locale: string) => {
  return unstable_cache(
    async () => {
      let { data, error } = await supabase
        .from('entries')
        .select('*, categories(*)')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

      if (!data) {
        const { data: fallbackData } = await supabase
          .from('entries')
          .select('*, categories(*)')
          .eq('slug', slug)
          .maybeSingle();
          
        if (fallbackData) {
          data = fallbackData;
          error = null;
        }
      }

      if (error && !data) {
        console.error('Error fetching entry:', error);
        return null;
      }
      return data;
    },
    [`entry-${slug}-${locale}`],
    { revalidate: 1800, tags: ['entries'] }
  )();
});

export const getPageBySlug = cache(async (slug: string, locale: string) => {
  return unstable_cache(
    async () => {
      let { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

      if (!page) {
        const { data: fallbackPage } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        page = fallbackPage;
      }
      return page || null;
    },
    [`page-${slug}-${locale}`],
    { revalidate: 3600, tags: ['pages'] }
  )();
});

export const getSliderItems = cache(async (locale: string) => {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('slider_items')
        .select('*')
        .eq('locale', locale)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching slider items:', error);
        return [];
      }
      return data || [];
    },
    [`slider-${locale}`],
    { revalidate: 3600, tags: ['slider'] }
  )();
});



