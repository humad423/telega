import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import DirectoryCard from '@/components/ui/DirectoryCard';
import { formatMembers } from '@/lib/utils';
import LocalePathRegister from '@/components/layout/LocalePathRegister';

export async function generateMetadata({ params }: { params: { locale: string, slug: string } | Promise<{ locale: string, slug: string }> }): Promise<any> {
    const resolvedParams = await Promise.resolve(params);
    const { locale, slug } = resolvedParams;
    const supabase = await createClient();

    let { data: article } = await supabase
        .from('articles')
        .select('title, excerpt, meta_title, meta_description, og_image')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

    if (!article) {
        const { data: fallbackArticle } = await supabase
            .from('articles')
            .select('title, excerpt, meta_title, meta_description, og_image')
            .eq('slug', slug)
            .maybeSingle();
        article = fallbackArticle;
    }

    if (!article) return {};

    return {
        title: article.meta_title || article.title,
        description: article.meta_description || article.excerpt,
        openGraph: {
            title: article.meta_title || article.title,
            description: article.meta_description || article.excerpt,
            images: article.og_image ? [article.og_image] : [],
        },
    };
}

export default async function ArticleDetailPage({ 
    params 
}: { 
    params: { locale: string, slug: string } | Promise<{ locale: string, slug: string }>
}) {
    const resolvedParams = await Promise.resolve(params);
    const { locale, slug } = resolvedParams;
    const dict = await getDictionary(locale);
    const supabase = await createClient();

    let { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .maybeSingle();

    if (!article) {
        const { data: fallbackArticle } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        article = fallbackArticle;
    }

    if (!article) notFound();

    // Find dynamic translation slug mappings
    const translationPaths: { en?: string; ar?: string } = {};
    if (locale === 'ar') {
        translationPaths.ar = `/ar/blog/${slug}`;
        const enSlugCandidate = slug.endsWith('-ar') ? slug.slice(0, -3) : slug;
        const { data: trans } = await supabase
            .from('articles')
            .select('slug')
            .eq('locale', 'en')
            .eq('slug', enSlugCandidate)
            .maybeSingle();
        translationPaths.en = trans ? `/blog/${trans.slug}` : `/blog/${slug}`;
    } else {
        translationPaths.en = `/blog/${slug}`;
        const arSlugCandidate = `${slug}-ar`;
        const { data: trans } = await supabase
            .from('articles')
            .select('slug')
            .eq('locale', 'ar')
            .eq('slug', arSlugCandidate)
            .maybeSingle();
        translationPaths.ar = trans ? `/ar/blog/${trans.slug}` : `/ar/blog/${slug}`;
    }

    return (
        <main className="pt-16 lg:pt-24 pb-12 lg:pb-20 px-4 lg:px-6 max-w-[900px] mx-auto min-h-screen">
            <LocalePathRegister paths={translationPaths} />
            <header className="mb-12">
                <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
                    <Link href={`/${locale}/blog`} className="hover:text-primary transition-colors">{dict.blogTitle || 'Blog'}</Link>
                    <span className="material-symbols-outlined text-[10px] rtl:rotate-180">chevron_right</span>
                    <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{article.title}</span>
                </nav>

                <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-[1.1] text-slate-900 dark:text-white mb-8">
                    {article.title}
                </h1>

                <div className="flex items-center gap-6 border-y border-outline-variant/10 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">TeleCurator Editor</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{dict.blogVerifiedAuthor || 'Verified Author'}</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-outline-variant/20"></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {new Date(article.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </header>

            {article.image_url && (
                <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-primary/5">
                    <img src={article.image_url} className="w-full h-full object-cover" alt={article.title} />
                </div>
            )}

            {/* ABSOLUTE VISUAL HIERARCHY INJECTION (Public mirroring Editor) */}
            <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
                .article-content-v2 h1 { 
                    font-size: 2.25rem !important; 
                    line-height: 1.1 !important; 
                    font-weight: 900 !important; 
                    letter-spacing: -0.05em !important; 
                    margin-bottom: 2.5rem !important;
                    margin-top: 4rem !important;
                    color: #0f172a !important;
                    display: block !important;
                }
                @media (min-width: 768px) {
                    .article-content-v2 h1 { font-size: 5rem !important; }
                }
                .article-content-v2 h2 { 
                    font-size: 1.85rem !important; 
                    line-height: 1.1 !important; 
                    font-weight: 900 !important; 
                    letter-spacing: -0.025em !important; 
                    margin-bottom: 1.8rem !important;
                    margin-top: 3.5rem !important;
                    color: #1e293b !important;
                    display: block !important;
                }
                @media (min-width: 768px) {
                    .article-content-v2 h2 { font-size: 3.5rem !important; }
                }
                .article-content-v2 h3 { 
                    font-size: 1.5rem !important; 
                    line-height: 1.2 !important; 
                    font-weight: 800 !important; 
                    margin-bottom: 1.2rem !important;
                    margin-top: 2.5rem !important;
                    color: #334155 !important;
                    display: block !important;
                }
                @media (min-width: 768px) {
                    .article-content-v2 h3 { font-size: 2.25rem !important; }
                }
                .dark .article-content-v2 h1, .dark .article-content-v2 h2, .dark .article-content-v2 h3 {
                    color: #f8fafc !important;
                }
                .article-content-v2 p {
                    font-size: 1.15rem !important;
                    line-height: 1.7 !important;
                    margin-bottom: 1.8rem !important;
                    color: #334155 !important;
                    font-family: 'Inter', 'Tajawal', sans-serif !important;
                }
                @media (min-width: 768px) {
                    .article-content-v2 p {
                        font-size: 1.25rem !important;
                        line-height: 1.8 !important;
                    }
                }
                .dark .article-content-v2 p {
                    color: #cbd5e1 !important;
                }
                .article-content-v2 blockquote {
                    border-inline-start: 4px solid #0369a1 !important;
                    padding-inline-start: 1.5rem !important;
                    margin: 2.5rem 0 !important;
                    font-style: italic !important;
                    color: #475569 !important;
                }
                .article-content-v2 strong { font-weight: 800 !important; }
            `}} />

            <div className="article-content-v2 prose prose-slate dark:prose-invert max-w-none">
                {renderContent(article.content, locale, dict)}
            </div>

            <footer className="mt-20 pt-12 border-t border-outline-variant/10">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-outline-variant/10 flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-black tracking-tight">{dict.blogNewsletterTitle || 'Stay Ahead of the Curve'}</h4>
                        <p className="text-sm text-slate-500 font-medium mt-1">{dict.blogNewsletterDesc || 'Get the latest Telegram strategies delivered weekly.'}</p>
                    </div>
                    <Link href={`/${locale}/search`} className="px-8 h-12 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                        {dict.blogExploreMore || 'Explore Directory'}
                    </Link>
                </div>
            </footer>
        </main>
    );
}

// Logic to render TipTap JSON/HTML
function renderContent(content: any, locale: string, dict: any) {
    if (!content) return null;
    
    // 1. Handle JSON Object (Directly from DB if not stringified)
    if (typeof content === 'object' && content.type === 'doc') {
        return (
            <div>
                {content.content.map((node: any, idx: number) => renderNode(node, idx, locale, dict))}
            </div>
        );
    }

    // 2. Handle String Content
    if (typeof content === 'string') {
        const trimmed = content.trim();
        
        // Try to detect if it's a JSON string
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed.type === 'doc') {
                    return (
                        <div>
                            {parsed.content.map((node: any, idx: number) => renderNode(node, idx, locale, dict))}
                        </div>
                    );
                }
            } catch (e) {
                // Not valid JSON, treat as HTML
            }
        }

        // 3. Render as HTML (New Default)
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    return null;
}

function renderNode(node: any, index: number, locale: string, dict: any) {
    const renderInline = (node: any) => {
        if (!node.content) return null;
        return node.content.map((c: any, i: number) => {
            if (c.type === 'text') {
                let text: any = c.text;
                if (c.marks) {
                    // Sort marks to ensure proper nesting if needed, or just apply sequentially
                    c.marks.forEach((m: any) => {
                        if (m.type === 'bold') text = <strong key={i}>{text}</strong>;
                        if (m.type === 'italic') text = <em key={i}>{text}</em>;
                        if (m.type === 'strike') text = <s key={i}>{text}</s>;
                        if (m.type === 'underline') text = <u key={i}>{text}</u>;
                        if (m.type === 'subscript') text = <sub key={i}>{text}</sub>;
                        if (m.type === 'superscript') text = <sup key={i}>{text}</sup>;
                        if (m.type === 'textStyle') {
                            const style: any = {};
                            if (m.attrs?.color) style.color = m.attrs.color;
                            if (m.attrs?.fontFamily) style.fontFamily = m.attrs.fontFamily;
                            if (m.attrs?.fontSize) style.fontSize = m.attrs.fontSize;
                            text = <span key={i} style={style}>{text}</span>;
                        }
                        if (m.type === 'highlight') {
                            text = <mark key={i} style={{ backgroundColor: m.attrs?.color || '#ffecb3' }}>{text}</mark>;
                        }
                    });
                }

                if (c.marks?.some((m: any) => m.type === 'link')) {
                    const linkMark = c.marks.find((m: any) => m.type === 'link');
                    const href = linkMark?.attrs?.href || '#';
                    text = (
                        <a 
                            key={i} 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-bold"
                        >
                            {text}
                        </a>
                    );
                }
                return text;
            }
            if (c.type === 'hardBreak') return <br key={i} />;
            return null;
        });
    };

    switch (node.type) {
        case 'heading':
            const Tag = `h${node.attrs?.level || 1}` as any;
            return <Tag key={index}>{renderInline(node)}</Tag>;
        
        case 'telegramCard':
            if (!node.attrs) return null;
            const { title, slug: cardSlug, image_url, type } = node.attrs;
            if (!title && !cardSlug) return null;
            
            return (
                <div key={index} className="my-10">
                    <Link href={`/${locale}/${cardSlug || ''}`} className="block group">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                                {image_url ? (
                                    <img src={image_url} className="w-full h-full object-cover m-0" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                        <span className="material-symbols-outlined text-primary/20 text-3xl">image</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight m-0">{title || 'Telegram Resource'}</h4>
                                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                </div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest opacity-80 m-0">@{cardSlug || 'link'} • {type || 'channel'}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45">
                                <span className="material-symbols-outlined">north_east</span>
                            </div>
                        </div>
                    </Link>
                </div>
            );
        
        case 'paragraph':
            const htmlContent = node.content?.[0]?.text || '';
            if (htmlContent.includes('data-type="telegram-card"')) {
                return renderEmbeddedCard(htmlContent, locale, dict);
            }
            if (htmlContent.includes('data-type="youtube"')) {
                return renderYoutubeEmbed(htmlContent);
            }
            return <p key={index} className="leading-relaxed mb-6 font-['Inter','Tajawal']">{renderInline(node)}</p>;

        case 'image':
            return (
                <div key={index} className="my-10">
                    <img 
                        src={node.attrs?.src} 
                        alt={node.attrs?.alt || ''} 
                        title={node.attrs?.title || ''}
                        className="rounded-3xl shadow-2xl border border-outline-variant/10 w-full object-cover max-h-[600px]"
                    />
                </div>
            );

        case 'table':
            return (
                <div key={index} className="overflow-x-auto my-10 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full border-collapse">
                        {node.content?.map((row: any, i: number) => renderNode(row, i, locale, dict))}
                    </table>
                </div>
            );
        
        case 'tableRow':
            return <tr key={index}>{node.content?.map((cell: any, i: number) => renderNode(cell, i, locale, dict))}</tr>;
            
        case 'tableCell':
            return <td key={index} className="border border-slate-200 dark:border-slate-800 p-3 text-sm">{node.content?.map((inner: any, i: number) => renderNode(inner, i, locale, dict))}</td>;
            
        case 'tableHeader':
            return <th key={index} className="border border-slate-200 dark:border-slate-800 p-3 text-sm font-black bg-slate-50 dark:bg-slate-800 text-left">{node.content?.map((inner: any, i: number) => renderNode(inner, i, locale, dict))}</th>;

        case 'taskList':
            return (
                <ul key={index} className="list-none pr-0 mb-6 space-y-2">
                    {node.content?.map((item: any, i: number) => renderNode(item, i, locale, dict))}
                </ul>
            );

        case 'taskItem':
            return (
                <li key={index} className="flex gap-3 items-start">
                    <input type="checkbox" checked={node.attrs?.checked} readOnly className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" />
                    <div>{node.content?.map((inner: any, i: number) => renderNode(inner, i, locale, dict))}</div>
                </li>
            );

        case 'bulletList':
            return (
                <ul key={index} className="list-disc pr-6 mb-6 space-y-2">
                    {node.content?.map((item: any, i: number) => (
                        <li key={i}>{item.content?.map((inner: any, j: number) => renderNode(inner, j, locale, dict))}</li>
                    ))}
                </ul>
            );

        case 'orderedList':
            return (
                <ol key={index} className="list-decimal pr-6 mb-6 space-y-2">
                    {node.content?.map((item: any, i: number) => (
                        <li key={i}>{item.content?.map((inner: any, j: number) => renderNode(inner, j, locale, dict))}</li>
                    ))}
                </ol>
            );

        case 'blockquote':
            return (
                <blockquote key={index} className="border-r-4 border-primary pr-6 py-2 italic text-xl font-medium text-slate-600 dark:text-slate-400 my-10">
                    {node.content?.map((inner: any, j: number) => renderNode(inner, j, locale, dict))}
                </blockquote>
            );

        case 'horizontalRule':
            return <hr key={index} className="border-outline-variant/10 my-12" />;

        case 'list_item':
            return <div key={index}>{node.content?.map((inner: any, i: number) => renderNode(inner, i, locale, dict))}</div>;

        default:
            return null;
    }
}

function renderYoutubeEmbed(html: string) {
    const match = html.match(/data-video-id="([^"]+)"/);
    const videoId = match ? match[1] : null;

    if (!videoId) return null;

    return (
        <div key={videoId} className="my-12">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/5 bg-black">
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

function renderEmbeddedCard(html: string, locale: string, dict: any) {
    // Extract ID/Slug from HTML string (this is a bit hacky but works for the demo)
    const match = html.match(/data-slug="([^"]+)"/);
    const slug = match ? match[1] : null;

    if (!slug) return null;

    // Since we are in a Server Component, we can't easily "fetch" inside this child without making it async.
    // However, for articles, the user wanted "Professional Integration".
    // I store the metadata in the editor block anyway.
    
    // For now, I'll render a professional Styled Placeholder that looks like our DirectoryCard.
    const titleMatch = html.match(/class="font-black[^>]*>([^<]+)/);
    const typeMatch = html.match(/data-type="telegram-card"/); // Just a marker

    return (
        <div key={slug} className="my-10">
            <Link href={`/${locale}/${slug}`} className="block group">
                <div className="bg-surface-container-lowest dark:bg-slate-900 p-6 rounded-3xl border-2 border-primary/5 group-hover:border-primary/20 shadow-sm transition-all flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                        {/* Note: This is a simplified preview */}
                        <div className="w-full h-full flex items-center justify-center text-primary/20">
                            <span className="material-symbols-outlined text-4xl">cell_tower</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                             <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{titleMatch?.[1] || 'Embedded Resource'}</h4>
                             <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest opacity-80">Telegram Community • Click to View</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45">
                        <span className="material-symbols-outlined">north_east</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
