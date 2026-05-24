import Link from 'next/link';
import Image from 'next/image';

interface DirectoryItem {
  id: string;
  title: string;
  description: string;
  members: string;
  type: 'channel' | 'group' | 'bot';
  image: string;
  is_verified?: boolean;
}

export default function DirectoryCard({ 
  item, 
  locale, 
  dict,
  isCompact = false 
}: { 
  item: DirectoryItem; 
  locale: string; 
  dict: any;
  isCompact?: boolean;
}) {
  const typeConfigs = {
    channel: { 
      label: dict.tagChannel, 
      statLabel: dict.cardSubscribers,
      color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', 
      icon: 'add' 
    },
    group: { 
      label: dict.tagGroup, 
      statLabel: dict.cardMembers,
      color: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400', 
      icon: 'chat' 
    },
    bot: { 
      label: dict.tagBot, 
      statLabel: dict.cardUsers,
      color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', 
      icon: 'smart_toy' 
    }
  };

  const { label, statLabel, color, icon } = typeConfigs[item.type];
  const detailPath = `/${locale}/${item.type}s/${item.id}`;

  if (isCompact) {
    return (
      <Link 
        href={detailPath} 
        className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/15 flex items-center gap-3 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-pointer active:scale-[0.98] h-full"
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 shrink-0 bg-surface-container relative">
          <Image alt={item.title} className="object-cover transition-transform duration-500 group-hover:scale-110" src={item.image || 'https://placehold.co//png'} fill sizes="48px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          {/* Top Line: Verified Check (before name) + Title */}
          <div className="flex items-center gap-1 min-w-0 w-full">
            {item.is_verified && (
              <span
                className="material-symbols-outlined text-sky-500 shrink-0 select-none"
                style={{ 
                  fontSize: '14px',
                  fontVariationSettings: '"FILL" 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >verified</span>
            )}
            <h4 className="font-extrabold text-sm leading-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors duration-300 font-['Inter','Tajawal'] antialiased truncate min-w-0 flex-1">
              {item.title}
            </h4>
          </div>

          {/* Middle Line: Description (Dedicated Row) */}
          {item.description && (
            <p className="truncate text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 opacity-80 leading-normal w-full">
              {item.description}
            </p>
          )}

          {/* Bottom Line: Subscribers count + Category badge at the end */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0 w-full mt-0.5">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-primary font-black shrink-0 text-[11px] sm:text-xs">
                {item.members}
              </span>
              <span className="font-semibold opacity-85 shrink-0 text-[10px] sm:text-[11px] truncate">
                {statLabel}
              </span>
            </div>

            <div className={`px-1.5 py-0.5 ${color} rounded-[3px] text-[7.5px] font-black uppercase tracking-wider w-fit border border-current/5 shrink-0 select-none`}>
              {label}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={detailPath} 
      className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/15 flex hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-pointer active:scale-[0.98] h-full flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
        
        {/* Upper row on mobile (Avatar + Title) */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 min-w-12 min-h-12 sm:min-w-16 sm:min-h-16 rounded-xl overflow-hidden shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 shrink-0 bg-surface-container relative">
            <Image alt={item.title} className="object-cover transition-transform duration-500 group-hover:scale-110" src={item.image || 'https://placehold.co//png'} fill sizes="(max-width: 640px) 48px, 64px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="min-w-0 sm:hidden flex-1">
            <div className="flex items-center gap-1 min-w-0">
              {item.is_verified && (
                <span
                  className="material-symbols-outlined text-sky-500 shrink-0 select-none"
                  style={{ 
                    fontSize: '14px',
                    fontVariationSettings: '"FILL" 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >verified</span>
              )}
              <h4 className="font-extrabold text-[15px] leading-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors duration-300 font-['Inter','Tajawal'] antialiased truncate flex-1">
                {item.title}
              </h4>
            </div>
          </div>
        </div>

        {/* Title / Description / Metadata Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Desktop Title Header */}
          <div className="hidden sm:flex items-center gap-1 overflow-hidden">
            {item.is_verified && (
              <span
                className="material-symbols-outlined text-sky-500 shrink-0 select-none"
                style={{ 
                  fontSize: '16px',
                  fontVariationSettings: '"FILL" 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >verified</span>
            )}
            <h4 className="font-extrabold text-[17px] leading-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors duration-300 font-['Inter','Tajawal'] antialiased truncate">
              {item.title}
            </h4>
          </div>

          {item.description && (
            <p className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 mt-1 sm:mt-0.5 line-clamp-2 sm:line-clamp-1 font-medium leading-snug">
              {item.description}
            </p>
          )}

          {/* Metadata & badges row */}
          <div className="flex items-center justify-between gap-2 mt-2 sm:mt-1">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-550 flex items-center gap-1">
               <span className="text-primary font-black">{item.members}</span>
               <span className="font-semibold opacity-85">{statLabel}</span>
            </p>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 ${color} rounded-[3px] text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider w-fit border border-current/5 shrink-0 select-none`}>
              {label}
            </div>
          </div>
        </div>

      </div>
      
      <div className="flex items-center justify-between sm:justify-end shrink-0 w-full sm:w-auto mt-1 sm:mt-0 sm:ml-3 pt-3 sm:pt-0 border-t border-slate-100 dark:border-slate-800/40 sm:border-0">
        {item.type === 'bot' ? (
          <div className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg bg-primary text-white font-black text-xs sm:text-xs uppercase shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95">
            {dict.cardStart}
          </div>
        ) : (
          <div className="w-full sm:w-11 sm:h-11 py-2 sm:py-0 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 font-extrabold text-xs sm:text-base gap-2">
            <span className="sm:hidden">{dict.detailsJoin || (locale === 'ar' ? 'انضمام' : 'Join')}</span>
            <span className="material-symbols-outlined text-lg font-black">{icon}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
