import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  dict: any;
}

export default function Pagination({ currentPage, totalPages, baseUrl, dict }: PaginationProps) {
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    // Ensure we don't duplicate the page param if it's already there (though URLSearchParams handles it better, this is a simple string approach)
    const baseWithoutPage = baseUrl.split(/[?&]page=\d+/).join('');
    const finalSeparator = baseWithoutPage.includes('?') ? '&' : '?';
    return `${baseWithoutPage}${finalSeparator}page=${page}`;
  };

  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2.5 mt-16 mb-12 flex-wrap">
      {/* Previous */}
      <Link
        href={getPageUrl(Math.max(1, currentPage - 1))}
        aria-label={dict.paginationPrev}
        className={`w-11 h-11 flex items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-slate-500 hover:text-primary hover:border-primary/40 hover:shadow-md transition-all active:scale-90 ${currentPage === 1 ? 'pointer-events-none opacity-40 grayscale' : ''}`}
      >
        <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1 rtl:rotate-180">chevron_left</span>
      </Link>

      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <Link href={getPageUrl(1)} className="w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm bg-surface-container-lowest border border-outline-variant/20 text-slate-600 hover:border-primary/40 hover:text-primary transition-all">1</Link>
          {startPage > 2 && <span className="text-slate-400 font-black self-end pb-2 px-1">...</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={getPageUrl(p)}
          className={`w-11 h-11 flex items-center justify-center rounded-lg font-black text-sm transition-all shadow-sm ${
            currentPage === p
              ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110 z-10'
              : 'bg-surface-container-lowest border border-outline-variant/20 text-slate-600 hover:border-primary/40 hover:text-primary'
          }`}
        >
          {p}
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-400 font-black self-end pb-2 px-1">...</span>}
          <Link href={getPageUrl(totalPages)} className="w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm bg-surface-container-lowest border border-outline-variant/20 text-slate-600 hover:border-primary/40 hover:text-primary transition-all">{totalPages}</Link>
        </>
      )}

      {/* Next */}
      <Link
        href={getPageUrl(Math.min(totalPages, currentPage + 1))}
        aria-label={dict.paginationNext}
        className={`w-11 h-11 flex items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-slate-500 hover:text-primary hover:border-primary/40 hover:shadow-md transition-all active:scale-90 ${currentPage === totalPages ? 'pointer-events-none opacity-40 grayscale' : ''}`}
      >
        <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1 rtl:rotate-180">chevron_right</span>
      </Link>
    </div>
  );
}
