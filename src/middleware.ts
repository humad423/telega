import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['ar', 'en'];
const defaultLocale = 'en';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Initialize Supabase Client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 2. Auth Protection Logic
  if (!user && (pathname.includes('/admin') || pathname.includes('/dashboard'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (pathname.includes('/login') || pathname.includes('/signup'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. I18n Redirection/Rewrite Logic
  
  // Explicit /en accesses should be safely redirected to remove the /en prefix
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const strippedPath = pathname.replace(/^\/en/, '') || '/';
    const redirectUrl = new URL(strippedPath, request.url);
    redirectUrl.search = request.nextUrl.search;
    const finalResponse = NextResponse.redirect(redirectUrl);
    // Copy cookies from Supabase response
    response.cookies.getAll().forEach(cookie => {
        finalResponse.cookies.set(cookie.name, cookie.value);
    });
    return finalResponse;
  }

  // Paths with /ar should pass through naturally
  const pathnameHasLocale = pathname === '/ar' || pathname.startsWith('/ar/');
  if (pathnameHasLocale) {
     return response; 
  }

  // Any other bare paths (/) will implicitly rewrite to /en/ without modifying the browser URL
  const rewriteUrl = new URL(`/en${pathname}`, request.url);
  rewriteUrl.search = request.nextUrl.search;
  const finalResponse = NextResponse.rewrite(rewriteUrl);
  // Copy cookies from Supabase response
  response.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value);
  });
  return finalResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
