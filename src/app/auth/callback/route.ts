import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { resolvePostLoginPath } from '@/lib/auth/post-login'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  if (oauthError) {
    console.error('[auth/callback] OAuth error:', oauthError, oauthErrorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=auth-failed&reason=${encodeURIComponent(oauthError)}`
    )
  }

  if (!code) {
    console.error('[auth/callback] Missing code param')
    return NextResponse.redirect(`${origin}/login?error=auth-failed&reason=missing_code`)
  }

  let response = NextResponse.redirect(getRedirectUrl(request, origin, '/onboarding'))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=auth-failed&reason=${encodeURIComponent(error.message)}`
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const nextPath = await resolvePostLoginPath(supabase, user.id, user)
    const redirectResponse = NextResponse.redirect(getRedirectUrl(request, origin, nextPath))
    response.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value)
    })
    response = redirectResponse
  }

  return response
}

function getRedirectUrl(request: NextRequest, origin: string, next: string) {
  const safeNext = next.startsWith('/') ? next : '/onboarding'
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    return `${origin}${safeNext}`
  }
  if (forwardedHost) {
    return `https://${forwardedHost}${safeNext}`
  }
  return `${origin}${safeNext}`
}
