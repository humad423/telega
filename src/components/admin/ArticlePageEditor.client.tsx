'use client';

import { useState } from 'react';
import { ProfessionalEditor } from './Editor.client';
import { upsertArticle } from '@/app/[locale]/admin/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export function ArticlePageEditor({ 
    initialArticle, 
    locale 
}: { 
    initialArticle?: any, 
    locale: string 
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [article, setArticle] = useState(initialArticle || {
        title: '',
        slug: '',
        excerpt: '',
        content: {},
        meta_title: '',
        meta_description: '',
        is_published: false,
        locale: locale
    });
    const [editorContent, setEditorContent] = useState(article.content || {});
    const [previewUrl, setPreviewUrl] = useState(article.image_url || '');

    const handleSave = async (publishedStatus?: boolean) => {
        setIsLoading(true);
        const finalArticle = {
            ...article,
            content: editorContent,
            image_url: previewUrl,
            is_published: publishedStatus !== undefined ? publishedStatus : article.is_published
        };

        const res = await upsertArticle(finalArticle);
        if (res.success) {
            router.push(`/${locale}/admin?tab=articles`);
            router.refresh();
        } else {
            alert(res.error || 'Failed to save article');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#F1F3F4] dark:bg-slate-950 flex flex-col font-sans overflow-hidden z-[999]">
            {/* Blogger Top Bar */}
            <header className="h-[60px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-[60] shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/admin?tab=articles`} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90" title="Go back">
                        <span className="material-symbols-outlined text-orange-600 text-[26px]">arrow_back</span>
                    </Link>
                    <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/10">
                        <span className="text-white font-black text-2xl italic tracking-tighter">B</span>
                    </div>
                </div>

                <div className="flex-1 max-w-3xl px-12 hidden md:block">
                    <input 
                        value={article.title}
                        onChange={(e) => setArticle({ ...article, title: e.target.value })}
                        placeholder="Article Title"
                        className="w-full h-11 bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button 
                         className="h-10 px-5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 flex items-center gap-2 transition-all active:bg-slate-200"
                    >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                        <span className="hidden sm:inline">Preview</span>
                    </button>
                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                    <button 
                        onClick={() => handleSave(false)}
                        disabled={isLoading}
                        className="h-10 px-5 rounded-lg text-xs font-black text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-600/10 transition-all uppercase tracking-wider"
                    >
                        Save
                    </button>
                    <button 
                        onClick={() => handleSave(true)}
                        disabled={isLoading}
                        className="h-10 px-6 rounded-lg bg-orange-600 text-white text-xs font-black uppercase tracking-[0.15em] shadow-md hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">send</span>
                        {isLoading ? 'Wait...' : 'Publish'}
                    </button>
                    
                    {/* Sidebar Toggle for Desktop */}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${sidebarOpen ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            {/* Title Area for Mobile */}
            <div className="md:hidden bg-white dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <input 
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    placeholder="Article Title"
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
                    
                    {/* Bottom Padding for long scroll */}
                    <div className="h-40 pointer-events-none" />
                </main>

                {/* Blogger Settings Sidebar */}
                <aside 
                    className={`${sidebarOpen ? 'w-[340px]' : 'w-0'} bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-2xl z-50 flex flex-col`}
                >
                    <div className="w-[340px] flex flex-col h-full overflow-hidden">
                        <div className="p-6 pb-2 flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600">Post Settings</h2>
                            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            <SidebarItem icon="language" title="Language" subtitle="Which site section?" defaultOpen>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setArticle({ ...article, locale: 'ar' })}
                                            className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${article.locale === 'ar' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <span className="text-lg">🇸🇦</span> العربية
                                        </button>
                                        <button 
                                            onClick={() => setArticle({ ...article, locale: 'en' })}
                                            className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${article.locale === 'en' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <span className="text-lg">🇺🇸</span> English
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium px-1 italic">
                                        Changing language changes where the article appears on the site.
                                    </p>
                                </div>
                            </SidebarItem>

                            <SidebarItem icon="image" title="Feature Image" subtitle="Main thumbnail & OG" defaultOpen>
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => document.getElementById('feature-image-upload')?.click()}
                                        className="aspect-[16/9] w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-600/30 hover:bg-orange-600/5 transition-all group overflow-hidden relative"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-slate-300 text-3xl group-hover:text-orange-600 transition-colors">add_photo_alternate</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600 transition-colors">Select Cover</span>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        id="feature-image-upload" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setIsLoading(true);
                                            try {
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `covers/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                                                const { error: uploadError } = await createClient().storage.from('blog').upload(fileName, file);
                                                if (uploadError) throw uploadError;
                                                const { data: { publicUrl } } = createClient().storage.from('blog').getPublicUrl(fileName);
                                                setPreviewUrl(publicUrl);
                                                setArticle({ ...article, image_url: publicUrl });
                                            } catch (err) {
                                                alert('Failed to upload image');
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                    />
                                    <input 
                                        value={previewUrl}
                                        onChange={(e) => {
                                            setPreviewUrl(e.target.value);
                                            setArticle({ ...article, image_url: e.target.value });
                                        }}
                                        placeholder="Or paste image URL here..."
                                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-[11px] focus:ring-2 focus:ring-orange-600/10 placeholder:text-slate-300"
                                    />
                                </div>
                            </SidebarItem>

                            <SidebarItem icon="label" title="Labels" subtitle="Tag your article" defaultOpen>
                                <textarea 
                                    value={article.excerpt || ''}
                                    onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                                    placeholder="Write a short summary or labels..."
                                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-[13px] min-h-[100px] focus:ring-2 focus:ring-orange-600/10 placeholder:text-slate-300 dark:text-white"
                                />
                            </SidebarItem>

                            <SidebarItem icon="schedule" title="Published on" subtitle="Manage schedule">
                                 <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-600/5 border border-orange-100 dark:border-orange-600/20">
                                    <p className="text-[11px] font-bold text-orange-700 dark:text-orange-400 leading-relaxed italic">
                                        The article will be published immediately upon clicking "Publish".
                                    </p>
                                 </div>
                            </SidebarItem>

                            <SidebarItem icon="link" title="Permalink" subtitle="URL handle for this post" defaultOpen>
                                <div className="space-y-3">
                                    <input 
                                        value={article.slug || ''}
                                        onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                                        placeholder="article-slug-example"
                                        className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-[13px] focus:ring-2 focus:ring-orange-600/10 font-mono text-orange-600"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium px-1">
                                        Slug will be used in the browser address bar. {article.locale && `/${article.locale}/blog/${article.slug}`}
                                    </p>
                                </div>
                            </SidebarItem>

                            <SidebarItem icon="settings" title="Options" subtitle="SEO and interactions" defaultOpen>
                                <div className="space-y-5">
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Meta Title</label>
                                        <input 
                                            value={article.meta_title || ''}
                                            onChange={(e) => setArticle({ ...article, meta_title: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-xs focus:ring-2 focus:ring-orange-600/10 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Search Description</label>
                                        <textarea 
                                            value={article.meta_description || ''}
                                            onChange={(e) => setArticle({ ...article, meta_description: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs min-h-[120px] focus:ring-2 focus:ring-orange-600/10 resize-none leading-relaxed"
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
                    className="fixed right-6 bottom-6 w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100]"
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
                className={`w-full py-4 flex items-center justify-between px-3 rounded-xl transition-all ${isOpen ? 'bg-orange-50/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <div className="text-left">
                        <p className={`text-[13px] font-black m-0 leading-none transition-colors ${isOpen ? 'text-orange-600' : 'text-slate-700 dark:text-slate-200'}`}>{title}</p>
                        <p className="text-[10px] text-slate-400 m-0 leading-tight mt-1.5 font-medium">{subtitle}</p>
                    </div>
                </div>
                <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-600' : ''}`}>expand_more</span>
            </button>
            {isOpen && (
                <div className="p-3 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}
