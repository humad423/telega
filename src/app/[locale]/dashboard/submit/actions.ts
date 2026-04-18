'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function submitEntry(formData: FormData, locale: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${locale}/login`)
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const link = formData.get('link') as string
  const type = formData.get('type') as 'channel' | 'group' | 'bot'
  const categoryId = formData.get('categoryId') as string
  const imageUrl = formData.get('imageUrl') as string
  const membersCount = parseInt(formData.get('membersCount') as string) || 0
  const isVerified = formData.get('isVerified') === 'true'
  const entryLocale = (formData.get('locale') as string) || locale

  // Check if link already exists
  const { data: existing } = await supabase
    .from('entries')
    .select('id')
    .eq('link', link)
    .single()

  if (existing) {
    return { error: locale === 'ar' ? 'هذا الرابط موجود بالفعل في الدليل.' : 'This link already exists in the directory.' }
  }

  // Generate slug from title
  const slug = title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces/hyphens
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens

  const { error } = await supabase
    .from('entries')
    .insert([
      {
        title,
        description,
        link,
        type,
        category_id: categoryId,
        image_url: imageUrl,
        members_count: membersCount,
        is_verified: isVerified,
        slug: `${slug}-${Math.floor(Math.random() * 10000)}`, // avoid collision
        locale: entryLocale,
        submitted_by: user.id,
        status: 'pending'
      }
    ])

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/${locale}/dashboard`)
  redirect(`/${locale}/dashboard`)
}
