'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { fetchAndProcessTelegramLink } from '@/lib/telegram'

// Reusable server-side security assertion helper
async function assertAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized: Please log in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Forbidden: Admin access required')
  return user
}

export async function getTelegramMetadata(url: string) {
  return await fetchAndProcessTelegramLink(url)
}

export async function approveEntry(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase
      .from('entries')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/[locale]/admin', 'page')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function rejectEntry(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase
      .from('entries')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/[locale]/admin', 'page')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteEntry(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleFeatured(id: string, current: boolean) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('entries').update({ is_featured: !current }).eq('id', id)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleVerified(id: string, current: boolean) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('entries').update({ is_verified: !current }).eq('id', id)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleAdmin(userId: string, current: boolean) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertSliderItem(data: any) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    console.log('Upserting slider item:', data.id || 'new');
    
    const { error } = await supabase.from('slider_items').upsert(data)
    
    if (error) {
      console.error('Supabase upsert error:', error);
      return { error: error.message }
    }
    
    revalidatePath('/', 'layout')
    revalidatePath('/[locale]', 'layout')
    revalidatePath('/[locale]/admin', 'page')
    
    return { success: true }
  } catch (err: any) {
    console.error('Server action exception:', err);
    return { error: err.message || 'Internal server error' }
  }
}

export async function deleteSliderItem(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('slider_items').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertCategory(data: any) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('categories').upsert(data)
    if (error) return { error: error.message }
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertEntry(data: any) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)
    
    // Check for duplicate link if it's a new entry (no ID)
    if (!data.id && data.link) {
      const { data: existing } = await supabase.from('entries').select('id').eq('link', data.link).single()
      if (existing) {
        return { error: 'This link already exists in the directory.' }
      }
    }

    // Generate slug if it's a new entry (no ID) and no slug provided
    if (!data.id && !data.slug && data.title) {
      const slugBase = data.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      data.slug = `${slugBase}-${Math.floor(Math.random() * 10000)}`
    }

    const { error } = await supabase.from('entries').upsert(data)
    if (error) return { error: error.message }
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleBan(userId: string, current: boolean) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('profiles').update({ is_banned: !current }).eq('id', userId)
    if (error) return { error: error.message }
    revalidatePath('/admin', 'page')
    revalidatePath('/[locale]/admin', 'page')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateProfile(userId: string, data: any) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('profiles').update(data).eq('id', userId)
    if (error) return { error: error.message }
    revalidatePath('/admin', 'page')
    revalidatePath('/[locale]/admin', 'page')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertArticle(data: any) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)
    
    if (!data.id && !data.slug && data.title) {
      data.slug = data.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        + '-' + Math.floor(Math.random() * 1000)
    }

    const { error } = await supabase.from('articles').upsert(data)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/blog', 'layout')
    revalidatePath('/[locale]/blog', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteArticle(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/blog', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertPage(data: any) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)
    
    if (!data.id && !data.slug && data.title) {
      data.slug = data.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    }

    const { error } = await supabase.from('pages').upsert(data)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deletePage(id: string) {
  try {
    const supabase = await createClient()
    await assertAdmin(supabase)

    const { error } = await supabase.from('pages').delete().eq('id', id)
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
