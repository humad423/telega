'use client';

import { useState } from 'react';
import { ProfessionalEditor } from './Editor.client';
import { upsertPage } from '@/app/[locale]/admin/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function PageEditor({ 
    initialPage, 
    locale 
}: { 
    initialPage?: any, 
    locale: string 
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [page, setPage] = useState(initialPage || {
        title: '',
        slug: '',
        content: {},
        locale: locale,
        meta_title: '',
        meta_description: ''
    });
    const [editorContent, setEditorContent] = useState(page.content || {});

    const handleSave = async () => {
        setIsLoading(true);
        const finalPage = {
            ...page,
            content: editorContent,
        };

        const res = await upsertPage(finalPage);
        if (res.success) {
            router.push(`/${locale}/admin?tab=pages`);
            router.refresh();
        } else {
            alert(res.error || 'Failed to save page');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#F1F3F4] dark:bg-slate-950 flex flex-col font-sans overflow-hidden z-[999]">
            {/* Top Bar */}
            <header className="h-[60px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-[60] shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/admin?tab=pages`} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90" title="Go back">
                        <span className="material-symbols-outlined text-primary text-[26px]">arrow_back</span>
                    </Link>
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-xl">description</span>
                    </div>
                </div>

                <div className="flex-1 max-w-3xl px-12 hidden md:block">
                    <input 
                        value={page.title}
                        onChange={(e) => setPage({ ...page, title: e.target.value })}
                        placeholder="Page Title (e.g. About Us)"
                        className="w-full h-11 bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleSave()}
                        disabled={isLoading}
                        className="h-10 px-6 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-[0.15em] shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        {isLoading ? 'Saving...' : 'Publish Page'}
                    </button>
                    
                    {/* Sidebar Toggle for Desktop */}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${sidebarOpen ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            {/* Title Area for Mobile */}
            <div className="md:hidden bg-white dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <input 
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    placeholder="Page Title"
                    className="w-full h-10 bg-transparent border-none focus:ring-0 text-lg font-bold placeholder:text-slate-300"
                />
            </div>

            {/* Main Editing Area */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Scrollable Editor Container */}
                <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-[#F1F3F4] dark:bg-slate-950">
                    <ProfessionalEditor 
                        value={editorContent}
                        onChange={setEditorContent}
                        locale={locale}
                    />
                    
                    <div className="h-40 pointer-events-none" />
                </main>

                {/* Settings Sidebar */}
                <aside 
                    className={`${sidebarOpen ? 'w-[340px]' : 'w-0'} bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-2xl z-50 flex flex-col`}
                >
                    <div className="w-[340px] flex flex-col h-full overflow-hidden">
                        <div className="p-6 pb-2 flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Page Settings</h2>
                            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            <SidebarItem icon="language" title="Language" subtitle="Page localization" defaultOpen>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPage({ ...page, locale: 'ar' })}
                                            className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${page.locale === 'ar' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <span className="text-lg">🇸🇦</span> العربية
                                        </button>
                                        <button 
                                            onClick={() => setPage({ ...page, locale: 'en' })}
                                            className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${page.locale === 'en' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <span className="text-lg">🇺🇸</span> English
                                        </button>
                                    </div>
                                </div>
                            </SidebarItem>

                            <SidebarItem icon="link" title="Permalink" subtitle="URL handle for this page" defaultOpen>
                                <div className="space-y-3">
                                    <input 
                                        value={page.slug || ''}
                                        onChange={(e) => setPage({ ...page, slug: e.target.value })}
                                        placeholder="about-us"
                                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-[13px] focus:ring-2 focus:ring-primary/10 font-mono text-primary"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium px-1">
                                        URL: {page.locale && `/${page.locale}/${page.slug}`}
                                    </p>
                                </div>
                            </SidebarItem>

                            <SidebarItem icon="settings" title="SEO Options" subtitle="Search engine optimization" defaultOpen>
                                <div className="space-y-5">
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Meta Title</label>
                                        <input 
                                            value={page.meta_title || ''}
                                            onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-xs focus:ring-2 focus:ring-primary/10 font-bold"
                                            placeholder="SEO Page Title"
                                        />
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Search Description</label>
                                        <textarea 
                                            value={page.meta_description || ''}
                                            onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs min-h-[120px] focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed"
                                            placeholder="Page meta description..."
                                        />
                                    </div>
                                </div>
                            </SidebarItem>
                        </div>
                    </div>
                </aside>
            </div>
            
            {/* Quick Floating Sidebar Opener (when closed) */}
            {!sidebarOpen && (
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="fixed right-6 bottom-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100]"
                >
                    <span className="material-symbols-outlined text-3xl">settings</span>
                </button>
            )}
        </div>
    );
}

function SidebarItem({ icon, title, subtitle, children, defaultOpen = false }: any) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="group border-b border-slate-50 dark:border-slate-800/50 last:border-none pb-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full py-4 flex items-center justify-between px-3 rounded-xl transition-all ${isOpen ? 'bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <div className="text-left">
                        <p className={`text-[13px] font-black m-0 leading-none transition-colors ${isOpen ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{title}</p>
                        <p className="text-[10px] text-slate-400 m-0 leading-tight mt-1.5 font-medium">{subtitle}</p>
                    </div>
                </div>
                <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
            </button>
            {isOpen && (
                <div className="p-3 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}
