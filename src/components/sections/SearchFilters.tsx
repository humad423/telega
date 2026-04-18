"use client";

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchFilters({ locale }: { locale: string }) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect logic to /explore with query
    router.push(`/${locale}/explore`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
      <div className="relative flex-grow">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
        {/* As per spec: Input uses surface-container-highest and focus state with 2px ghost border primary */}
        <input 
          type="text" 
          placeholder="Search for channels, bots, groups..." 
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-highest border border-transparent focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-outline-variant"
        />
      </div>

      <div className="relative md:w-64">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
        <select 
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-highest border border-transparent focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-foreground"
          defaultValue=""
        >
          <option value="" disabled>All Categories</option>
          <option value="tech">Technology</option>
          <option value="news">News</option>
          <option value="crypto">Crypto</option>
          <option value="entertainment">Entertainment</option>
        </select>
      </div>

      <button 
        type="submit" 
        className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary-container font-bold rounded-xl transition-colors shrink-0 shadow-lg shadow-primary/20"
      >
        Search
      </button>
    </form>
  );
}
