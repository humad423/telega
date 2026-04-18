import { supabase } from './supabase';

export async function getCategories(locale: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('locale', locale)
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
}

export async function getEntries({ 
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
    // Better or syntax: (title ilike ... OR description ilike ...)
    // Note: ilike with % wildcards is standard for substring matching
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    console.log(`[getEntries] Filtering by search: "${search}"`);
  }

  // Apply locale filter: if lang is explicitly set and not 'all', use it; else use page locale
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
    // In Supabase, if we want to filter by a joined table column, we need to ensure the join is correct.
    // For many-to-one, we usually filter by the foreign key if it's in the main table.
    // Assuming 'category_id' exists in 'entries' and we match it with category slug.
    // However, the current code tries to filter by 'categories.slug'.
    // Better approach if joining:
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
  return { data, count };
}

export async function getEntryBySlug(slug: string, locale: string) {
  const { data, error } = await supabase
    .from('entries')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('locale', locale)
    .single();

  if (error) {
    console.error('Error fetching entry:', error);
    return null;
  }
  return data;
}

export async function getSliderItems(locale: string) {
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
  return data;
}
