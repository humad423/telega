import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-['Inter','Tajawal']">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-orange-500/20 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none"></div>
            <h1 className="text-[100px] sm:text-[150px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-amber-500 drop-shadow-xl select-none mb-2 relative z-10">
              404
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight relative z-10">
            Oops! Page Not Found
          </h2>
          
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            <br/><br/>
            <span dir="rtl" className="block text-xl text-slate-700 dark:text-slate-300 font-bold">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</span>
          </p>
          
          <Link 
            href="/" 
            className="relative z-10 group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm sm:text-base rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30 active:scale-95"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">home</span>
              <span>Back to Home / العودة للرئيسية</span>
            </span>
          </Link>
        </div>
      </body>
    </html>
  );
}
