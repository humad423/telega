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

  const locale = pathname.includes('/ar') ? 'ar' : 'en';
  const isAr = locale === 'ar';
  const clearLabel = isAr ? 'إعادة تعيين' : 'Clear';

  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      {/* Mobile Toggle Trigger Header (always visible in layout flow on mobile) */}
      <div 
        className="lg:hidden flex items-center justify-between cursor-pointer bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-4 shadow-sm mb-4 active:scale-[0.98] transition-transform duration-100"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-xl">
            filter_alt
          </span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-['Inter','Tajawal']">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <span>{isAr ? 'تعديل الفلاتر' : 'Refine'}</span>
          <span className="material-symbols-outlined text-xs">tune</span>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Panel (Static on desktop, Drawer bottom-sheet on mobile) */}
      <div 
        className={`
          fixed lg:sticky inset-x-0 bottom-0 lg:top-24 z-50 lg:z-10
          bg-surface-container-lowest border-t lg:border border-slate-200/60 dark:border-slate-800 lg:border-outline-variant/15
          rounded-t-3xl lg:rounded-xl flex flex-col p-5 lg:p-6 shadow-2xl lg:shadow-sm
          max-h-[85vh] lg:max-h-none overflow-y-auto lg:overflow-visible
          transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto'}
        `}
      >
        {/* Mobile Drawer Grabber / Header */}
        <div className="lg:hidden flex flex-col items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-12 h-1 bg-slate-350 dark:bg-slate-700 rounded-full mb-3 shrink-0" />
          <div className="w-full flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-['Inter','Tajawal'] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                {title}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">{subtitle}</p>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-lg font-black">close</span>
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="flex flex-col gap-5 lg:gap-6 mt-1 lg:mt-0">
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
            {/* Force LTR direction on input controls to sync drag and visual endpoints */}
            <div className="flex items-center gap-2 px-1" dir="ltr">
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
            <div className="space-y-2 lg:space-y-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="text-xs uppercase tracking-wider">{dict.filterContentType}</span>
              </div>
              <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-0 lg:space-y-2">
                {typeMap.map(t => {
                  const isSelected = selectedTypes.includes(t.id);
                  return (
                    <label 
                      key={t.id} 
                      className={`flex items-center justify-center lg:justify-start gap-2 cursor-pointer group rounded-lg lg:rounded-none transition-all font-medium py-2 px-3.5 lg:p-0 border lg:border-0 text-xs lg:text-sm select-none ${
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
          <div className="space-y-2 lg:space-y-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
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
                    className={`flex items-center justify-center lg:justify-start gap-2 cursor-pointer group rounded-lg lg:rounded-none transition-all font-medium py-2 px-3.5 lg:p-0 border lg:border-0 text-xs lg:text-sm shrink-0 lg:shrink-1 select-none ${
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
          <div className="flex flex-row lg:flex-col gap-2.5 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/40">
            <button 
              onClick={() => {
                applyFilters();
                setIsOpen(false); // Close drawer on mobile
              }}
              className="flex-1 bg-primary text-white py-3 lg:py-4 rounded-xl text-xs lg:text-sm font-black hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-[0.96] shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm font-bold animate-pulse">filter_alt</span>
              {dict.filterApply || 'Apply Filters'}
            </button>

            {(selectedCats.length > 0 || selectedTypes.length > 0 || maxMembers < 50000000) && (
              <button 
                onClick={() => {
                  resetFilters();
                  setIsOpen(false); // Close drawer on mobile
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 py-3 lg:py-3.5 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 active:scale-[0.96] flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                {dict.filterReset || clearLabel}
              </button>
            )}
          </div>

          {/* Verified Toggle (Spaced cleanly with Checkbox next to verification badge) */}
          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/40">
            <button 
              type="button"
              onClick={() => setIsVerified(!isVerified)}
              className="flex items-center gap-3 cursor-pointer select-none group text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-full"
            >
              {/* Clean minimal custom checkbox adjacent to label */}
              <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                isVerified 
                  ? 'bg-sky-500 border-sky-500 text-white' 
                  : 'border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400 dark:group-hover:border-slate-500'
              }`}>
                {isVerified && (
                  <span className="material-symbols-outlined text-[12px] font-black text-white">
                    check
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className={`material-symbols-outlined text-[16px] transition-colors ${
                  isVerified ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                }`}>
                  verified
                </span>
                <span className={`font-semibold transition-colors truncate ${
                  isVerified ? 'text-slate-900 dark:text-slate-100 font-bold' : ''
                }`}>
                  {dict.filterVerified || 'Verified Only'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
