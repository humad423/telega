import Link from 'next/link';

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

  return (
    <Link 
      href={detailPath} 
      className={`bg-surface-container-lowest ${isCompact ? 'p-2.5' : 'p-4'} rounded-lg border border-outline-variant/15 flex items-center justify-between hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-pointer active:scale-[0.98] h-full`}
    >
      <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-4'} flex-1 min-w-0`}>
        <div className={`${isCompact ? 'w-11 h-11 min-w-11 min-h-11' : 'w-16 h-16 min-w-16 min-h-16'} rounded-lg overflow-hidden shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 shrink-0 bg-surface-container relative`}>
          <img alt={item.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={item.image}/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 overflow-hidden">
            <h4 className={`font-extrabold ${isCompact ? 'text-[14px]' : 'text-[17px]'} leading-tight text-slate-800 dark:text-white group-hover:text-primary transition-colors duration-300 font-['Inter','Tajawal'] antialiased truncate`}>
              {item.title}
            </h4>
            {item.is_verified && (
              <span
                className="material-symbols-outlined text-sky-500 shrink-0 self-center"
                style={{ 
                  fontSize: isCompact ? '13px' : '16px',
                  fontVariationSettings: '"FILL" 1',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >verified</span>
            )}
          </div>
          {item.description && (
            <p className={`${isCompact ? 'text-[9px]' : 'text-xs'} text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 font-medium leading-snug`}>
              {item.description}
            </p>
          )}
          <p className={`${isCompact ? 'text-[9px]' : 'text-xs'} font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1`}>
             <span className="text-primary/70">{item.members}</span>
             <span className="font-medium opacity-80">{statLabel}</span>
          </p>
          <div className={`mt-1 flex items-center gap-1 px-1.5 py-0.5 ${color} rounded-[3px] ${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black uppercase tracking-widest w-fit border border-current/5`}>
            {label}
          </div>
        </div>
      </div>
      
      {!isCompact && (
        <div className="flex items-center shrink-0 ml-3">
          {item.type === 'bot' ? (
            <div className="px-5 py-2.5 rounded-md bg-primary text-white font-black text-xs uppercase shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-90">
              {dict.cardStart}
            </div>
          ) : (
            <div className="w-11 h-11 flex items-center justify-center rounded-md shrink-0 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <span className="material-symbols-outlined text-lg font-black">{icon}</span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
