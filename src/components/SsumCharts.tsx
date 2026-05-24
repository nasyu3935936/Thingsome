import React from "react";

export interface AnalysisResult {
  totalScore: number;
  stage: string;
  stageIndex: number;
  metrics: {
    replySpeed: number;
    initiative: number;
    emotion: number;
    messageLength: number;
    keywords: number;
  };
  comment: string;
}

export const STAGES = ["초면", "친구", "썸 초기", "썸 무르익음", "사귀어도 될 것 같음"];

export function GaugeChart({ score, animated }: { score: number; animated: boolean }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: "220px", height: "220px", margin: "0 auto" }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle
          cx="110" cy="110" r={radius} fill="none"
          stroke="url(#gaugeGradient)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          transform="rotate(-90 110 110)"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)", filter: "drop-shadow(0 0 8px rgba(236,72,153,0.4))" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: "48px", fontWeight: 800,
          background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {animated ? score : 0}
        </span>
        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/ 100</span>
      </div>
    </div>
  );
}

export function RadarChart({ metrics, animated }: { metrics: AnalysisResult["metrics"]; animated: boolean }) {
  const labels = ["답장 속도", "대화 주도성", "감정 표현", "문장 길이", "호칭/키워드"];
  const values = [metrics.replySpeed, metrics.initiative, metrics.emotion, metrics.messageLength, metrics.keywords];
  const cx = 150, cy = 150, maxR = 100;
  const angleStep = (2 * Math.PI) / 5;

  const getPoint = (i: number, val: number) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div style={{ width: "100%", maxWidth: "320px", margin: "0 auto" }}>
      <svg viewBox="0 0 300 300" width="100%" height="auto">
        {gridLevels.map((level) => {
          const pts = Array.from({ length: 5 }, (_, i) => getPoint(i, level));
          return (
            <polygon key={level}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 5 }, (_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" />;
        })}
        <polygon
          points={values.map((v, i) => { const p = getPoint(i, animated ? v : 0); return `${p.x},${p.y}`; }).join(" ")}
          fill="rgba(236,72,153,0.15)" stroke="var(--primary-400)" strokeWidth="2"
          style={{ transition: "all 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {values.map((v, i) => {
          const p = getPoint(i, animated ? v : 0);
          return <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary-400)" style={{ transition: "all 1s ease" }} />;
        })}
        {labels.map((label, i) => {
          const p = getPoint(i, 125);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fill="var(--text-secondary)" fontSize="11" fontWeight="500"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function analyzeText(_text: string): AnalysisResult {
  // 실제 AI API 연동 전까지는 난수 기반 더미 로직 사용
  const r = () => Math.floor(Math.random() * 40) + 50;
  const metrics = { replySpeed: r(), initiative: r(), emotion: r(), messageLength: r(), keywords: r() };
  const totalScore = Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 5);
  const stageIndex = totalScore < 25 ? 0 : totalScore < 45 ? 1 : totalScore < 60 ? 2 : totalScore < 80 ? 3 : 4;
  const comments = [
    "아직 서로를 알아가는 단계예요. 자연스럽게 대화를 이어가 보세요!",
    "친구 사이에 가까운 관계예요. 조금 더 적극적으로 다가가 볼까요?",
    "썸의 기운이 느껴져요! 상대방도 관심이 있는 것 같아요 🌸",
    "썸이 무르익고 있어요! 서로에 대한 관심이 확실해 보여요 💕",
    "이 정도면 사귀어도 될 것 같아요! 용기를 내보세요 🎉",
  ];
  return { totalScore, stage: STAGES[stageIndex], stageIndex, metrics, comment: comments[stageIndex] };
}
