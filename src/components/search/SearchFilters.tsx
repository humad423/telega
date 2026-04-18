'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchFilters({ 
  dict, 
  locale, 
  initialMaxMembers 
}: { 
  dict: any; 
  locale: string; 
  initialMaxMembers: number 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [maxMembers, setMaxMembers] = useState(initialMaxMembers);
  const [isVerified, setIsVerified] = useState(searchParams.get('isVerified') === 'true');

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Verified filter
    if (isVerified) {
      params.set('isVerified', 'true');
    } else {
      params.delete('isVerified');
    }

    // If it's at the visual maximum (50M), we treat it as "unlimited" and remove the filter
    if (maxMembers >= 50000000) {
      params.delete('maxMembers');
    } else {
      params.set('maxMembers', maxMembers.toString());
    }
    
    // Reset to page 1 when filtering
    params.delete('page');
    
    const prefix = locale === 'en' ? '' : `/${locale}`;
    router.push(`${prefix}/search?${params.toString()}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 50000000) return 'Any';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <div className="sticky top-24 bg-surface-container-lowest dark:bg-slate-900 rounded-xl flex flex-col gap-6 p-6 border border-outline-variant/15 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-['Inter','Tajawal']">{dict.filterRefine || 'Search Filters'}</h2>
      </div>

      {/* Member Count Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-primary font-bold">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">group</span>
            <span className="text-xs uppercase tracking-wider">{dict.filterMembers || 'Member Count'}</span>
          </div>
          <span className="text-xs font-black bg-primary/10 px-2 py-0.5 rounded text-primary">
            {formatNumber(maxMembers)}
          </span>
        </div>
        <div className="px-2">
          <input 
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
            max="50000000" 
            min="0" 
            step="500000" 
            type="range"
            value={maxMembers}
            onChange={(e) => setMaxMembers(parseInt(e.target.value))}
          />
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
            <span>0</span>
            <span>50M+</span>
          </div>
        </div>
      </div>

      {/* Verified Filter */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
        <label className="flex items-center gap-3 bg-sky-500/5 dark:bg-sky-500/10 p-3 rounded-lg cursor-pointer hover:bg-sky-500/10 transition-all group">
          <input 
            type="checkbox" 
            checked={isVerified}
            onChange={() => setIsVerified(!isVerified)}
            className="w-4 h-4 rounded border-sky-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-[14px] font-black text-sky-600 dark:text-sky-400 flex items-center gap-1.5 leading-none">
              <span className="material-symbols-outlined text-[16px] font-black">verified</span>
              {dict.filterVerified || 'Verified Only'}
            </span>
          </div>
        </label>
      </div>

      <button 
        onClick={handleApply}
        className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all active:scale-95 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">filter_alt</span>
        {dict.btnApplyFilters || 'Apply Filters'}
      </button>
    </div>
  );
}
