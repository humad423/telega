import { ArticlePageEditor } from '@/components/admin/ArticlePageEditor.client';

export default async function CreateArticlePage({ 
    params 
}: { 
    params: { locale: string } 
}) {
    const { locale } = await params;

    return (
        <ArticlePageEditor locale={locale} />
    );
}
