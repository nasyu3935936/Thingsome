import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function applySupabaseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value)
  })
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // OAuth 콜백: PKCE verifier 쿠키가 필요하므로 getUser/signOut 하지 않음
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  let user = null

  try {
    const { data, error } = await supabase.auth.getUser()
    user = data.user

    if (error) {
      // Stale or revoked refresh token — clear cookies so the client can re-login cleanly
      await supabase.auth.signOut()
      user = null
    }
  } catch {
    await supabase.auth.signOut().catch(() => {})
    user = null
  }

  // 🛠 [개발 모드 우회] 원활한 프론트엔드 UI 개발과 테스트를 위해
  // 로컬 환경(localhost)에서는 미들웨어의 접속 차단을 일시 해제합니다.
  if (process.env.NODE_ENV === 'development') {
    return supabaseResponse
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    const redirectResponse = NextResponse.redirect(url)
    applySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    applySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  return supabaseResponse
}
