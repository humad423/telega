"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface FilterSidebarProps {
  title: string;
  subtitle: string;
  categories: { name: string, label: string }[];
  dict: any;
  initialCategory?: string[];
  initialType?: string[];
  showTypeFilter?: boolean;
}

export default function FilterSidebar({ 
  title, 
  subtitle, 
  categories, 
  dict,
  initialCategory = [], 
  initialType = [],
  showTypeFilter = false
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialType);
  const [isVerified, setIsVerified] = useState<boolean>(searchParams.get('isVerified') === 'true');
  const [maxMembers, setMaxMembers] = useState<number>(
    searchParams.get('maxMembers') ? parseInt(searchParams.get('maxMembers')!) : 50000000
  );

  useEffect(() => { setSelectedCats(initialCategory); }, [initialCategory]);
  useEffect(() => { setSelectedTypes(initialType); }, [initialType]);
  useEffect(() => { setIsVerified(searchParams.get('isVerified') === 'true'); }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.delete('categories');
    selectedCats.forEach(cat => params.append('categories', cat.toLowerCase()));
    
    params.delete('types');
    selectedTypes.forEach(t => params.append('types', t.toLowerCase()));

    if (isVerified) {
      params.set('isVerified', 'true');
    } else {
      params.delete('isVerified');
    }

    if (maxMembers >= 50000000) {
      params.delete('maxMembers');
    } else {
      params.set('maxMembers', maxMembers.toString());
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedCats([]);
    setSelectedTypes([]);
    setIsVerified(false);
    setMaxMembers(50000000);
    router.push(pathname);
  };

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleType = (t: string) => {
    setSelectedTypes(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 50000000) return 'Any';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const typeMap = [
    { id: 'channel', label: dict.navChannels },
    { id: 'group', label: dict.navGroups },
    { id: 'bot', label: dict.navBots }
  ];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      <div className="sticky top-24 bg-surface-container-lowest border border-outline-variant/15 rounded-xl flex flex-col gap-6 p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-['Inter','Tajawal']">{title}</h2>
          <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">{subtitle}</p>
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
          <label className="flex items-center gap-3 bg-sky-500/5 dark:bg-sky-500/10 p-3 rounded-lg cursor-pointer hover:bg-sky-500/10 transition-colors group">
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

        {/* Type Filter */}
        {showTypeFilter && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="text-xs uppercase tracking-wider">{dict.filterContentType}</span>
            </div>
            <div className="space-y-2">
              {typeMap.map(t => (
                <label key={t.id} className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(t.id)}
                    onChange={() => toggleType(t.id)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="material-symbols-outlined text-sm">category</span>
            <span className="text-xs uppercase tracking-wider">{dict.filterCategories}</span>
          </div>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map(cat => (
              <label key={cat.name} className="flex items-center gap-3 cursor-pointer group text-sm text-slate-700 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                <input 
                  type="checkbox" 
                  checked={selectedCats.includes(cat.name)}
                  onChange={() => toggleCat(cat.name)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                />
                <span className="truncate">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={applyFilters}
          className="w-full bg-primary text-white py-4 rounded-lg text-sm font-black hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-[0.96] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2"
        >
          <span className="material-symbols-outlined text-sm font-bold animate-pulse">filter_alt</span>
          {dict.filterApply || 'Apply Filters'}
        </button>

        {(selectedCats.length > 0 || selectedTypes.length > 0 || maxMembers < 50000000) && (
          <button 
            onClick={resetFilters}
            className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 py-3.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.96] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            {dict.filterReset || (dict.lang === 'ar' ? 'حذف كل الفلاتر' : 'Clear All Filters')}
          </button>
        )}
      </div>
    </aside>
  );
}
