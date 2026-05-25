import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false, verified: false }, { status: 400 });

    // Supabase Admin API를 사용해 이메일로 사용자를 조회합니다.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ exists: false, verified: false, error: 'SUPABASE config missing' }, { status: 500 });
    }

    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ exists: false, verified: false, error: text }, { status: res.status });
    }

    const users = await res.json();
    const exists = Array.isArray(users) && users.length > 0;
    let verified = false;

    // 사용자가 존재하면, profiles 테이블과 auth user metadata에서 school_email_verified 확인
    if (exists && users[0]) {
      try {
        const userMeta = users[0].raw_user_meta_data;
        if (userMeta && userMeta.school_email_verified === true) {
          verified = true;
        }
      } catch (e) {
        // ignore metadata parse error
      }

      try {
        const profileRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(users[0].id)}&select=school_email_verified`, {
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
        });
        if (profileRes.ok) {
          const profiles = await profileRes.json();
          if (Array.isArray(profiles) && profiles.length > 0 && profiles[0].school_email_verified === true) {
            verified = true;
          }
        }
      } catch (e) {
        // ignore profile fetch error
      }
    }

    return NextResponse.json({ exists, verified, user: exists ? users[0] : null });
  } catch (err: any) {
    return NextResponse.json({ exists: false, verified: false, error: err.message }, { status: 500 });
  }
}
