import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { room_id } = body;
    if (!room_id) return NextResponse.json({ error: 'room_id required' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'supabase config missing' }, { status: 500 });

    const headers = {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
    };

    // fetch room
    const roomRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?id=eq.${encodeURIComponent(room_id)}&select=*`, { headers });
    if (!roomRes.ok) throw new Error('room fetch failed');
    const rooms = await roomRes.json();
    if (!Array.isArray(rooms) || rooms.length === 0) return NextResponse.json({ deleted: false, reason: 'not_found' });
    const room = rooms[0];

    const createdAt = room.created_at ? new Date(room.created_at).getTime() : 0;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    if (createdAt > cutoff) {
      return NextResponse.json({ deleted: false, reason: 'not_expired' });
    }

    // delete
    const delRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?id=eq.${encodeURIComponent(room_id)}`, { method: 'DELETE', headers });
    if (!delRes.ok) {
      const text = await delRes.text();
      throw new Error(`delete failed: ${text}`);
    }
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
