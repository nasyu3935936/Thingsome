import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { room_id, user_id } = body;
    if (!room_id || !user_id) {
      return NextResponse.json({ error: 'room_id and user_id required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'supabase config missing' }, { status: 500 });
    }

    const headers = {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    const updateRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/messages?room_id=eq.${encodeURIComponent(room_id)}&sender_id=neq.${encodeURIComponent(user_id)}&is_read=eq.false`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_read: true }),
      }
    );

    if (!updateRes.ok) {
      const text = await updateRes.text();
      return NextResponse.json({ error: `mark read failed: ${text}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
