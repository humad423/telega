import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://telega-beryl.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // 1. Static/Global Core Routes for both locales
  const locales = ['', 'ar', 'en']; // '' is default (English)
  const corePaths = ['', '/channels', '/groups', '/bots', '/blog'];

  locales.forEach((locale) => {
    const localePrefix = locale ? `/${locale}` : '';
    corePaths.forEach((path) => {
      // Avoid duplicate slash for root path under default locale
      const finalPath = path === '' && locale === '' ? '' : `${localePrefix}${path}`;
      routes.push({
        url: `${BASE_URL}${finalPath}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: path === '' ? 1.0 : 0.8,
      });
    });
  });

  try {
    // 2. Fetch all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, locale, created_at');

    if (categories) {
      categories.forEach((cat) => {
        // Safe check for locale. If locale is ar, route is /ar/category/slug. Else it's /category/slug or /en/category/slug.
        const prefix = cat.locale === 'ar' ? '/ar' : '/en';
        routes.push({
          url: `${BASE_URL}${prefix}/category/${encodeURIComponent(cat.slug)}`,
          lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        // Add default/fallback locale route for categories too
        if (cat.locale === 'en') {
          routes.push({
            url: `${BASE_URL}/category/${encodeURIComponent(cat.slug)}`,
            lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }

    // 3. Fetch all approved dynamic entries (channels, groups, bots)
    const { data: entries } = await supabase
      .from('entries')
      .select('slug, locale, type, created_at')
      .eq('status', 'approved');

    if (entries) {
      entries.forEach((entry) => {
        const prefix = entry.locale === 'ar' ? '/ar' : '/en';
        const typePlural = `${entry.type}s`; // e.g. channels, groups, bots
        routes.push({
          url: `${BASE_URL}${prefix}/${typePlural}/${encodeURIComponent(entry.slug)}`,
          lastModified: entry.created_at ? new Date(entry.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });

        // Add default fallback locale route
        if (entry.locale === 'en') {
          routes.push({
            url: `${BASE_URL}/${typePlural}/${encodeURIComponent(entry.slug)}`,
            lastModified: entry.created_at ? new Date(entry.created_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      });
    }

    // 4. Fetch all published blog articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, locale, created_at, updated_at')
      .eq('is_published', true);

    if (articles) {
      articles.forEach((article) => {
        const prefix = article.locale === 'ar' ? '/ar' : '/en';
        routes.push({
          url: `${BASE_URL}${prefix}/blog/${encodeURIComponent(article.slug)}`,
          lastModified: article.updated_at ? new Date(article.updated_at) : (article.created_at ? new Date(article.created_at) : new Date()),
          changeFrequency: 'weekly',
          priority: 0.6,
        });

        // Add default fallback locale route
        if (article.locale === 'en') {
          routes.push({
            url: `${BASE_URL}/blog/${encodeURIComponent(article.slug)}`,
            lastModified: article.updated_at ? new Date(article.updated_at) : (article.created_at ? new Date(article.created_at) : new Date()),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      });
    }

    // 5. Fetch custom dynamic pages (Terms, Privacy, etc.)
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, locale, created_at');

    if (pages) {
      pages.forEach((page) => {
        const prefix = page.locale === 'ar' ? '/ar' : '/en';
        routes.push({
          url: `${BASE_URL}${prefix}/${encodeURIComponent(page.slug)}`,
          lastModified: page.created_at ? new Date(page.created_at) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.4,
        });

        if (page.locale === 'en') {
          routes.push({
            url: `${BASE_URL}/${encodeURIComponent(page.slug)}`,
            lastModified: page.created_at ? new Date(page.created_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return routes;
}
