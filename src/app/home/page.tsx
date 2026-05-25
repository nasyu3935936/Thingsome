"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Icons } from "@/components/Icons";

/* ========== Bottom Nav Component ========== */
function BottomNav({ active }: { active: string }) {
  const items = [
    { id: "home", label: "홈", icon: <Icons.Home />, href: "/home" },
    { id: "chat", label: "채팅", icon: <Icons.Chat />, href: "/chat" },
    { id: "ssum", label: "썸 측정", icon: <Icons.Sparkles />, href: "/ssum" },
    { id: "my", label: "마이", icon: <Icons.User />, href: "/mypage" },
  ];

  const checkAndGoChat = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('매칭 중인 방이 없습니다!');
        window.location.href = '/home';
        return;
      }
      const { data } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .limit(1);
      if (data && data.length > 0) {
        window.location.href = '/chat';
      } else {
        alert('매칭 중인 방이 없습니다!');
        window.location.href = '/home';
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다. 홈으로 이동합니다.');
      window.location.href = '/home';
    }
  };

  return (
    <nav className="nav-bottom">
      <div className="nav-bottom-inner">
        {items.map((item) => {
          if (item.id === 'chat') {
            return (
              <button key={item.id} className={`nav-item ${active === item.id ? "nav-item-active" : ""}`} onClick={checkAndGoChat}>
                <span style={{ marginBottom: "4px" }}>{item.icon}</span>
                <span style={{ fontSize: "10px" }}>{item.label}</span>
              </button>
            );
          }
          return (
            <Link key={item.id} href={item.href} className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}>
              <span style={{ marginBottom: "4px" }}>{item.icon}</span>
              <span style={{ fontSize: "10px" }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ========== Match Card ========== */
function MatchCard({
  match,
  onAccept,
  onReject,
}: {
  match: {
    nickname: string;
    department: string;
    year: number;
    age: number;
    bio: string;
    interests: string[];
    gender: string;
  };
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "28px 24px",
        animation: "fadeInUp 0.5s ease-out forwards",
      }}
    >
      {/* Profile */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            background: "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "16px",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          {match.nickname.charAt(0)}
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
          {match.nickname}
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          {match.department} · {match.year}학번 · {match.age}세
        </p>
        <p
          style={{
            fontSize: "15px",
            color: "var(--text-primary)",
            marginTop: "12px",
            fontStyle: "italic",
          }}
        >
          &ldquo;{match.bio}&rdquo;
        </p>
      </div>

      {/* Interests */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          marginBottom: "28px",
        }}
      >
        {match.interests.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onReject}
          className="btn-secondary"
          style={{ flex: 1, borderColor: "rgba(239,68,68,0.3)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Icons.X /> 넘기기
        </button>
        <button onClick={onAccept} className="btn-primary" style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <Icons.HeartFilled /> 수락하기
        </button>
      </div>
    </div>
  );
}

/* ========== Home Page ========== */
export default function HomePage() {
  const [isMatching, setIsMatching] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchAccepted, setMatchAccepted] = useState(false);
  const [matchingCountdown, setMatchingCountdown] = useState<number | null>(null);
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<any>({ nickname: "나" });

  // 실시간 통계 (기본값 0)
  const [statMatches, setStatMatches] = useState(0);
  const [statChats, setStatChats] = useState(0);
  const [statLikes, setStatLikes] = useState(0);

  useEffect(() => {
    // 1. 내 정보 불러오기 (우상단 아이콘용)
    const saved = localStorage.getItem("thingsome_temp_profile");
    if (saved) {
      try { setMyProfile(JSON.parse(saved)); } catch (e) {}
    }

    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // --- 실시간 통계 가져오기 ---
          // 오늘 매칭 수: 내가 참여한 chat_rooms 중 오늘 생성된 것
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const { count: matchCount } = await supabase
            .from('chat_rooms')
            .select('*', { count: 'exact', head: true })
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .gte('created_at', todayStart.toISOString());
          setStatMatches(matchCount || 0);

          // 활성 채팅 수: 내가 참여한 전체 chat_rooms
          const { count: chatCount } = await supabase
            .from('chat_rooms')
            .select('*', { count: 'exact', head: true })
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
          setStatChats(chatCount || 0);

          // 받은 호감 수: likes 테이블에서 내가 받은 것 (테이블이 없으면 0 유지)
          try {
            const { count: likeCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('to_user_id', user.id);
            setStatLikes(likeCount || 0);
          } catch { /* likes 테이블이 아직 없으면 무시 */ }

            // --- 매칭 후보 프로필 가져오기 (나 자신 제외) ---
            // 매칭 선호 중 '같은 학과 제외' 옵션을 로컬스토리지에서 읽어옵니다.
            const excludeSame = (() => {
              try {
                return localStorage.getItem('thingsome_pref_exclude_same_dept') === 'true';
              } catch (e) { return false; }
            })();

            // 내 학과(major)를 DB에서 읽어 후보 필터링에 사용
            let myMajor: string | null = null;
            try {
              const { data: myp } = await supabase.from('profiles').select('major').eq('id', user.id).maybeSingle();
              if (myp && myp.major) myMajor = myp.major;
            } catch (e) { /* ignore */ }

            const { data: profiles, error } = await supabase
              .from('profiles')
              .select('*')
              .neq('id', user.id)
              .limit(20);

            if (!error && profiles && profiles.length > 0) {
              // 필터링: 같은 학과 제외 옵션이 켜져 있고 내 학과를 알 수 있다면 동일 학과는 제외
              const filtered = profiles.filter((p: any) => {
                if (excludeSame && myMajor && (p.major || '') === myMajor) return false;
                return true;
              });

              const formatted = filtered.slice(0, 10).map((p: any) => ({
                id: p.id,
                nickname: p.nickname || "익명",
                department: p.major || "명지대학교",
                year: p.student_id ? parseInt(p.student_id) : 2024,
                age: p.age || 20,
                bio: p.bio || "반갑습니다",
                interests: p.tags || ["선택없음"],
                gender: p.gender || "여성",
              }));
              setCandidates(formatted);
            } else {
              setCandidates([]); // 실제 프로필이 없으면 빈 배열
            }
        } else {
          setCandidates([]);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setCandidates([]);
      }
    };
    fetchData();

    // 실시간 통계 업데이트용 구독 설정
    let channel: any = null;
    const setupRealtime = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        channel = supabase
          .channel(`home:stats:${user.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_rooms' }, (payload) => {
            const room = payload.new;
            if (!room) return;
            // 방에 내가 포함된 경우만 카운트 (데모 id 필터링)
            if (String(room.user1_id).startsWith('demo') || String(room.user2_id).startsWith('demo')) return;
            if (room.user1_id !== user.id && room.user2_id !== user.id) return;

            // 전체 활성 채팅(방) 수 증가
            setStatChats((v) => (v || 0) + 1);

            // 오늘 생성된 방이면 오늘 매칭 수 증가
            if (new Date(room.created_at) >= todayStart) {
              setStatMatches((v) => (v || 0) + 1);
            }
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, (payload) => {
            const like = payload.new;
            if (!like) return;
            if (like.to_user_id === user.id) {
              setStatLikes((v) => (v || 0) + 1);
            }
          })
          .subscribe();
      } catch (err) {
        console.error('Realtime setup failed', err);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const currentMatch = candidates[currentIndex];

  const handleStartMatching = () => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const DEV_EMAIL = 'suk3935936@mju.ac.kr';
        const isDev = !!(user && user.email && user.email.toLowerCase() === DEV_EMAIL);
        if (!user) {
          alert('로그인이 필요합니다.');
          return;
        }

        // 일일 매칭 횟수 제한(오늘 생성된 chat_rooms 수)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from('chat_rooms')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .gte('created_at', todayStart.toISOString());

        // 개발자 계정은 제한 해제
        if (!isDev && (todayCount || 0) >= 3) {
          alert('오늘은 이미 3회 매칭을 진행하셨습니다. 내일 다시 시도해주세요.');
          return;
        }

        setIsMatching(true);
        const MAX_SECONDS = 30;
        let elapsed = 0;
        setMatchingCountdown(MAX_SECONDS - elapsed);

        // helper: 시도해서 후보 한 명 리턴
        const tryFindCandidate = async () => {
          // 먼저 내 프로필을 가져와 성별 등 정보 사용
          let myGender: string | null = null;
          try {
            const { data: myp } = await supabase.from('profiles').select('gender').eq('id', user.id).maybeSingle();
            if (myp && myp.gender) myGender = myp.gender;
          } catch (e) {}

          // 개발자 모드이면 성별/제약 없이 전체 후보를 탐색
          let query = supabase.from('profiles').select('*').neq('id', user.id).limit(20);
          if (!isDev) {
            if (myGender === '남성') query = query.eq('gender', '여성');
            else if (myGender === '여성') query = query.eq('gender', '남성');
          }

          const { data: candidatesRaw, error } = await query;
          if (error || !candidatesRaw || candidatesRaw.length === 0) return null;

          // 랜덤 후보 하나 선택
          const shuffled = candidatesRaw.sort(() => 0.5 - Math.random());
          return shuffled[0];
        };

        // 폴링 루프: 1초 간격으로 최대 MAX_SECONDS (UI는 1초 단위로 카운트)
        const intervalMs = 1000;
        const intervalId = setInterval(async () => {
          elapsed += 1; // seconds
          setMatchingCountdown(Math.max(0, MAX_SECONDS - elapsed));
          try {
            const candidate = await tryFindCandidate();
            if (candidate) {
              clearInterval(intervalId);
              setMatchingCountdown(null);
              // 채팅방 생성 및 이동
                try {
                  // enforce per-user 3 active rooms (24h window)
                  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                  const { data: myRooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).gte('created_at', cutoff);
                  if (myRooms && myRooms.length >= 3) {
                    alert('활성 채팅방이 3개를 초과하여 새 채팅을 생성할 수 없습니다.');
                    setIsMatching(false);
                    return;
                  }
                  // check candidate active rooms
                  const { data: candRooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${candidate.id},user2_id.eq.${candidate.id}`).gte('created_at', cutoff);
                  if (candRooms && candRooms.length >= 3) {
                    // candidate too busy, continue polling
                    setIsMatching(true);
                    return;
                  }

                  const { data: room, error: roomErr } = await supabase.from('chat_rooms').insert({ user1_id: user.id, user2_id: candidate.id }).select().single();
                  if (!roomErr && room) {
                    setIsMatching(false);
                    window.location.href = `/chat?roomId=${room.id}&nickname=${candidate.nickname}`;
                    return;
                  }
                } catch (e) {
                  console.error('chat room create failed', e);
                }
            }

            if (elapsed >= MAX_SECONDS) {
              clearInterval(intervalId);
              setMatchingCountdown(null);
              // 폴백: 성별 반대인 프로필(프로필 설정된 사용자)에서 하나 선택
              try {
                const myp = await supabase.from('profiles').select('gender').eq('id', user.id).maybeSingle();
                const myGender = myp.data ? myp.data.gender : null;
                // 개발자 모드이면 제약 없이 폴백 후보 사용
                let fallbackQ = supabase.from('profiles').select('*').neq('id', user.id).limit(20);
                if (!isDev) {
                  if (myGender === '남성') fallbackQ = fallbackQ.eq('gender', '여성');
                  else if (myGender === '여성') fallbackQ = fallbackQ.eq('gender', '남성');
                }
                const { data: fallbackList } = await fallbackQ;
                if (fallbackList && fallbackList.length > 0) {
                  const pick = fallbackList.sort(() => 0.5 - Math.random())[0];
                    // enforce per-user limit before fallback create
                    try {
                      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                      const { data: myRooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).gte('created_at', cutoff);
                      if (myRooms && myRooms.length >= 3) {
                        alert('활성 채팅방이 3개를 초과하여 새 채팅을 생성할 수 없습니다.');
                        setIsMatching(false);
                        return;
                      }
                      const { data: candRooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${pick.id},user2_id.eq.${pick.id}`).gte('created_at', cutoff);
                      if (candRooms && candRooms.length >= 3) {
                        // candidate busy, skip
                      } else {
                        const { data: room, error: roomErr } = await supabase.from('chat_rooms').insert({ user1_id: user.id, user2_id: pick.id }).select().single();
                        if (!roomErr && room) {
                          setIsMatching(false);
                          window.location.href = `/chat?roomId=${room.id}&nickname=${pick.nickname}`;
                          return;
                        }
                      }
                    } catch (e) {
                      console.error('fallback chat create failed', e);
                    }
                }
              } catch (e) {
                console.error('fallback match failed', e);
              }

              setIsMatching(false);
              alert('매칭 가능한 사용자를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.');
            }
          } catch (err) {
            console.error('matching loop error', err);
            clearInterval(intervalId);
            setMatchingCountdown(null);
            setIsMatching(false);
            alert('매칭 중 오류가 발생했습니다. 다시 시도해주세요.');
          }
        }, intervalMs);

      } catch (err) {
        console.error('start matching failed', err);
        alert('매칭 시작 중 오류가 발생했습니다.');
      }
    })();
  };

  const handleAccept = async () => {
    setMatchAccepted(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && currentMatch && currentMatch.id && !currentMatch.id.toString().startsWith("demo")) {
        try {
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: myRooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`).gte('created_at', cutoff);
          if (myRooms && myRooms.length >= 3) {
            alert('활성 채팅방이 3개를 초과하여 새 채팅을 생성할 수 없습니다.');
            setMatchAccepted(false);
            return;
          }
          const { data: candRooms } = await supabase.from('chat_rooms').select('id').or(`user1_id.eq.${currentMatch.id},user2_id.eq.${currentMatch.id}`).gte('created_at', cutoff);
          if (candRooms && candRooms.length >= 3) {
            alert('상대방의 활성 채팅방이 많아 매칭할 수 없습니다.');
            setMatchAccepted(false);
            return;
          }

          const { data: room, error } = await supabase.from('chat_rooms').insert({ user1_id: user.id, user2_id: currentMatch.id }).select().single();
          if (!error && room) {
            setTimeout(() => {
              window.location.href = `/chat?roomId=${room.id}&nickname=${currentMatch.nickname}`;
            }, 1500);
            return;
          } else {
            console.error("채팅방 생성 에러:", error);
          }
        } catch (e) {
          console.error('accept create failed', e);
        }
      }
    } catch (err) {
      console.error("매칭 로직 중 오류 발생:", err);
    }

    setTimeout(() => {
      window.location.href = "/chat";
    }, 1500);
  };

  const handleReject = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < candidates.length) {
      setShowMatch(false);
      setCurrentIndex(nextIndex);
      setTimeout(() => setShowMatch(true), 100);
    } else {
      alert("오늘은 더 이상 추천할 새로운 상대가 없습니다.\n내일 다시 찾아주세요!");
      setShowMatch(false);
      setCurrentIndex(0);
    }
  };

  return (
    <main className="pb-safe">
      <div className="container-app" style={{ paddingTop: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              안녕하세요 <span style={{ color: "var(--primary-400)" }}><Icons.HeartFilled /></span>
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              오늘의 인연을 찾아보세요
            </p>
          </div>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "white"
            }}
          >
            {myProfile.nickname.charAt(0)}
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {[
            { label: "오늘 매칭", value: String(statMatches), icon: <Icons.Link /> },
            { label: "활성 채팅", value: String(statChats), icon: <Icons.Chat /> },
            { label: "받은 호감", value: String(statLikes), icon: <Icons.Heart /> },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: "16px 12px", textAlign: "center" }}
            >
              <div style={{ display: "flex", justifyContent: "center", color: "var(--primary-400)", marginBottom: "8px" }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Matching Area */}
        {!isMatching && !showMatch && !matchAccepted && (
          <div
            className="glass-card"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <div
              style={{
                color: "var(--purple-400)",
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <Icons.Compass />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
              새로운 인연을 만나볼까요?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "28px",
              }}
            >
              당신의 선호도에 맞는 캠퍼스 인연을 찾아드릴게요
            </p>
            <button
              className="btn-primary"
              onClick={handleStartMatching}
              style={{ width: "100%", maxWidth: "280px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Icons.Sparkles />
              매칭 시작하기
            </button>
          </div>
        )}

        {/* Matching In Progress */}
        {isMatching && (
          <div
            className="glass-card"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "3px solid transparent",
                borderTopColor: "var(--primary-500)",
                borderRightColor: "var(--purple-500)",
                animation: "rotate 1s linear infinite",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid transparent",
                  borderBottomColor: "var(--accent-400)",
                  borderLeftColor: "var(--primary-300)",
                  animation: "rotate 1.5s linear infinite reverse",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-400)",
                }}
              >
                <div style={{ animation: "heartbeat 1s ease-in-out infinite" }}>
                  <Icons.HeartFilled />
                </div>
              </div>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
              인연을 찾고 있어요...
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              당신에게 딱 맞는 상대를 찾는 중 ✨
            </p>
            {matchingCountdown !== null && (
              <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                남은 대기 시간: {matchingCountdown}s
              </div>
            )}
          </div>
        )}

        {/* Match Found - Real Data Integration */}
        {showMatch && !matchAccepted && currentMatch && (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: "16px",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--primary-400)",
                }}
              >
                매칭 진행 ({currentIndex + 1} / {candidates.length})
              </span>
            </div>
            <MatchCard 
              match={currentMatch} 
              onAccept={handleAccept} 
              onReject={handleReject} 
            />
          </div>
        )}

        {/* Match Accepted */}
        {matchAccepted && (
          <div
            className="glass-card"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              animation: "fadeIn 0.4s ease-out",
            }}
          >
            <div style={{ color: "var(--primary-400)", display: "flex", justifyContent: "center", marginBottom: "24px", animation: "heartbeat 1s ease-in-out infinite" }}>
              <Icons.Party />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
              매칭이 성사되었어요!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              채팅방으로 이동합니다...
            </p>
          </div>
        )}

        {/* Quick Access */}
        <div style={{ marginTop: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
            빠른 접근
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link
              href="/ssum"
              className="glass-card"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(168,85,247,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--purple-400)",
                }}
              >
                <Icons.Sparkles />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>AI 썸 측정기</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  카톡 대화도 분석할 수 있어요
                </div>
              </div>
              <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </main>
  );
}
