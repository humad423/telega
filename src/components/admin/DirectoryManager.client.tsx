'use client';

import { useState, useRef, useMemo } from 'react';
import { 
    approveEntry, 
    rejectEntry, 
    deleteEntry, 
    toggleFeatured, 
    toggleVerified, 
    upsertEntry,
    getTelegramMetadata
} from '@/app/[locale]/admin/actions';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

const supabase = createClient();

export function DirectoryManager({ 
    initialEntries, 
    categories,
    locale 
}: { 
    initialEntries: any[], 
    categories: any[],
    locale: string 
}) {
    const [entries, setEntries] = useState(initialEntries);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [localeFilter, setLocaleFilter] = useState('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [modalLocale, setModalLocale] = useState('ar');
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isFetchMode, setIsFetchMode] = useState(false);
    const [fetchUrl, setFetchUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    // Filtering logic
    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const matchesSearch = entry.title?.toLowerCase().includes(search.toLowerCase()) || 
                                 entry.link?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
            const matchesType = typeFilter === 'all' || entry.type === typeFilter;
            const matchesCategory = categoryFilter === 'all' || entry.category_id === categoryFilter;
            const matchesLocale = localeFilter === 'all' || entry.locale === localeFilter;
            
            return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesLocale;
        });
    }, [entries, search, statusFilter, typeFilter, categoryFilter, localeFilter]);

    const openModal = (entry: any) => {
        setEditingEntry(entry);
        setModalLocale(entry.locale || 'ar');
        setPreviewUrl(entry.image_url || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
        setPreviewUrl(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            const file = fileInputRef.current?.files?.[0];

            let imageUrl = editingEntry?.image_url || '';

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `directory/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, file);

                if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(filePath);
                
                imageUrl = publicUrl;
            }

            const payload = {
                ...editingEntry,
                title: data.title,
                link: data.link,
                type: data.type,
                category_id: data.category_id,
                additional_category_ids: [
                    data.category_2_id,
                    data.category_3_id,
                    data.category_4_id,
                ].filter(id => id && id !== 'none'),
                locale: data.locale,
                description: data.description,
                image_url: imageUrl,
                is_featured: data.is_featured === 'on',
                is_verified: data.is_verified === 'on',
                members_count: parseInt(data.members_count as string) || 0,
            };

            const res = await upsertEntry(payload);
            if (res.success) {
                closeModal();
                window.location.reload();
            } else {
                throw new Error(res.error || 'Failed to save entry');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (action: Function, ...args: any[]) => {
        const res = await action(...args);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Action failed');
        }
    };

    const [lastFetchTime, setLastFetchTime] = useState(0);

    const handleTelegramFetch = async () => {
        if (!fetchUrl) return;
        setIsFetching(true);
        try {
            const res = await getTelegramMetadata(fetchUrl);
            if (res.success && res.data) {
                const fetchedData = res.data;
                setEditingEntry({
                    title: fetchedData.title,
                    description: fetchedData.description,
                    image_url: fetchedData.image_url,
                    link: fetchedData.link,
                    type: fetchedData.type,
                    is_verified: !!fetchedData.is_verified,
                    members_count: fetchedData.members_count,
                    status: 'approved'
                });
                setLastFetchTime(Date.now());
                setPreviewUrl(fetchedData.image_url);
                setIsModalOpen(true);
                setIsFetchMode(false);
                setFetchUrl('');
            } else {
                alert(res.error || 'Failed to fetch Telegram data');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            className="w-full h-12 pl-12 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Search title, link or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => setIsFetchMode(!isFetchMode)}
                            className={`h-12 px-6 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${isFetchMode ? 'bg-rose-100 text-rose-600' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110'}`}
                        >
                            <span className="material-symbols-outlined text-lg">{isFetchMode ? 'close' : 'add_circle'}</span>
                            {isFetchMode ? 'Cancel' : 'Add via Link'}
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant/5 pt-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-md">
                        <select 
                            className="h-10 px-4 rounded bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 outline-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Every Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <select 
                            className="h-10 px-4 rounded bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 outline-none cursor-pointer"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="channel">Channels</option>
                            <option value="group">Groups</option>
                            <option value="bot">Bots</option>
                        </select>
                    </div>

                    <select 
                        className="h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer max-w-[200px]"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select 
                        className="h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer"
                        value={localeFilter}
                        onChange={(e) => setLocaleFilter(e.target.value)}
                    >
                        <option value="all">All Languages</option>
                        <option value="ar">🇸🇦 Arabic</option>
                        <option value="en">🇬🇧 English</option>
                    </select>

                    {filteredEntries.length !== entries.length && (
                        <button 
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('all');
                                setTypeFilter('all');
                                setCategoryFilter('all');
                                setLocaleFilter('all');
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline ml-auto"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* URL Fetch Input Area */}
                {isFetchMode && (
                    <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-outline-variant/10 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                            <input 
                                className="w-full h-12 pl-12 pr-4 rounded-md bg-white dark:bg-slate-900 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Paste Telegram link (e.g., https://t.me/durov)"
                                value={fetchUrl}
                                onChange={(e) => setFetchUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTelegramFetch()}
                            />
                        </div>
                        <button 
                            onClick={handleTelegramFetch}
                            disabled={isFetching || !fetchUrl}
                            className="h-12 px-8 rounded-md bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isFetching ? (
                                <span className="animate-spin material-symbols-outlined text-lg">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                            )}
                            {isFetching ? 'Fetching...' : 'Extract Data'}
                        </button>
                    </div>
                )}
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-outline-variant/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Entry Info</th>
                                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Category & Type</th>
                                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Language</th>
                                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Status</th>
                                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Flags</th>
                                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {filteredEntries.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                                                <Image 
                                                    src={entry.image_url || '/placeholder.png'} 
                                                    className="object-cover" 
                                                    alt={entry.title}
                                                    fill
                                                    sizes="48px"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{entry.title}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{entry.link.replace('https://t.me/', '@')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {categories.find(c => c.id === entry.category_id)?.name || 'Uncategorized'}
                                            </span>
                                            <span className="text-[10px] font-bold text-primary dark:text-primary/70 uppercase tracking-widest flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">
                                                    {entry.type === 'channel' ? 'cell_tower' : entry.type === 'bot' ? 'smart_toy' : 'groups'}
                                                </span>
                                                {entry.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center">
                                            <span className={`text-[10px] font-black uppercase w-9 h-6 flex items-center justify-center rounded border tracking-tighter ${
                                                entry.locale === 'ar' 
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50' 
                                                : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50'
                                            }`}>
                                                {entry.locale}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center">
                                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-md border tracking-widest ${
                                                entry.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                entry.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {entry.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleAction(toggleFeatured, entry.id, entry.is_featured)}
                                                className={`h-9 w-9 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${entry.is_featured ? 'bg-amber-100 text-amber-600 shadow-sm shadow-amber-200 hover:bg-amber-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                                                title="Toggle Featured"
                                            >
                                                <span className="material-symbols-outlined text-sm">star</span>
                                            </button>
                                            <button 
                                                onClick={() => handleAction(toggleVerified, entry.id, entry.is_verified)}
                                                className={`h-9 w-9 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${entry.is_verified ? 'bg-blue-100 text-blue-600 shadow-sm shadow-blue-200 hover:bg-blue-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                                                title="Toggle Verified"
                                            >
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            {entry.status !== 'approved' && (
                                                <button 
                                                    onClick={() => handleAction(approveEntry, entry.id)}
                                                    className="h-9 w-9 rounded-md bg-emerald-500 text-white flex items-center justify-center hover:brightness-110 shadow-lg shadow-emerald-500/20"
                                                    title="Approve"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                </button>
                                            )}
                                            {entry.status !== 'rejected' && (
                                                <button 
                                                    onClick={() => handleAction(rejectEntry, entry.id)}
                                                    className="h-9 w-9 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200"
                                                    title="Reject"
                                                >
                                                    <span className="material-symbols-outlined text-sm">block</span>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => openModal(entry)}
                                                className="h-9 w-9 rounded-md bg-slate-900 text-white flex items-center justify-center hover:bg-black shadow-lg shadow-black/20"
                                                title="Edit Entry"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Are you sure?')) handleAction(deleteEntry, entry.id) }}
                                                className="h-9 w-9 rounded-md bg-slate-100 text-rose-500 hover:bg-rose-50 flex items-center justify-center"
                                                title="Delete"
                                            >
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

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <header className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Edit Directory Entry</h3>
                                <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mt-1">Global Inventory Update</p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </header>

                        <form key={`${editingEntry?.id || 'new'}-${lastFetchTime}`} onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Entry Title</label>
                                        <input 
                                            name="title"
                                            required
                                            defaultValue={editingEntry?.title}
                                            className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Telegram Link</label>
                                        <input 
                                            name="link"
                                            required
                                            defaultValue={editingEntry?.link}
                                            className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Type</label>
                                            <select 
                                                name="type"
                                                defaultValue={editingEntry?.type}
                                                className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-xs font-black uppercase tracking-widest hover:brightness-95 cursor-pointer outline-none"
                                            >
                                                <option value="channel">Channel</option>
                                                <option value="group">Group</option>
                                                <option value="bot">Bot</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Language</label>
                                            <select 
                                                name="locale"
                                                defaultValue={editingEntry?.locale || 'ar'}
                                                onChange={(e) => setModalLocale(e.target.value)}
                                                className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-xs font-black uppercase tracking-widest hover:brightness-95 cursor-pointer outline-none"
                                            >
                                                <option value="ar">🇸🇦 العربية</option>
                                                <option value="en">🇬🇧 English</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Primary Category</label>
                                        <select 
                                            name="category_id"
                                            defaultValue={editingEntry?.category_id}
                                            className="w-full h-12 px-4 rounded-md bg-slate-200 dark:bg-slate-700 border-none text-xs font-black uppercase tracking-widest hover:brightness-95 cursor-pointer outline-none ring-2 ring-primary/20"
                                        >
                                            <option value="">None</option>
                                            {categories.filter(cat => cat.locale === modalLocale).map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Members Count</label>
                                        <input 
                                            name="members_count"
                                            type="number"
                                            defaultValue={editingEntry?.members_count || 0}
                                            className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Media & Additional Categories */}
                                <div className="space-y-4">
                                     <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 text-primary">Secondary Categories</label>
                                        <div className="space-y-2">
                                            {[2, 3, 4].map(num => (
                                                <select 
                                                    key={num}
                                                    name={`category_${num}_id`}
                                                    defaultValue={editingEntry?.additional_category_ids?.[num-2] || 'none'}
                                                    className="w-full h-10 px-3 rounded bg-slate-100 dark:bg-slate-800 border-none text-[10px] font-black uppercase tracking-wider hover:brightness-95 cursor-pointer outline-none transition-all"
                                                >
                                                    <option value="none">--- Select Extra ---</option>
                                                    {categories.filter(cat => cat.locale === modalLocale).map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            ))}
                                        </div>
                                    </div>

                                     <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity Image</label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
                                        >
                                            {previewUrl ? (
                                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Description</label>
                                    <textarea 
                                        name="description"
                                        rows={3}
                                        defaultValue={editingEntry?.description}
                                        className="w-full p-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-outline-variant/10">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="is_featured" defaultChecked={editingEntry?.is_featured} className="w-5 h-5 rounded border-2 border-slate-300 text-primary focus:ring-primary/20" />
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">🔥 Featured</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            name="is_verified" 
                                            checked={Boolean(editingEntry?.is_verified)} 
                                            onChange={(e) => setEditingEntry((prev: any) => prev ? { ...prev, is_verified: e.target.checked } : null)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-primary focus:ring-primary/20" 
                                        />
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">✔️ Verified</span>
                                    </label>
                                </div>
                            </div>

                            <footer className="pt-4 flex gap-4">
                                <button 
                                    type="button" onClick={closeModal}
                                    className="flex-1 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    type="submit" disabled={isLoading}
                                    className="flex-[2] h-12 rounded-lg bg-primary text-white font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : 'Save & Publish'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

