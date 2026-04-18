'use client';

import { useState } from 'react';
import { getTelegramMetadata } from '@/app/[locale]/admin/actions';
import { submitEntry } from '@/app/[locale]/dashboard/submit/actions';

interface SubmitFormProps {
    categories: any[];
    locale: string;
    dict: any;
}

export default function SubmitForm({ categories, locale, dict }: SubmitFormProps) {
    const [step, setStep] = useState(1);
    const [fetchUrl, setFetchUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [entryLocale, setEntryLocale] = useState(locale);
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFetch = async () => {
        if (!fetchUrl) return;
        setIsFetching(true);
        setError(null);
        try {
            const res = await getTelegramMetadata(fetchUrl);
            if (res.success && res.data) {
                setFetchedData(res.data);
                setStep(2);
            } else {
                setError(res.error || 'Failed to fetch Telegram data. Please make sure the link is valid and public.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        
        // Append fetched data manually since they are hidden/read-only
        formData.append('title', fetchedData.title);
        formData.append('description', fetchedData.description);
        formData.append('link', fetchedData.link);
        formData.append('type', fetchedData.type);
        formData.append('imageUrl', fetchedData.imageUrl || fetchedData.image_url);
        formData.append('isVerified', fetchedData.is_verified.toString());
        formData.append('locale', entryLocale);

        try {
            const result = await submitEntry(formData, locale);
            if (result && result.error) {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 1) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-2xl">link</span>
                        <input 
                            type="text"
                            placeholder="https://t.me/example_channel"
                            value={fetchUrl}
                            onChange={(e) => setFetchUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                            className="w-full h-18 pl-16 pr-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 text-lg font-medium transition-all outline-none"
                        />
                    </div>
                    {error && (
                        <p className="text-rose-500 text-sm font-bold px-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </p>
                    )}
                </div>

                <button 
                    onClick={handleFetch}
                    disabled={isFetching || !fetchUrl}
                    className="w-full h-18 rounded-xl bg-primary text-white font-black text-lg uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                    {isFetching ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            {locale === 'ar' ? 'جاري التحليل...' : 'Analyzing Link...'}
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">auto_fix_high</span>
                            {locale === 'ar' ? 'سحب البيانات ودخول' : 'Analyze & Proceed'}
                        </>
                    )}
                </button>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                    <p className="text-amber-800 dark:text-amber-400 text-xs font-bold leading-relaxed flex gap-3">
                        <span className="material-symbols-outlined text-sm">info</span>
                        {locale === 'ar' 
                            ? 'سيتم استيراد اسم القناة ووصفها وصورتها تلقائياً. تأكد أن الرابط عام ويمكن الوصول إليه.'
                            : 'Channel name, description, and photo will be imported automatically. Make sure the link is public.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Fetched Data Preview (Locked) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    {locale === 'ar' ? 'معلومات مقفلة' : 'Verified Data'}
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-2xl ring-4 ring-white dark:ring-slate-700">
                        <img src={fetchedData.image_url} className="w-full h-full object-cover" alt={fetchedData.title} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            {fetchedData.title}
                            {fetchedData.is_verified && (
                                <span className="flex items-center gap-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    {locale === 'ar' ? 'موثق' : 'Verified'}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-md">
                                {fetchedData.type}
                            </span>
                            {fetchedData.members_count > 0 && (
                                <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-200/50 px-3 py-1 rounded-md flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">group</span>
                                    {fetchedData.members_count.toLocaleString()} {locale === 'ar' ? 'عضو' : 'Members'}
                                </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                                {fetchedData.link}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed italic">
                        "{fetchedData.description || (locale === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}"
                    </p>
                </div>
            </div>

            {/* Hidden fields for verified data */}
            <input type="hidden" name="membersCount" value={fetchedData.members_count || 0} />

            {/* User Choice Part */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 dark:text-slate-300 px-4 uppercase tracking-tighter">
                            {locale === 'ar' ? 'لغة القناة/البوت' : 'Entry Language'}
                        </label>
                        <select 
                            value={entryLocale}
                            onChange={(e) => setEntryLocale(e.target.value)}
                            className="w-full h-18 px-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 text-lg font-bold transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="ar">العربية (Arabic)</option>
                            <option value="en">English (الإنجليزية)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 dark:text-slate-300 px-4 uppercase tracking-tighter">
                            {locale === 'ar' ? 'اختر القسم المناسب' : 'Select Category'}
                        </label>
                        <select 
                            name="categoryId"
                            required
                            className="w-full h-18 px-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 text-lg font-bold transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="">--- {locale === 'ar' ? 'اختر الفئة' : 'Select Category'} ---</option>
                            {categories.filter(cat => cat.locale === entryLocale).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-center p-8 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="text-center space-y-2">
                        <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm">
                            {locale === 'ar' 
                                ? 'يتم مراجعة جميع الطلبات يدوياً لضمان جودة المحتوى ومطابقة البيانات لسياساتنا.'
                                : 'All submissions are reviewed manually to ensure content quality and policy compliance.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-rose-500 text-sm font-bold px-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </p>
            )}

            <div className="pt-4 flex gap-4">
                <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex-1 h-18 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    {locale === 'ar' ? 'رجوع' : 'Go Back'}
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-[2] h-18 rounded-xl bg-primary text-white font-black text-lg uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            {locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">send</span>
                            {locale === 'ar' ? 'إرسال للمراجعة' : 'Submit Review'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
