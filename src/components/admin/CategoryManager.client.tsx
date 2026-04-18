'use client';

import { useState } from 'react';
import { upsertCategory, deleteCategory } from '@/app/[locale]/admin/actions';

export function CategoryManager({ 
    initialCategories, 
    locale 
}: { 
    initialCategories: any[], 
    locale: string 
}) {
    const [categories, setCategories] = useState(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const openModal = (category: any = null) => {
        setEditingCategory(category || { name: '', slug: '', icon: 'category', locale: locale });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());

            const payload = {
                ...editingCategory,
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                locale: data.locale,
            };

            const res = await upsertCategory(payload);
            if (res.success) {
                closeModal();
                window.location.reload();
            } else {
                throw new Error(res.error || 'Failed to save category');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? This might affect entries using it.')) return;
        
        setIsLoading(true);
        try {
            const res = await deleteCategory(id);
            if (res.success) {
                window.location.reload();
            } else {
                throw new Error(res.error || 'Failed to delete category');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Category Inventory</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage global directory taxonomies</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Create New Category
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.length === 0 ? (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">category</span>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No categories defined yet</p>
                    </div>
                ) : categories.map((cat) => (
                    <div key={cat.id} className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => openModal(cat)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all overflow-hidden"
                                    title="Edit"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(cat.id)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                    title="Delete"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight mb-1">{cat.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">/{cat.slug}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{cat.locale}</span>
                        </div>
                    </div>
                ))}
            </div>

             {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <header className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    {editingCategory?.id ? 'Edit Category' : 'New Category'}
                                </h3>
                                <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mt-1">Taxonomy Manifest</p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </header>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Display Name</label>
                                <input 
                                    name="name"
                                    required
                                    defaultValue={editingCategory?.name}
                                    placeholder="e.g. Technology & News"
                                    className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">URL Slug</label>
                                    <input 
                                        name="slug"
                                        required
                                        defaultValue={editingCategory?.slug}
                                        placeholder="tech-news"
                                        className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Language</label>
                                    <select 
                                        name="locale"
                                        defaultValue={editingCategory?.locale}
                                        className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-xs font-black uppercase tracking-widest hover:brightness-95 cursor-pointer outline-none"
                                    >
                                        <option value="ar">🇸🇦 Arabic (AR)</option>
                                        <option value="en">🇬🇧 English (EN)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                                    <span>Material Icon Name</span>
                                    <a href="https://fonts.google.com/icons" target="_blank" className="text-primary hover:underline lowercase tracking-normal font-normal">Browse Icons</a>
                                </label>
                                <div className="relative">
                                    <input 
                                        name="icon"
                                        required
                                        defaultValue={editingCategory?.icon}
                                        placeholder="category"
                                        className="w-full h-12 pl-12 pr-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">
                                        {editingCategory?.icon || 'category'}
                                    </span>
                                </div>
                            </div>

                            <footer className="pt-4 flex gap-4">
                                <button 
                                    type="button" onClick={closeModal}
                                    className="flex-1 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" disabled={isLoading}
                                    className="flex-[2] h-12 rounded-lg bg-primary text-white font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : 'Save Category'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
