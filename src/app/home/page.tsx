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
  return (
    <nav className="nav-bottom">
      <div className="nav-bottom-inner">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}>
            <span style={{ marginBottom: "4px" }}>{item.icon}</span>
            <span style={{ fontSize: "10px" }}>{item.label}</span>
          </Link>
        ))}
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
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<any>({ nickname: "나" });

  const fallbackDemos = [
    {
      id: "demo1",
      nickname: "커피좋아요",
      department: "ICT융합대학",
      year: 2024,
      age: 22,
      bio: "카페 탐방이 취미인 개발자 지망생 ☕",
      interests: ["카페", "코딩", "음악", "영화", "맛집"],
      gender: "여성",
    },
    {
      id: "demo2",
      nickname: "운동매니아",
      department: "예술체육대학",
      year: 2022,
      age: 25,
      bio: "매일 헬스장 가는 체대생 💪",
      interests: ["운동", "헬스", "러닝", "맛집", "여행"],
      gender: "남성",
    },
    {
      id: "demo3",
      nickname: "스윗한선배",
      department: "경영대학",
      year: 2021,
      age: 26,
      bio: "같이 캠퍼스 산책하실 분~ 🌸",
      interests: ["산책", "사진", "여행", "음악"],
      gender: "남성",
    }
  ];

  useEffect(() => {
    // 1. 내 정보 불러오기 (우상단 아이콘용)
    const saved = localStorage.getItem("thingsome_temp_profile");
    if (saved) {
      try { setMyProfile(JSON.parse(saved)); } catch (e) {}
    }

    const fetchProfiles = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('profiles').select('*').limit(10);
        
        if (!error && data && data.length > 0) {
          const formatted = data.map((p) => ({
            id: p.id,
            nickname: p.nickname || "익명",
            department: p.major || "명지대학교",
            year: p.student_id ? parseInt(p.student_id) : 2024,
            age: p.age || 20,
            bio: p.bio || "반갑습니다 ✨",
            interests: p.tags || ["선택없음"],
            gender: p.gender || "여성",
          }));
          setCandidates(formatted);
        } else {
          setCandidates(fallbackDemos);
        }
      } catch (err) {
        console.error("Failed to fetch profiles", err);
        setCandidates(fallbackDemos);
      }
    };
    fetchProfiles();
  }, []);

  const currentMatch = candidates[currentIndex];

  const handleStartMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setShowMatch(true);
    }, 2000);
  };

  const handleAccept = async () => {
    setMatchAccepted(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && currentMatch && currentMatch.id && !currentMatch.id.toString().startsWith("demo")) {
        const { data: room, error } = await supabase.from('chat_rooms').insert({
          user1_id: user.id,
          user2_id: currentMatch.id,
        }).select().single();
        
        if (!error && room) {
          setTimeout(() => {
            window.location.href = `/chat?roomId=${room.id}&nickname=${currentMatch.nickname}`;
          }, 1500);
          return;
        } else {
          console.error("채팅방 생성 에러:", error);
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
      alert("오늘은 더 이상 추천할 새로운 상대가 없습니다 🥲\n내일 다시 찾아주세요!");
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
            { label: "오늘 매칭", value: "3", icon: <Icons.Link /> },
            { label: "활성 채팅", value: "1", icon: <Icons.Chat /> },
            { label: "받은 호감", value: "2", icon: <Icons.Heart /> },
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
