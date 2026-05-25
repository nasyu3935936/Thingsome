import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false }, { status: 400 });

    // Supabase Admin API를 사용해 이메일로 사용자를 조회합니다.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ exists: false, error: 'SUPABASE config missing' }, { status: 500 });
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
      return NextResponse.json({ exists: false, error: text }, { status: res.status });
    }

    const users = await res.json();
    const exists = Array.isArray(users) && users.length > 0;
    return NextResponse.json({ exists, user: exists ? users[0] : null });
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err.message }, { status: 500 });
  }
}
