import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const locale = searchParams.get('locale') ?? 'ar';

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && sessionData?.user) {
      const user = sessionData.user;
      
      // Ensure the user has a profile in the 'profiles' table
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Generate a clean default username from email
        const email = user.email || '';
        let baseUsername = email.split('@')[0] || `user_${Math.floor(1000 + Math.random() * 9000)}`;
        // Sanitize username (remove special characters)
        baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Telegram User';

        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: baseUsername,
            full_name: fullName,
          });
      }

      return NextResponse.redirect(`${origin}/${locale}${next}`);
    }
  }

  // Return the user to the login page with an error parameter
  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_failed`);
}
