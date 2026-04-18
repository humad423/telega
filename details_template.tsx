import Link from 'next/link';

export default function DetailsPage() {
  const locale = 'en'; // For template purposes, would be dynamically fetched or passed usually
  
  return (
    <>
      <main className="min-h-screen pt-20">
        
        {/* --- 1. Immersive Clean Hero Section --- */}
        <section className="relative w-full max-w-[1536px] mx-auto px-6 py-12">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 w-fit px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-surface-container-lowest">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-800 dark:text-slate-200">Tech Insights Daily</span>
          </nav>

          <div className="bg-gradient-to-br from-primary/5 via-surface-container-lowest to-surface-container rounded-[32px] p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/30 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center relative overflow-hidden shadow-sm">
            
            {/* Soft decorative blur */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            {/* Avatar */}
            <div className="relative shrink-0 z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-white shadow-lg p-2 ring-1 ring-slate-200 dark:ring-slate-700">
                <img 
                  className="w-full h-full object-cover rounded-2xl" 
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Community Avatar" 
                />
              </div>
            </div>

            {/* Title & Info */}
            <div className="flex-1 space-y-4 z-10">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-surface-container text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  <span className="text-primary mr-1">#</span>Technology
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                  <span className="text-primary mr-1">#</span>AI
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                Tech Insights Daily
                <span className="material-symbols-outlined text-sky-500 text-3xl md:text-5xl" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
                The ultimate destination for daily deep-dives into the world of AI, Web3, and emerging hardware. Curated by industry veterans for curious minds.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                {/* Primary Join Button */}
                <button className="relative overflow-hidden group px-8 py-4 bg-primary hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 active:scale-95 flex items-center gap-3">
                  <span className="material-symbols-outlined relative z-10" style={{fontVariationSettings: '"FILL" 1'}}>send</span>
                  <span className="relative z-10 tracking-wide">Join on Telegram</span>
                </button>
                
                {/* Secondary Actions */}
                <button className="w-14 h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center group">
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">share</span>
                </button>
                <button className="w-14 h-14 rounded-2xl bg-surface-container hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-200 dark:hover:border-rose-500/30 hover:text-rose-500 transition-all duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* --- 2. Clean Stats Grid --- */}
        <section className="relative z-30 max-w-[1536px] mx-auto px-6 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-rose-500 mb-2 text-3xl" style={{fontVariationSettings: '"FILL" 1'}}>groups</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">142.5K</div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Subscribers</span>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-amber-500 mb-2 text-3xl" style={{fontVariationSettings: '"FILL" 1'}}>category</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Tech</div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</span>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-emerald-500 mb-2 text-3xl" style={{fontVariationSettings: '"FILL" 1'}}>translate</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">EN / AR</div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Language</span>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-purple-500 mb-2 text-3xl">update</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">2h ago</div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Updated</span>
            </div>
          </div>
        </section>

        {/* --- 3. Main Content & Sidebar --- */}
        <section className="max-w-[1536px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* About Box */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white border-s-4 border-primary ps-4">
                About this Community
              </h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-base md:text-lg prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400">
                <p>Welcome to <strong>Tech Insights Daily</strong>! We are a thriving community of over 140,000 technology enthusiasts, developers, and future-thinkers.</p>
                <p>What you can expect by joining our channel:</p>
                <ul>
                  <li><strong>Daily Breaking News:</strong> Instant updates on major tech announcements from Apple, Google, OpenAI, and more.</li>
                  <li><strong>Deep Dives:</strong> Weekly essays exploring the societal impact of artificial intelligence and machine learning.</li>
                  <li><strong>Exclusive Reviews:</strong> Honest, sponsor-free reviews of the latest consumer hardware and tech gadgets.</li>
                  <li><strong>Community Q&A:</strong> Live voice chats with industry experts every Friday.</li>
                </ul>
                <p>Whether you are a seasoned software engineer or just someone curious about the future, you'll find a home here. Click the join button above to become a part of our rapidly growing ecosystem.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Report this content</h3>
                  <p className="text-sm text-slate-500">Does this channel contain inappropriate content?</p>
               </div>
               <button className="px-6 py-2.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                  Report
               </button>
            </div>
          </div>

          {/* --- 4. Sidebar Area (Ads & Suggested) --- */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Beautiful Ad Square */}
            <div className="flex flex-col items-center justify-center p-8 bg-surface-container rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 aspect-square text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-4 bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm">ads_click</span>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-2">Promote Your Content</h4>
              <p className="text-slate-500 text-sm mb-6">Reach thousands of engaged users directly on this page.</p>
              <button className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">View Pricing</button>
            </div>

          </aside>
        </section>

        {/* --- 5. Related / Suggested Section --- */}
        <section className="bg-surface-container-low py-16">
          <div className="max-w-[1536px] mx-auto px-6">
            <h2 className="text-2xl font-extrabold tracking-tight border-s-4 border-primary ps-4 mb-8">Suggested for you</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <Link href={`/channels/demo`} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden min-w-16 min-h-16 shadow-sm shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60" alt="Bot avatar" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[17px] leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">Crypto Pulse</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">256K members</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">Daily technical analysis and crypto news to keep you ahead of the market curves.</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">Channel</div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: '"FILL" 1'}}>add</span>
                  </div>
                </div>
              </Link>

              {/* Card 2 */}
              <Link href={`/groups/demo`} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden min-w-16 min-h-16 shadow-sm shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60" alt="Group avatar" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[17px] leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">SaaS Founders</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">14K members</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">Connect with other founders, share growth metrics and find co-founders for your next big idea.</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="px-3 py-1 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-bold uppercase tracking-wider">Group</div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: '"FILL" 1'}}>add</span>
                  </div>
                </div>
              </Link>

              {/* Card 3 */}
              <Link href={`/bots/demo`} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden min-w-16 min-h-16 shadow-sm shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60" alt="Bot avatar" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[17px] leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">AI Midjourney</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bot • Free</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">Generate stunning AI artwork directly inside Telegram with our ultra-fast bot API.</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider">Bot</div>
                  <div className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    Start
                  </div>
                </div>
              </Link>
              
              {/* Card 4 - hidden on lg, visible on xl */}
              <Link href={`/channels/demo`} className="hidden xl:flex bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden min-w-16 min-h-16 shadow-sm shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60" alt="Channel avatar" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[17px] leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">Web Dev Pro</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">85K members</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">Learn React, Next.js, and modern CSS techniques with daily code snippets and tutorials.</p>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">Channel</div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: '"FILL" 1'}}>add</span>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </section>

      </main>
    </>
  );
}
