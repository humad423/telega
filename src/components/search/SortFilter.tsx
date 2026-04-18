'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortFilter({ 
  dict, 
  locale, 
  initialSort 
}: { 
  dict: any; 
  locale: string; 
  initialSort: string 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    // Reset to page 1
    params.delete('page');
    
    const prefix = locale === 'en' ? '' : `/${locale}`;
    router.push(`${prefix}/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 font-medium whitespace-nowrap">{dict.sortBy}:</span>
      <select 
        value={initialSort}
        onChange={handleSortChange}
        className="bg-surface-container-low border-none rounded-lg text-sm font-black text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 cursor-pointer py-1.5 px-3 min-w-[120px]"
      >
        <option value="newest">{dict.sortNewest}</option>
        <option value="members">{dict.sortMembers}</option>
        <option value="rating">{dict.sortRating}</option>
        <option value="trending">{dict.sortTrending}</option>
        <option value="growth">{dict.sortGrowth}</option>
        <option value="activity">{dict.sortActivity}</option>
      </select>
    </div>
  );
}
