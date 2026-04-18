"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SortSelect({ defaultValue, dict }: { defaultValue: string, dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1'); // Reset to first page when sorting
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 font-medium font-['Inter','Tajawal']">{dict.sortLabel}</span>
      <select 
        defaultValue={defaultValue} 
        onChange={handleSortChange}
        className="bg-surface-container-low border border-outline-variant/10 rounded-md text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 cursor-pointer pr-10"
      >
        <option value="members">{dict.sortMembers}</option>
        <option value="newest">{dict.sortNewest}</option>
        <option value="trending">{dict.sortTrending}</option>
        <option value="growth">{dict.sortGrowth}</option>
        <option value="rating">{dict.sortRating}</option>
        <option value="activity">{dict.sortActivity}</option>
      </select>
    </div>
  );
}
