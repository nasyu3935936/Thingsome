-- Schema update for Thingsome chat features
-- Run this SQL in Supabase SQL editor or via psql against the project's database.

-- 1) messages 테이블에 읽음 표시 플래그 추가
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- 2) chat_rooms 테이블에 썸붕 상태 저장 컬럼 추가
ALTER TABLE public.chat_rooms
  ADD COLUMN IF NOT EXISTS broken_by_user1 uuid NULL,
  ADD COLUMN IF NOT EXISTS broken_by_user2 uuid NULL;

-- 3) 성능 개선을 위한 인덱스
CREATE INDEX IF NOT EXISTS messages_room_sender_read_idx
  ON public.messages (room_id, sender_id, is_read);

CREATE INDEX IF NOT EXISTS chat_rooms_broken_by_idx
  ON public.chat_rooms (broken_by_user1, broken_by_user2);
