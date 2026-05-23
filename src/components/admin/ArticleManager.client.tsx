'use client';

import { useState, useMemo } from 'react';
import { 
    deleteArticle 
} from '@/app/[locale]/admin/actions';
import Link from 'next/link';
import Image from 'next/image';

export function ArticleManager({ 
    initialArticles, 
    locale 
}: { 
    initialArticles: any[], 
    locale: string 
}) {
    const [articles, setArticles] = useState(initialArticles);
    const [search, setSearch] = useState('');

    const filteredArticles = useMemo(() => {
        return articles.filter(art => 
            art.title?.toLowerCase().includes(search.toLowerCase()) ||
            art.slug?.toLowerCase().includes(search.toLowerCase())
        );
    }, [articles, search]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        const res = await deleteArticle(id);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-outline-variant/10 shadow-sm transition-all duration-300">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Articles Management</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Professional CMS & Insights</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search articles..."
                            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <Link 
                        href={`/${locale}/admin/articles/create`}
                        className="h-10 px-6 rounded-lg bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        New Article
                    </Link>
                </div>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Article</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Language</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Status</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Date</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                        {filteredArticles.map(article => (
                            <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden shadow-sm">
                                            {article.image_url ? (
                                                <Image src={article.image_url} className="object-cover" alt="Article image" fill sizes="48px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined">image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{article.title}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">/{article.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{article.locale}</span>
                                </td>
                                <td className="p-5 text-center">
                                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-md ${article.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {article.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="p-5 text-center text-[10px] font-bold text-slate-400" suppressHydrationWarning>
                                    {new Date(article.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <Link href={`/${locale}/admin/articles/edit/${article.id}`} className="p-2 rounded-lg bg-slate-100 hover:bg-primary hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </Link>
                                        <button onClick={() => handleDelete(article.id)} className="p-2 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white transition-all text-rose-500">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
