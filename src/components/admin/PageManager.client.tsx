'use client';

import { useState, useMemo } from 'react';
import { 
    upsertPage, 
    deletePage 
} from '@/app/[locale]/admin/actions';
import { ProfessionalEditor } from './Editor.client';

export function PageManager({ 
    initialPages, 
    locale 
}: { 
    initialPages: any[], 
    locale: string 
}) {
    const [pages, setPages] = useState(initialPages);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editorContent, setEditorContent] = useState<any>(null);

    const filteredPages = useMemo(() => {
        return pages.filter(p => 
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.slug?.toLowerCase().includes(search.toLowerCase())
        );
    }, [pages, search]);

    const openModal = (page: any = null) => {
        setEditingPage(page || { title: '', content: {}, locale: 'ar', slug: '' });
        setEditorContent(page?.content || {});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPage(null);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const payload = {
            ...editingPage,
            title: data.title,
            slug: data.slug,
            locale: data.locale,
            content: editorContent,
        };

        const res = await upsertPage(payload);
        if (res.success) {
            closeModal();
            window.location.reload();
        } else {
            alert(res.error || 'Failed to save page');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this page?')) return;
        const res = await deletePage(id);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Static Pages Management</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Platform Content</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search pages..."
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="h-10 px-6 rounded-lg bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Create Page
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Page Title</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Slug</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Language</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Created At</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                        {filteredPages.map(page => (
                            <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                <td className="p-5">
                                    <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{page.title}</p>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="text-[10px] font-mono text-slate-400">/p/{page.slug}</span>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{page.locale}</span>
                                </td>
                                <td className="p-5 text-center text-[10px] font-bold text-slate-400">
                                    {new Date(page.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => openModal(page)} className="p-2 rounded-lg bg-slate-100 hover:bg-primary hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(page.id)} className="p-2 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white transition-all text-rose-500">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal - Simplfied for now */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-auto">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl my-8">
                        <form onSubmit={handleSave} className="flex flex-col h-full max-h-[90vh]">
                            <header className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tighter">{editingPage?.id ? 'Update Page' : 'New Page'}</h3>
                                <button type="button" onClick={closeModal} className="text-slate-400 hover:text-rose-500"><span className="material-symbols-outlined">close</span></button>
                            </header>

                            <div className="p-8 overflow-y-auto space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Page Title</label>
                                        <input name="title" required defaultValue={editingPage?.title} className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm font-black focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slug (The URL portion)</label>
                                        <input name="slug" required defaultValue={editingPage?.slug} className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm font-mono focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Language</label>
                                        <select name="locale" defaultValue={editingPage?.locale || 'ar'} className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-black uppercase tracking-widest outline-none">
                                            <option value="ar">🇸🇦 العربية</option>
                                            <option value="en">🇬🇧 English</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Page Content</label>
                                    <ProfessionalEditor 
                                        value={editorContent} 
                                        onChange={setEditorContent} 
                                        locale={editingPage?.locale || 'ar'} 
                                    />
                                </div>
                            </div>

                            <footer className="p-6 border-t border-outline-variant/10 flex gap-4 bg-slate-50 dark:bg-slate-800/50">
                                <button type="button" onClick={closeModal} className="px-8 h-12 rounded-xl bg-white dark:bg-slate-900 border border-outline-variant/10 font-black text-xs uppercase tracking-widest">Cancel</button>
                                <button type="submit" disabled={isLoading} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-black disabled:opacity-50">
                                    {isLoading ? 'Saving...' : 'Deploy Page'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
