import { getDictionary } from '@/lib/i18n';
import Link from 'next/link';

const predefinedCategories = [
  { id: 'tech', icon: 'devices', en: 'Technology', ar: 'تقنية' },
  { id: 'crypto', icon: 'currency_bitcoin', en: 'Cryptocurrency', ar: 'عملات رقمية' },
  { id: 'business', icon: 'business_center', en: 'Business & Startups', ar: 'الأعمال والشركات الناشئة' },
  { id: 'news', icon: 'newspaper', en: 'News & Politics', ar: 'أخبار وسياسة' },
  { id: 'design', icon: 'palette', en: 'Art & Design', ar: 'الفن والتصميم' },
  { id: 'entertainment', icon: 'movie', en: 'Entertainment', ar: 'ترفيه وأفلام' },
  { id: 'education', icon: 'school', en: 'Education', ar: 'تعليم ودورات' },
  { id: 'gaming', icon: 'sports_esports', en: 'Gaming', ar: 'ألعاب' },
  { id: 'health', icon: 'fitness_center', en: 'Health & Fitness', ar: 'الصحة والياقة' },
  { id: 'travel', icon: 'flight', en: 'Travel', ar: 'سياحة وسفر' },
  { id: 'food', icon: 'restaurant', en: 'Food & Cooking', ar: 'طبخ ووصفات' },
  { id: 'realestate', icon: 'apartment', en: 'Real Estate', ar: 'عقارات' },
  { id: 'programming', icon: 'code', en: 'Programming', ar: 'برمجة وتطوير' },
  { id: 'music', icon: 'headphones', en: 'Music', ar: 'موسيقى وصوتيات' },
  { id: 'lifestyle', icon: 'loyalty', en: 'Lifestyle', ar: 'لايف ستايل' },
  { id: 'science', icon: 'science', en: 'Science', ar: 'علوم' },
];

export default async function CategoriesPage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const dict = await getDictionary(locale);

  return (
    <main className="max-w-[1536px] mx-auto px-6 py-12 space-y-16 min-h-[80vh]">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner ring-1 ring-primary/20">
          <span className="material-symbols-outlined text-[32px] sm:text-[40px]">category</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white pb-2 text-primary">
          {dict.categoriesTitle}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
          {dict.categoriesDesc}
        </p>
      </section>

      {/* Grid Section */}
      <section className="pb-16 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {predefinedCategories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/${locale}/search?category=${cat.id}`}
              className="group relative flex items-center p-6 bg-white/60 dark:bg-surface-container-low/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(30,41,59,0.5)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Glow Effect / Backdrop on Hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center gap-5 relative z-10 w-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary shadow-sm shadow-primary/5 shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[32px]">{cat.icon}</span>
                </div>
                
                <div className="flex-1 flex flex-col items-start text-start overflow-hidden">
                  <h3 className="font-extrabold text-[17px] text-slate-900 dark:text-white leading-tight group-hover:text-primary dark:group-hover:text-primary transition-colors truncate w-full">
                    {locale === 'ar' ? cat.ar : cat.en}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-primary text-sm font-semibold">
                    <span className="whitespace-nowrap">{dict.viewMore}</span>
                    <span className="material-symbols-outlined text-[16px] rtl:-scale-x-100">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
