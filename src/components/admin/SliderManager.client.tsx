'use client';

import { useState, useRef } from 'react';
import { upsertSliderItem, deleteSliderItem } from '@/app/[locale]/admin/actions';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export function SliderManager({ initialSlides, locale }: { initialSlides: any[], locale: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openModal = (item: any = null) => {
        setEditingItem(item || {
            title: '',
            description: '',
            image_url: '',
            link: '',
            locale: locale,
            order_index: 0,
            is_active: true
        });
        setIsModalOpen(true);
        setPreviewUrl(item?.image_url || null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setPreviewUrl(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            const file = fileInputRef.current?.files?.[0];

            let imageUrl = editingItem?.image_url || '';

            // Handle File Upload
            if (file) {
                console.log('Starting file upload to Storage...', file.name);
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `slider/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Upload error details:', uploadError);
                    throw new Error('Upload failed: ' + uploadError.message);
                }

                console.log('Upload successful! Path:', filePath);
                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(filePath);
                
                imageUrl = publicUrl;
                console.log('Public URL generated:', imageUrl);
            }
            
            // Prepare data for upsert - ensuring empty strings are null for DB
            const payload = {
                ...(editingItem?.id ? { id: editingItem.id } : {}), // Only include ID if editing
                title: data.title || null,
                description: data.description || null,
                image_url: imageUrl,
                link: data.link || null,
                locale: data.locale || locale,
                order_index: parseInt(data.order_index as string) || 0,
                is_active: true
            };

            console.log('Sending payload to server action...', payload);
            const res = await upsertSliderItem(payload);
            console.log('Server action response:', res);

            if (res.success) {
                console.log('Success! Closing modal and refreshing...');
                closeModal();
                window.location.reload(); 
            } else {
                throw new Error(res.error || 'Something went wrong');
            }
        } catch (error: any) {
            console.error('CRITICAL ERROR in SliderManager:', error);
            alert('An error occurred: ' + error.message);
        } finally {
            console.log('Finished handleSubmit.');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Homepage Carousel Ads</h2>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 ring-4 ring-primary/5 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    New Slide
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {initialSlides.map(slide => (
                    <div key={slide.id} className="relative aspect-[16/7] rounded-xl overflow-hidden border border-outline-variant/10 group shadow-lg bg-slate-100 dark:bg-slate-800">
                        <img src={slide.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={slide.title} />
                        {(slide.title || slide.description) ? (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                <h4 className="text-white font-black text-lg tracking-tight leading-tight">{slide.title}</h4>
                                <p className="text-white/70 text-xs line-clamp-1 mt-1 font-medium">{slide.description}</p>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        )}

                        <span className={`absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest shadow-sm z-10 ${slide.locale === 'ar' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {slide.locale}
                        </span>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                            <div className="flex gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                <button 
                                    onClick={() => openModal(slide)}
                                    className="bg-white text-slate-900 p-2.5 rounded-md hover:bg-primary hover:text-white transition-all"
                                    title="Edit Slide"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button 
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to delete this slide?')) {
                                            await deleteSliderItem(slide.id);
                                            window.location.reload();
                                        }
                                    }}
                                    className="bg-rose-500 text-white p-2.5 rounded-md hover:bg-rose-600 transition-all"
                                    title="Delete Slide"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95"
                    >
                        <header className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    {editingItem?.id ? 'Edit Slide' : 'New Slide'}
                                </h3>
                                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Content Management</p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Title (Optional)</label>
                                    <input 
                                        name="title"
                                        defaultValue={editingItem?.title}
                                        placeholder="Slide Title (Leave empty for image only)"
                                        className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Description (Optional)</label>
                                    <textarea 
                                        name="description"
                                        rows={2}
                                        defaultValue={editingItem?.description}
                                        placeholder="Slide Description"
                                        className="w-full p-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Slide Image</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-full aspect-[16/6] bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
                                    >
                                        {previewUrl ? (
                                            <div className="absolute inset-0 group">
                                                <img src={previewUrl} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white font-bold text-xs uppercase tracking-widest">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">cloud_upload</span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload 1200x500 JPG/PNG</p>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Destination Link</label>
                                    <input 
                                        name="link"
                                        defaultValue={editingItem?.link}
                                        placeholder="/search?..."
                                        className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Locale</label>
                                    <select 
                                        name="locale"
                                        defaultValue={editingItem?.locale}
                                        className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                    >
                                        <option value="en">English</option>
                                        <option value="ar">Arabic</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Order Index</label>
                                    <input 
                                        name="order_index"
                                        type="number"
                                        defaultValue={editingItem?.order_index}
                                        className="w-full h-12 px-4 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <footer className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 h-12 rounded-md bg-primary text-white font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
