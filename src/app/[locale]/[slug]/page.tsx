import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/i18n';

export const revalidate = 3600;

export async function generateMetadata({ 
    params 
}: { 
    params: { locale: string, slug: string } | Promise<{ locale: string, slug: string }>
}) {
    const resolvedParams = await Promise.resolve(params);
    const { locale, slug } = resolvedParams;

    let { data: page } = await supabase
        .from('pages')
        .select('title, content')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

    if (!page) {
        const { data: fallbackPage } = await supabase
            .from('pages')
            .select('title, content')
            .eq('slug', slug)
            .maybeSingle();
        page = fallbackPage;
    }

    if (!page) return {};

    // Generate a simple description if content exists
    let description = '';
    if (page.content) {
        if (typeof page.content === 'string') {
            description = page.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
        } else if (page.content.type === 'doc' && Array.isArray(page.content.content)) {
            const paragraphs = page.content.content.filter((n: any) => n.type === 'paragraph');
            const text = paragraphs.map((p: any) => p.content?.map((c: any) => c.text).join('')).join(' ');
            description = text.slice(0, 150) + '...';
        }
    }

    return {
        title: page.title,
        description: description || undefined,
        alternates: {
            canonical: `/${locale}/${slug}`,
        }
    };
}

export default async function StaticPage({ 
    params 
}: { 
    params: { locale: string, slug: string } | Promise<{ locale: string, slug: string }>
}) {
    const resolvedParams = await Promise.resolve(params);
    const { locale, slug } = resolvedParams;
    const dict = await getDictionary(locale);

    let { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

    if (!page) {
        const { data: fallbackPage } = await supabase
            .from('pages')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        page = fallbackPage;
    }

    if (!page) notFound();

    return (
        <main className="pt-8 lg:pt-32 pb-20 px-1.5 sm:px-6 max-w-[800px] mx-auto min-h-screen">
            <header className="mb-12 border-b border-outline-variant/10 pb-8">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-4">
                    {page.title}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Last Updated: {new Date(page.created_at).toLocaleDateString(locale)}
                </p>
            </header>

            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none font-['Inter','Tajawal']">
                {renderContent(page.content)}
            </div>
        </main>
    );
}

function renderContent(content: any) {
    if (!content) return null;
    if (typeof content === 'string') return <div dangerouslySetInnerHTML={{ __html: content }} />;
    
    // Simplified JSON to HTML for static pages
    if (content.type === 'doc' && Array.isArray(content.content)) {
        return content.content.map((node: any, idx: number) => {
            if (node.type === 'paragraph') {
                return <p key={idx} className="mb-6 leading-relaxed">{node.content?.map((c: any) => c.text).join('')}</p>;
            }
            if (node.type === 'heading') {
                const Tag = `h${node.attrs?.level || 2}` as any;
                return <Tag key={idx} className="font-black tracking-tight mt-10 mb-4">{node.content?.[0]?.text}</Tag>;
            }
            return null;
        });
    }
    return null;
}
