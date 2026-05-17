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
  const [isOpen, setIsOpen] = useState(false);
  const [maxMembers, setMaxMembers] = useState<number>(
    searchParams.get('maxMembers') ? parseInt(searchParams.get('maxMembers')!) : 50000000
  );

  useEffect(() => { setSelectedCats(initialCategory); }, [initialCategory]);
  useEffect(() => { setSelectedTypes(initialType); }, [initialType]);
  const isVerifiedParam = searchParams.get('isVerified') === 'true';
  useEffect(() => { 
    setIsVerified(isVerifiedParam); 
  }, [isVerifiedParam]);

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
      <div className="sticky top-24 bg-surface-container-lowest border border-outline-variant/15 rounded-xl flex flex-col p-4 lg:p-6 shadow-sm">
        
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
          <div>
            <h2 className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 font-['Inter','Tajawal'] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary lg:hidden text-lg lg:text-xl">
                {isOpen ? 'filter_list_off' : 'filter_list'}
              </span>
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight uppercase hidden lg:block">{subtitle}</p>
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


          {/* Type Filter */}
          {showTypeFilter && (
            <div className="space-y-2 lg:space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="text-xs uppercase tracking-wider">{dict.filterContentType}</span>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-1.5 lg:gap-0 lg:space-y-2">
                {typeMap.map(t => {
                  const isSelected = selectedTypes.includes(t.id);
                  return (
                    <label 
                      key={t.id} 
                      className={`flex items-center justify-center lg:justify-start gap-2 cursor-pointer group rounded-lg lg:rounded-none transition-all font-medium py-1.5 px-3 lg:p-0 border lg:border-0 text-xs lg:text-sm select-none ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/30 text-primary font-bold dark:bg-primary/20' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                      } lg:bg-transparent lg:dark:bg-transparent lg:hover:bg-transparent lg:border-transparent`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleType(t.id)}
                        className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer hidden lg:block"
                      />
                      <span>{t.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-2 lg:space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined text-sm">category</span>
              <span className="text-xs uppercase tracking-wider">{dict.filterCategories}</span>
            </div>
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-2.5 pb-2 lg:pb-0 max-h-[160px] lg:max-h-[250px] lg:overflow-y-auto pr-1 lg:pr-2 scrollbar-none custom-scrollbar select-none">
              {categories.map(cat => {
                const isSelected = selectedCats.includes(cat.name);
                return (
                  <label 
                    key={cat.name} 
                    className={`flex items-center justify-center lg:justify-start gap-2 cursor-pointer group rounded-lg lg:rounded-none transition-all font-medium py-1.5 px-3 lg:p-0 border lg:border-0 text-xs lg:text-sm shrink-0 lg:shrink-1 select-none ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/30 text-primary font-bold dark:bg-primary/20' 
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                    } lg:bg-transparent lg:dark:bg-transparent lg:hover:bg-transparent lg:border-transparent`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleCat(cat.name)}
                      className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer hidden lg:block"
                    />
                    <span className="truncate">{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <button 
              onClick={applyFilters}
              className="flex-1 bg-primary text-white py-2.5 lg:py-4 rounded-lg text-xs lg:text-sm font-black hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-[0.96] shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm font-bold animate-pulse">filter_alt</span>
              {dict.filterApply || 'Apply Filters'}
            </button>

            {(selectedCats.length > 0 || selectedTypes.length > 0 || maxMembers < 50000000) && (
              <button 
                onClick={resetFilters}
                className="flex-1 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 py-2.5 lg:py-3.5 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.96] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                {dict.filterReset || (dict.lang === 'ar' ? 'مسح' : 'Clear')}
              </button>
            )}
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
    </aside>
  );
}
