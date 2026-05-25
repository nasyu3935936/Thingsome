"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { GaugeChart, RadarChart, analyzeText, AnalysisResult, STAGES } from "@/components/SsumCharts";
import { Icons } from "@/components/Icons";

interface Message {
  id: string | number;
  sender: "me" | "other";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: "other", text: "안녕하세요! 매칭됐네요", time: "오후 2:30" },
  { id: 2, sender: "me", text: "안녕하세요~ 반가워요!", time: "오후 2:31" },
  { id: 3, sender: "other", text: "프로필 보니까 카페 좋아하시네요? 저도 카페 탐방 좋아해요", time: "오후 2:32" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showLikeToast, setShowLikeToast] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Supabase Realtime 관련 상태
  const [isDevMode, setIsDevMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [partnerNickname, setPartnerNickname] = useState("매칭된 상대");
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [roomCreatedAt, setRoomCreatedAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [partnerLiked, setPartnerLiked] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // AI 썸 측정 오버레이 상태
  const [showSsum, setShowSsum] = useState(false);
  const [ssumMode, setSsumMode] = useState<"analyzing" | "result">("analyzing");
  const [ssumResult, setSsumResult] = useState<AnalysisResult | null>(null);
  const [ssumAnimated, setSsumAnimated] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let channel: any = null;

    const checkUserAndSetup = async () => {
      // URL에서 roomId와 상대방 닉네임 가져오기 (Next.js 빌드 에러 방지를 위해 window 객체 사용)
      const searchParams = new URLSearchParams(window.location.search);
      const roomId = searchParams.get('roomId');
      const nickname = searchParams.get('nickname');
      
      if (nickname) setPartnerNickname(nickname);

      const { data: { user } } = await supabase.auth.getUser();
      
      // 로그인 안했거나 방 ID가 없으면 더미 모드로 작동
      if (!user || !roomId) {
        setIsDevMode(true);
        // 데모 모드인 경우 기본 예제 대화를 화면에 보여줌
        setMessages(INITIAL_MESSAGES);
        return;
      }
      
      setCurrentUser(user);
      setActiveRoomId(roomId);
      // 방 정보에서 상대방 ID 가져오기
      try {
        const { data: roomData, error: roomErr } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        if (!roomErr && roomData) {
            const otherId = roomData.user1_id === user.id ? roomData.user2_id : roomData.user1_id;
            // check expiry: if older than 24h, ask server to delete and redirect
            try {
              const createdAt = roomData.created_at ? new Date(roomData.created_at).getTime() : 0;
              if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
                // delete via server endpoint
                await fetch('/api/chat_rooms/delete_if_expired', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room_id: roomId }) });
                alert('채팅 시간이 만료되어 방이 닫혔습니다.');
                window.location.href = '/home';
                return;
              }
            } catch (e) {
              // ignore and continue
            }
          setPartnerId(otherId);
          // store created_at and remaining time
          try {
            if (roomData.created_at) {
              const created = new Date(roomData.created_at).getTime();
              setRoomCreatedAt(created);
              const rem = Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - created));
              setRemainingMs(rem);
            }
          } catch (e) {}
          // fetch partner profile
          try {
            const { data: p, error: pErr } = await supabase.from('profiles').select('*').eq('id', otherId).maybeSingle();
            if (!pErr && p) setPartnerProfile(p);
          } catch (e) {
            // ignore
          }
          // 현재 사용자가 상대에게 이미 호감 표현했는지 확인 (클라이언트 중복 방지)
          try {
            const { data: existing, error: exErr } = await supabase
              .from('likes')
              .select('id')
              .eq('from_user_id', user.id)
              .eq('to_user_id', otherId)
              .limit(1)
              .maybeSingle();
            if (!exErr && existing) setHasLiked(true);
          } catch (e) {
            // 실패해도 진행
          }

          // 상대가 나에게 이미 호감 표현했는지 확인해서 UI에 노출
          try {
            const { data: partnerLike, error: pErr } = await supabase
              .from('likes')
              .select('id')
              .eq('from_user_id', otherId)
              .eq('to_user_id', user.id)
              .limit(1)
              .maybeSingle();
            if (!pErr && partnerLike) setPartnerLiked(true);
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ignore
      }
      
      // 1. 기존 채팅 내역 불러오기
      const { data: pastMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (!error && pastMessages) {
        if (pastMessages.length > 0) {
          setMessages(pastMessages.map(msg => ({
            id: msg.id,
            sender: msg.sender_id === user.id ? "me" : "other",
            text: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true })
          })));
        } else {
          // 기존 대화가 없으면 첫 인사말 추가 가능 (여기서는 빈 배열로 시작)
          setMessages([]);
        }
      }
      
      // 2. 실시간 통신 (Realtime) 채널 구독
      channel = supabase.channel(`realtime:messages:${roomId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `room_id=eq.${roomId}` // 현재 방의 메시지만 필터링
        }, (payload) => {
            const newMsg = payload.new;
            // 내가 보낸 메시지는 handleSend에서 이미 화면에 띄웠으므로 무시 (상대방 것만 추가)
            if (newMsg.sender_id !== user.id) {
              setMessages(prev => [...prev, {
                id: newMsg.id,
                sender: "other",
                text: newMsg.content,
                time: new Date(newMsg.created_at).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true })
              }]);
              scrollToBottom(); // 새 메시지 수신 시 스크롤
            }
        })
        .subscribe();
    };
    
    checkUserAndSetup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  // countdown effect for remaining time
  useEffect(() => {
    if (roomCreatedAt == null || !activeRoomId) return;
    const tick = () => {
      const rem = Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - (roomCreatedAt || 0)));
      setRemainingMs(rem);
      if (rem <= 0) {
        // expired: call delete endpoint and redirect
        (async () => {
          try {
            await fetch('/api/chat_rooms/delete_if_expired', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room_id: activeRoomId }) });
          } catch (e) {}
          alert('채팅 시간이 만료되어 방이 닫혔습니다.');
          window.location.href = '/home';
        })();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roomCreatedAt, activeRoomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. 프론트엔드 화면에 즉시 반영 (낙관적 업데이트)
    const newMsg: Message = {
      id: Date.now(),
      sender: "me",
      text: input,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setMessages([...messages, newMsg]);
    setInput("");

    // 2. DB 저장 로직 (로그인 되어있고 활성화된 채팅방이 있을 때)
    if (!isDevMode && currentUser && activeRoomId) {
      const { error } = await supabase.from('messages').insert({
        room_id: activeRoomId,
        sender_id: currentUser.id,
        content: newMsg.text
      });
      if (error) console.error("메시지 DB 전송 실패:", error);
    } else {
      // 3. 개발 모드(더미)일 때는 상대방 자동 답장 시뮬레이션
      setTimeout(() => {
        const replies = [
          "ㅎㅎ 좋네요!",
          "오 그렇구나~",
          "저도 그거 좋아해요!",
          "다음에 같이 가봐요 ㅎㅎ",
          "진짜요?? 저도요!",
          "ㅋㅋㅋ 재밌다",
        ];
        const reply: Message = {
          id: Date.now() + 1,
          sender: "other",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, reply]);
      }, 1500);
    }
  };

  const handleLike = () => {
    // Prevent duplicate likes client-side
    if (hasLiked) {
      setShowLikeToast(true);
      setTimeout(() => setShowLikeToast(false), 1200);
      return;
    }

    // optimistic UI update
    setLikeCount((prev) => prev + 1);
    setShowLikeToast(true);

    // persist to DB when possible with existence check
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // prefer explicit partnerId if available, otherwise try to derive from URL params
        let toUserId = partnerId;
        if (!toUserId) {
          const params = new URLSearchParams(window.location.search);
          const roomIdParam = params.get('roomId');
          if (roomIdParam) {
            const { data: room } = await supabase.from('chat_rooms').select('*').eq('id', roomIdParam).single();
            if (room) {
              toUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
              setPartnerId(toUserId);
            }
          }
        }

        if (!toUserId) return;

        // check existing like
        const { data: existing, error: exErr } = await supabase
          .from('likes')
          .select('id')
          .eq('from_user_id', user.id)
          .eq('to_user_id', toUserId)
          .limit(1)
          .maybeSingle();

        if (exErr) {
          console.error('like existence check failed', exErr);
        }

        if (existing) {
          // 이미 존재함
          setLikeCount((prev) => Math.max(0, prev - 1));
          setHasLiked(true);
          return;
        }

        // 서버 엔드포인트로 요청하여 안전하게 삽입 및 상호 호감 감지/채팅방 생성을 위임
        try {
          const res = await fetch('/api/likes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from_user_id: user.id, to_user_id: toUserId, room_id: activeRoomId }),
          });
          const json = await res.json();
          if (!res.ok) {
            throw new Error(json?.error || 'like create failed');
          }
          if (json.mutual && json.room) {
            // 상호 호감으로 채팅방이 생성되었거나 기존 방을 가져옴
            setTimeout(() => {
              window.location.href = `/chat?roomId=${json.room.id}&nickname=${partnerNickname}`;
            }, 800);
          }
          setHasLiked(true);
        } catch (err) {
          console.error('server like create failed', err);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('like save error', err);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } finally {
        setTimeout(() => setShowLikeToast(false), 2000);
      }
    })();
  };

  const handleSsumMeasure = () => {
    // 썸 측정 시작
    setShowSsum(true);
    setSsumMode("analyzing");
    setSsumResult(null);
    setSsumAnimated(false);

    setTimeout(() => {
      // 현재 대화 내역 전체를 하나의 텍스트로 합쳐서 분석에 넘김
      const fullText = messages.map(m => m.text).join(" ");
      const res = analyzeText(fullText || "대화가 없습니다");
      setSsumResult(res);
      setSsumMode("result");
      setTimeout(() => setSsumAnimated(true), 300);
    }, 2500); // AI 분석 애니메이션 시간
  };

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "12px 16px",
          paddingTop: "max(12px, env(safe-area-inset-top))",
          background: "rgba(15, 11, 26, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/home"
          style={{
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "24px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <Icons.ArrowLeft />
        </Link>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
            color: "white"
          }}
        >
          <Icons.User />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "15px" }}>{partnerNickname}</div>
            <div style={{ fontSize: "12px", color: partnerLiked ? "var(--accent-400)" : "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}>
              {partnerLiked ? (
                <>
                  <Icons.HeartFilled /> 상대가 당신을 좋아합니다
                </>
              ) : (
                "온라인"
              )}
            </div>
        </div>
        {/* Profile view button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => {
            if (partnerId) router.push(`/profile/${partnerId}`);
            else {
              // fallback: open modal if no id available
              setShowProfileModal(true);
            }
          }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer' }}>
            프로필 보기
          </button>
        </div>
        {/* Timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(236, 72, 153, 0.1)",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--primary-400)",
          }}
        >
          <Icons.Clock />
          <span>
            {remainingMs != null
              ? `${String(Math.floor(remainingMs / 3600000)).padStart(2, '0')}:${String(Math.floor((remainingMs % 3600000) / 60000)).padStart(2, '0')}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}`
              : '24:00:00'
            }
          </span>
        </div>

        {/* More Menu */}
        <button
          onClick={handleSsumMeasure}
          style={{
            background: "rgba(168, 85, 247, 0.1)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            color: "var(--purple-400)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Icons.Sparkles /> 썸 측정
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Date Divider */}
        <div
          style={{
            textAlign: "center",
            padding: "8px 0",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              background: "var(--bg-glass)",
              padding: "4px 16px",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            오늘
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "me" ? "flex-end" : "flex-start",
              gap: "8px",
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            {msg.sender === "other" && (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  color: "white"
                }}
              >
                <Icons.User />
              </div>
            )}
            <div style={{ maxWidth: "75%" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius:
                    msg.sender === "me"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.sender === "me"
                      ? "var(--gradient-primary)"
                      : "var(--bg-glass)",
                  border:
                    msg.sender === "other"
                      ? "1px solid var(--border-subtle)"
                      : "none",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                  textAlign: msg.sender === "me" ? "right" : "left",
                  paddingLeft: msg.sender === "other" ? "4px" : 0,
                  paddingRight: msg.sender === "me" ? "4px" : 0,
                }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Like Toast */}
      {showLikeToast && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--gradient-primary)",
            padding: "20px 32px",
            borderRadius: "var(--radius-xl)",
            animation: "fadeIn 0.3s ease-out",
            zIndex: 20,
            textAlign: "center",
            boxShadow: "var(--shadow-glow-lg)",
          }}
        >
          <div style={{ color: "var(--primary-400)", display: "flex", justifyContent: "center", marginBottom: "8px", animation: "heartbeat 0.5s ease-in-out" }}>
            <Icons.HeartFilled />
          </div>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>
            호감을 표현했어요!
          </div>
          <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
            상대방도 누르면 서로에게 공개됩니다
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        style={{
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background: "rgba(15, 11, 26, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <form
          onSubmit={handleSend}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLike}
            disabled={hasLiked}
            title={hasLiked ? "이미 호감 표현함" : "호감 표현"}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: hasLiked ? "rgba(236, 72, 153, 0.12)" : likeCount > 0 ? "rgba(236, 72, 153, 0.2)" : "var(--bg-glass)",
              border: `1px solid ${hasLiked ? "rgba(236,72,153,0.18)" : likeCount > 0 ? "rgba(236, 72, 153, 0.3)" : "var(--border-subtle)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              cursor: hasLiked ? "default" : "pointer",
              flexShrink: 0,
              transition: "all var(--transition-fast)",
              position: "relative",
              color: hasLiked || likeCount > 0 ? "var(--primary-500)" : "inherit",
              opacity: hasLiked ? 0.9 : 1
            }}
          >
            <Icons.HeartFilled />
            {likeCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--accent-500)",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {likeCount}
              </span>
            )}
          </button>

          {/* Input */}
          <input
            className="input-field"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "var(--radius-full)",
            }}
          />

          {/* Send */}
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: input.trim() ? "var(--gradient-primary)" : "var(--bg-glass)",
              border: input.trim() ? "none" : "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              cursor: input.trim() ? "pointer" : "default",
              flexShrink: 0,
              transition: "all var(--transition-fast)",
              color: input.trim() ? "white" : "inherit"
            }}
          >
            <Icons.ArrowUp />
          </button>
        </form>
      </div>

      {/* Partner Profile Modal */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,11,26,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 740, borderRadius: 12, overflow: "hidden", background: "var(--bg-default)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.03)", display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Icons.ArrowLeft /></button>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>상대 프로필</h2>
            </div>

            <div style={{ padding: 20, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 96, height: 96, borderRadius: 20, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', flexShrink: 0 }}>
                {partnerProfile?.nickname ? partnerProfile.nickname.charAt(0) : <Icons.User />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{partnerProfile?.nickname || partnerNickname}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{partnerProfile?.major || partnerProfile?.department || ''} · {partnerProfile?.student_id || ''}학번 · {partnerProfile?.age ? `${partnerProfile.age}세` : ''}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{partnerProfile?.bio || '소개글이 없습니다.'}</div>

                {partnerProfile?.tags && partnerProfile.tags.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {partnerProfile.tags.map((t: string) => (
                      <span key={t} className="tag" style={{ fontSize: 12 }}>{t}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={() => { if (partnerId) router.push(`/profile/${partnerId}`); else setShowProfileModal(false); }} style={{ flex: 1 }}>전체 프로필 보기</button>
                  <button className="btn-secondary" onClick={() => { setShowProfileModal(false); }} style={{ flex: 1 }}>취소</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Ssum Measurement Overlay */}
      {showSsum && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 11, 26, 0.98)",
            zIndex: 100,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "var(--bg-default)", zIndex: 110 }}>
            <button
              onClick={() => setShowSsum(false)}
              style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginRight: "16px" }}
            >
              <Icons.ArrowLeft />
            </button>
            <h1 style={{ fontSize: "18px", fontWeight: 700 }}>
              <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI 썸 측정 리포트
              </span>
            </h1>
          </div>

          <div style={{ padding: "24px 20px", paddingBottom: "80px", maxWidth: "500px", margin: "0 auto", width: "100%" }}>
            {ssumMode === "analyzing" && (
              <div style={{ animation: "fadeIn 0.4s ease-out", textAlign: "center", padding: "60px 0" }}>
                <div style={{
                  width: "100px", height: "100px", borderRadius: "50%",
                  border: "3px solid transparent", borderTopColor: "var(--primary-500)", borderRightColor: "var(--purple-500)",
                  animation: "rotate 1s linear infinite", margin: "0 auto 24px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--primary-400)"
                }}>
                  <div style={{ display: "flex", animation: "heartbeat 1s ease-in-out infinite" }}><Icons.Sparkles /></div>
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>현재 대화를 분석하고 있어요...</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>방금까지 나눈 대화를 바탕으로 측정 중 <Icons.Sparkles /></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "24px", maxWidth: "280px", margin: "24px auto 0" }}>
                  {["답장 속도 분석 중...", "대화 주도성 파악 중...", "감정 표현 측정 중...", "문장 길이 분석 중...", "호칭/키워드 추출 중..."].map((t, i) => (
                    <div key={i} style={{
                      fontSize: "13px", color: "var(--text-muted)", opacity: 0,
                      animation: `fadeIn 0.3s ease-out ${i * 0.4}s forwards`,
                    }}>✓ {t}</div>
                  ))}
                </div>
              </div>
            )}

            {ssumMode === "result" && ssumResult && (
              <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                {/* Score */}
                <div className="glass-card" style={{ padding: "32px 24px", textAlign: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px" }}>종합 썸 지수</h2>
                  <GaugeChart score={ssumResult.totalScore} animated={ssumAnimated} />
                  <div style={{
                    marginTop: "16px", display: "inline-block", padding: "8px 20px",
                    background: "var(--gradient-primary)", borderRadius: "var(--radius-full)",
                    fontWeight: 700, fontSize: "16px",
                  }}>
                    {ssumResult.stage}
                  </div>
                </div>

                {/* Stage Progress */}
                <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px" }}>단계 판정</h3>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {STAGES.map((s, i) => (
                      <div key={s} style={{
                        flex: 1, height: "6px", borderRadius: "3px",
                        background: i <= ssumResult.stageIndex ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)",
                        transition: "background 0.5s ease",
                      }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>초면</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>사귀어도 될 것 같음</span>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>항목별 분석</h3>
                  <RadarChart metrics={ssumResult.metrics} animated={ssumAnimated} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                    {[
                      { label: "답장 속도", value: ssumResult.metrics.replySpeed, icon: <Icons.Lightning /> },
                      { label: "대화 주도성", value: ssumResult.metrics.initiative, icon: <Icons.Target /> },
                      { label: "감정 표현", value: ssumResult.metrics.emotion, icon: <Icons.HeartFilled /> },
                      { label: "문장 길이", value: ssumResult.metrics.messageLength, icon: <Icons.Clipboard /> },
                      { label: "호칭/키워드", value: ssumResult.metrics.keywords, icon: <Icons.Tag /> },
                    ].map((m) => (
                      <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ display: "flex", width: "24px", color: "var(--primary-400)" }}>{m.icon}</span>
                        <span style={{ fontSize: "13px", width: "80px", color: "var(--text-secondary)" }}>{m.label}</span>
                        <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: ssumAnimated ? `${m.value}%` : "0%",
                            background: "var(--gradient-primary)", borderRadius: "3px",
                            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                          }} />
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 700, width: "36px", textAlign: "right", color: "var(--primary-400)" }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Comment */}
                <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "16px", background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.08))" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--purple-400)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><Icons.Sparkles /> AI 코멘트</h3>
                  <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--text-primary)" }}>{ssumResult.comment}</p>
                </div>
                
                <button
                  className="btn-primary"
                  onClick={() => setShowSsum(false)}
                  style={{ width: "100%" }}
                >
                  확인 완료 (대화로 돌아가기)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
