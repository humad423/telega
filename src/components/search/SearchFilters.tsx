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

  const [isOpen, setIsOpen] = useState(false);

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
    <div className="sticky top-24 bg-surface-container-lowest dark:bg-slate-900 rounded-xl flex flex-col p-4 lg:p-6 border border-outline-variant/15 shadow-sm w-full lg:w-80 flex-shrink-0">
      
      {/* Mobile Toggle Header */}
      <div 
        className="flex items-center justify-between cursor-pointer lg:cursor-default"
        onClick={() => {
          // Only toggle on mobile
          if (window.innerWidth < 1024) {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="space-y-1">
          <h2 className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 font-['Inter','Tajawal'] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary lg:hidden text-lg lg:text-xl">
              {isOpen ? 'filter_list_off' : 'filter_list'}
            </span>
            {dict.filterRefine || 'Search Filters'}
          </h2>
        </div>
        <button className="lg:hidden text-slate-500 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg flex items-center justify-center">
          <span className={`material-symbols-outlined transition-transform duration-300 text-lg ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
      </div>

      {/* Filter Content */}
      <div className={`flex-col gap-4 lg:gap-6 mt-4 lg:mt-6 lg:flex ${isOpen ? 'flex' : 'hidden'}`}>
        {/* Member Count Range */}
        <div className="space-y-1.5 lg:space-y-3">
          <div className="flex items-center justify-between text-primary font-bold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">group</span>
              <span className="text-xs uppercase tracking-wider">{dict.filterMembers || 'Member Count'}</span>
            </div>
            <span className="text-[10px] lg:text-xs font-black bg-primary/10 px-2 py-0.5 rounded text-primary select-none">
              {formatNumber(maxMembers)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-1">
            <span className="text-[9px] lg:text-[10px] font-black text-slate-400/80 dark:text-slate-500 shrink-0 select-none">0</span>
            <input 
              className="flex-1 h-1 lg:h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
              max="50000000" 
              min="0" 
              step="500000" 
              type="range"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
            />
            <span className="text-[9px] lg:text-[10px] font-black text-slate-400/80 dark:text-slate-500 shrink-0 select-none">50M+</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row lg:flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <button 
            onClick={handleApply}
            className="flex-1 bg-primary text-white py-2.5 lg:py-3.5 rounded-lg text-xs lg:text-sm font-bold hover:brightness-110 transition-all active:scale-95 shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">filter_alt</span>
            {dict.btnApplyFilters || 'Apply Filters'}
          </button>
        </div>

        {/* Verified Toggle (Subtle & Minimalist below buttons) */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <button 
            type="button"
            onClick={() => setIsVerified(!isVerified)}
            className="w-full flex items-center justify-between cursor-pointer select-none group text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-[16px] transition-colors ${
                isVerified ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
              }`}>
                verified
              </span>
              <span className={`font-medium transition-colors ${
                isVerified ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''
              }`}>
                {dict.filterVerified || 'Verified Only'}
              </span>
            </div>
            {/* Clean minimal custom checkbox */}
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              isVerified 
                ? 'bg-sky-500 border-sky-500 text-white' 
                : 'border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400 dark:group-hover:border-slate-500'
            }`}>
              {isVerified && (
                <span className="material-symbols-outlined text-[11px] font-black text-white">
                  check
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
