import { ArticlePageEditor } from '@/components/admin/ArticlePageEditor.client';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditArticlePage({ 
    params 
}: { 
    params: { locale: string, id: string } 
}) {
    const { id, locale } = await params;
    const supabase = await createClient();

    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (!article) return notFound();

    return (
        <ArticlePageEditor initialArticle={article} locale={locale} />
    );
}
