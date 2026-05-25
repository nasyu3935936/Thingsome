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
    };

    const roomRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?id=eq.${encodeURIComponent(room_id)}&select=user1_id,user2_id,broken_by_user1,broken_by_user2`,
      { headers }
    );

    if (!roomRes.ok) {
      throw new Error('room fetch failed');
    }

    const rooms = await roomRes.json();
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json({ error: 'room not found' }, { status: 404 });
    }

    const room = rooms[0];
    const isUser1 = room.user1_id === user_id;
    const isUser2 = room.user2_id === user_id;
    if (!isUser1 && !isUser2) {
      return NextResponse.json({ error: 'user is not part of room' }, { status: 403 });
    }

    if (!('broken_by_user1' in room) || !('broken_by_user2' in room)) {
      return NextResponse.json({ error: 'break feature is not enabled for chat rooms' }, { status: 422 });
    }

    const updatePayload = isUser1 ? { broken_by_user1: user_id } : { broken_by_user2: user_id };
    const updateRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?id=eq.${encodeURIComponent(room_id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!updateRes.ok) {
      const text = await updateRes.text();
      return NextResponse.json({ error: `break update failed: ${text}` }, { status: 500 });
    }

    const freshRoomRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?id=eq.${encodeURIComponent(room_id)}&select=user1_id,user2_id,broken_by_user1,broken_by_user2`,
      { headers }
    );

    if (!freshRoomRes.ok) {
      throw new Error('room fetch failed after update');
    }

    const freshRooms = await freshRoomRes.json();
    if (!Array.isArray(freshRooms) || freshRooms.length === 0) {
      return NextResponse.json({ error: 'room not found after update' }, { status: 404 });
    }

    const freshRoom = freshRooms[0];
    const user1Broken = !!freshRoom.broken_by_user1;
    const user2Broken = !!freshRoom.broken_by_user2;
    const partnerBroken = isUser1 ? user2Broken : user1Broken;
    const bothBroken = user1Broken && user2Broken;

    if (bothBroken) {
      const deleteRes = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/chat_rooms?id=eq.${encodeURIComponent(room_id)}`,
        { method: 'DELETE', headers }
      );
      if (!deleteRes.ok) {
        const text = await deleteRes.text();
        throw new Error(`room delete failed: ${text}`);
      }
      return NextResponse.json({ success: true, partnerBroken, roomDeleted: true });
    }

    return NextResponse.json({ success: true, partnerBroken, roomDeleted: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
