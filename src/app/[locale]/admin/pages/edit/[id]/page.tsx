import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { PageEditor } from '@/components/admin/PageEditor.client';

export default async function EditPagePage({ params }: { params: { locale: string, id: string } | Promise<{ locale: string, id: string }> }) {
    const resolvedParams = await Promise.resolve(params);
    const { locale, id } = resolvedParams;
    const supabase = await createClient();

    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

    if (!page) {
        notFound();
    }

    return <PageEditor initialPage={page} locale={locale} />;
}
