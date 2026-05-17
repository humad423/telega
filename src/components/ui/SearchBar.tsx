'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ placeholder, locale, initialValue = '' }: { placeholder: string, locale: string, initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = locale === 'en' ? '' : `/${locale}`;
    if (query.trim()) {
      router.push(`${prefix}/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`${prefix}/search`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="relative group flex flex-row items-stretch bg-surface-container-high rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm"
    >
      <input 
        className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 md:px-6 md:py-4 text-on-surface placeholder:text-on-surface-variant/70 text-base md:text-lg w-full outline-none" 
        placeholder={placeholder} 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button 
        type="submit"
        className="px-4 py-3 md:px-6 md:py-4 bg-primary text-white flex items-center justify-center transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
      >
        <span className="material-symbols-outlined" data-icon="search">search</span>
      </button>
    </form>
  );
}
