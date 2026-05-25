import { NextResponse } from 'next/server'

// 서버 측에서 Supabase 서비스 역할 키를 사용해 안전하게 처리합니다.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from_user_id, to_user_id, room_id } = body;
    if (!from_user_id || !to_user_id) {
      return NextResponse.json({ error: 'from_user_id and to_user_id required' }, { status: 400 });
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
    };

    // 1) 이미 같은 from->to 호감이 존재하는지 확인
    const checkRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/likes?select=id&from_user_id=eq.${encodeURIComponent(from_user_id)}&to_user_id=eq.${encodeURIComponent(to_user_id)}&limit=1`,
      { headers }
    );
    if (!checkRes.ok) throw new Error('like check failed');
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) {
      // 이미 존재함: 상호 호감 가능성 확인(다른 쪽에서 이미 보냈는지)
    } else {
      // 삽입 시도
      const insertRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/likes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ from_user_id, to_user_id, room_id }),
      });
      if (!insertRes.ok) {
        const text = await insertRes.text();
        throw new Error(`like insert failed: ${text}`);
      }
    }

    // 2) 상대가 먼저 보냈는지(상호 호감) 확인
    const mutualRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/likes?select=id&from_user_id=eq.${encodeURIComponent(to_user_id)}&to_user_id=eq.${encodeURIComponent(from_user_id)}&limit=1`,
      { headers }
    );
    if (!mutualRes.ok) throw new Error('mutual check failed');
    const mutual = await mutualRes.json();

    let createdRoom: any = null;
    if (Array.isArray(mutual) && mutual.length > 0) {
      // enforce per-user active room limit (24h active window)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      // count active rooms for from_user
      const fromRoomsRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?select=id&or=(user1_id.eq.${encodeURIComponent(from_user_id)},user2_id.eq.${encodeURIComponent(from_user_id)})&created_at=gte.${encodeURIComponent(cutoff)}`, { headers });
      if (!fromRoomsRes.ok) throw new Error('active room count failed');
      const fromRooms = await fromRoomsRes.json();
      if (Array.isArray(fromRooms) && fromRooms.length >= 3) {
        return NextResponse.json({ error: 'from_user reached active chat room limit' }, { status: 400 });
      }
      // count active rooms for to_user
      const toRoomsRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?select=id&or=(user1_id.eq.${encodeURIComponent(to_user_id)},user2_id.eq.${encodeURIComponent(to_user_id)})&created_at=gte.${encodeURIComponent(cutoff)}`, { headers });
      if (!toRoomsRes.ok) throw new Error('active room count failed');
      const toRooms = await toRoomsRes.json();
      if (Array.isArray(toRooms) && toRooms.length >= 3) {
        return NextResponse.json({ error: 'to_user reached active chat room limit' }, { status: 400 });
      }
      // 상호 호감이면 채팅방이 이미 있는지 확인 후 없으면 생성
      const roomCheckRes = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?select=*&or=(and(user1_id.eq.${encodeURIComponent(from_user_id)},user2_id.eq.${encodeURIComponent(to_user_id)}),and(user1_id.eq.${encodeURIComponent(to_user_id)},user2_id.eq.${encodeURIComponent(from_user_id)}))&limit=1`,
        { headers }
      );
      if (!roomCheckRes.ok) throw new Error('room check failed');
      const rooms = await roomCheckRes.json();
      if (!Array.isArray(rooms) || rooms.length === 0) {
        // 생성
        const createRoomRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user1_id: from_user_id, user2_id: to_user_id }),
        });
        if (!createRoomRes.ok) {
          const text = await createRoomRes.text();
          throw new Error(`chat room create failed: ${text}`);
        }
        const created = await createRoomRes.json();
        createdRoom = Array.isArray(created) ? created[0] : created;
      } else {
        createdRoom = rooms[0];
      }
    }

    return NextResponse.json({ success: true, mutual: Array.isArray(mutual) && mutual.length > 0, room: createdRoom || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
