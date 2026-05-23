import { redirect } from 'next/navigation';
import { PageEditor } from '@/components/admin/PageEditor.client';

export default async function CreatePagePage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
    const resolvedParams = await Promise.resolve(params);
    const locale = resolvedParams.locale;

    return <PageEditor locale={locale} />;
}
