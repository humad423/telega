'use client';

import { useState } from 'react';
import Link from 'next/link';

export function AdminSidebar({ 
    locale, 
    tab, 
    dict 
}: { 
    locale: string, 
    tab: string, 
    dict: any 
}) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { id: 'overview', label: dict.adminOverview, icon: 'dashboard' },
        { id: 'review', label: dict.adminReview, icon: 'checklist_rtl' },
        { id: 'slider', label: dict.adminSlider, icon: 'view_carousel' },
        { id: 'directory', label: dict.adminDirectory, icon: 'folder_managed' },
        { id: 'users', label: dict.adminUsers, icon: 'group' },
        { id: 'categories', label: dict.adminCategories, icon: 'category' },
        { id: 'articles', label: dict.adminArticles, icon: 'edit_document' },
        { id: 'pages', label: dict.adminPages, icon: 'description' },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 lg:hidden z-50 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-2xl">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Sidebar Backdrop - Mobile only */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Component */}
            <aside className={`
                fixed inset-y-0 right-0 lg:relative lg:inset-auto z-40
                w-72 bg-white dark:bg-slate-900 border-l lg:border-l-0 lg:border-r border-slate-200 dark:border-slate-800 
                p-6 flex flex-shrink-0 flex-col gap-8 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="px-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {dict.adminControl}
                    </h2>
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase">
                        {dict.adminAuthority}
                    </p>
                </div>

                <nav className="flex flex-col gap-1 overflow-y-auto">
                    {navItems.map(item => (
                        <Link
                            key={item.id}
                            href={`/${locale}/admin?tab=${item.id}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                tab === item.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}
