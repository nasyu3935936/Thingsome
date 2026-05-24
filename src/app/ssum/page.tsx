"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { GaugeChart, RadarChart, analyzeText, AnalysisResult, STAGES } from "@/components/SsumCharts";
import { Icons } from "@/components/Icons";

/* ========== Main Page ========== */
export default function SsumPage() {
  const [mode, setMode] = useState<"select" | "paste" | "upload" | "analyzing" | "result">("select");
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [animated, setAnimated] = useState(false);

  const handleAnalyze = useCallback((text: string) => {
    if (!text.trim()) return;
    setMode("analyzing");
    setTimeout(() => {
      const res = analyzeText(text);
      setResult(res);
      setMode("result");
      setTimeout(() => setAnimated(true), 300);
    }, 2500);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setTextInput(text);
      handleAnalyze(text);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setMode("select");
    setTextInput("");
    setResult(null);
    setAnimated(false);
  };

  return (
    <main style={{ minHeight: "100vh", padding: "24px 20px 40px", maxWidth: "500px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <Link href="/home" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "24px", display: "flex", alignItems: "center" }}><Icons.ArrowLeft /></Link>
        <h1 style={{ fontSize: "22px", fontWeight: 800 }}>
          <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.Sparkles /> AI 썸 측정기
          </span>
        </h1>
      </div>

      {/* Mode: Select Input */}
      {mode === "select" && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "28px", lineHeight: 1.6 }}>
            대화 내용을 분석해서 <strong style={{ color: "var(--primary-400)" }}>두 사람의 썸 지수</strong>를 측정해 드려요.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { id: "paste", icon: <Icons.Clipboard />, title: "대화 붙여넣기", desc: "카톡 등 대화를 복사해서 붙여넣기" },
              { id: "upload", icon: <Icons.Folder />, title: "파일 업로드", desc: "카톡 내보내기 .txt 파일 업로드" },
              { id: "demo", icon: <Icons.Sparkles />, title: "데모 체험하기", desc: "샘플 대화로 기능을 체험해 보세요" },
            ].map((opt) => (
              <button key={opt.id} className="glass-card"
                onClick={() => {
                  if (opt.id === "demo") {
                    handleAnalyze("데모 대화: 안녕 ㅎㅎ 뭐해? 밥먹었어? 나 지금 카페에 있는데 혹시 시간 돼? 어 나도 마침 할거 없었는데! 좋아 어디로 갈까? ㅎㅎ 좋다 기대된다~");
                  } else {
                    setMode(opt.id as "paste" | "upload");
                  }
                }}
                style={{
                  padding: "20px", display: "flex", gap: "16px", alignItems: "center",
                  cursor: "pointer", textAlign: "left", width: "100%", border: "1px solid var(--border-subtle)",
                  background: "var(--bg-glass)", fontFamily: "inherit", color: "inherit",
                }}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "var(--radius-md)",
                  background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "24px", flexShrink: 0,
                  color: "var(--purple-400)"
                }}>{opt.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "2px" }}>{opt.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{opt.desc}</div>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>→</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: "24px", padding: "16px", background: "rgba(59,130,246,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <p style={{ fontSize: "13px", color: "var(--info)", lineHeight: 1.5, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "flex" }}><Icons.Shield /></span> 대화 내용은 분석 후 즉시 폐기되며, 서버에 저장되지 않습니다.
            </p>
          </div>
        </div>
      )}

      {/* Mode: Paste */}
      {mode === "paste" && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <button onClick={() => setMode("select")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px", marginBottom: "16px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.ArrowLeft /> 입력 방식 선택
          </button>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>대화 붙여넣기</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            카카오톡이나 메신저 대화를 복사해서 붙여넣어 주세요
          </p>
          <textarea className="input-field" placeholder={"[카카오톡 대화 예시]\n홍길동 : 안녕 ㅎㅎ\n김영희 : 안녕! 뭐해?\n홍길동 : 밥 먹었어? 🍚\n..."} value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={12} style={{ resize: "vertical", marginBottom: "16px", minHeight: "200px" }} />
          <button className="btn-primary" disabled={!textInput.trim()} onClick={() => handleAnalyze(textInput)} style={{ width: "100%", opacity: textInput.trim() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Icons.Sparkles /> 썸 분석하기
          </button>
        </div>
      )}

      {/* Mode: Upload */}
      {mode === "upload" && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <button onClick={() => setMode("select")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "14px", marginBottom: "16px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.ArrowLeft /> 입력 방식 선택
          </button>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>파일 업로드</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            카카오톡 채팅방에서 내보내기한 .txt 파일을 업로드하세요
          </p>
          <label className="glass-card" style={{
            display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px",
            cursor: "pointer", border: "2px dashed var(--border-medium)", textAlign: "center",
          }}>
            <div style={{ color: "var(--primary-400)", marginBottom: "12px" }}><Icons.Upload /></div>
            <span style={{ fontWeight: 600, marginBottom: "4px" }}>파일을 선택하세요</span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>.txt 파일만 지원</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      )}

      {/* Mode: Analyzing */}
      {mode === "analyzing" && (
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
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>대화를 분석하고 있어요...</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>AI가 5가지 지표를 분석 중 <Icons.Sparkles /></p>
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

      {/* Mode: Result */}
      {mode === "result" && result && (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          {/* Score */}
          <div className="glass-card" style={{ padding: "32px 24px", textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px" }}>종합 썸 지수</h2>
            <GaugeChart score={result.totalScore} animated={animated} />
            <div style={{
              marginTop: "16px", display: "inline-block", padding: "8px 20px",
              background: "var(--gradient-primary)", borderRadius: "var(--radius-full)",
              fontWeight: 700, fontSize: "16px",
            }}>
              {result.stage}
            </div>
          </div>

          {/* Stage Progress */}
          <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px" }}>단계 판정</h3>
            <div style={{ display: "flex", gap: "4px" }}>
              {STAGES.map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: "6px", borderRadius: "3px",
                  background: i <= result.stageIndex ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)",
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
            <RadarChart metrics={result.metrics} animated={animated} />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              {[
                { label: "답장 속도", value: result.metrics.replySpeed, icon: <Icons.Lightning /> },
                { label: "대화 주도성", value: result.metrics.initiative, icon: <Icons.Target /> },
                { label: "감정 표현", value: result.metrics.emotion, icon: <Icons.HeartFilled /> },
                { label: "문장 길이", value: result.metrics.messageLength, icon: <Icons.Clipboard /> },
                { label: "호칭/키워드", value: result.metrics.keywords, icon: <Icons.Tag /> },
              ].map((m) => (
                <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ display: "flex", width: "24px", color: "var(--primary-400)" }}>{m.icon}</span>
                  <span style={{ fontSize: "13px", width: "80px", color: "var(--text-secondary)" }}>{m.label}</span>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: animated ? `${m.value}%` : "0%",
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
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--text-primary)" }}>{result.comment}</p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-secondary" onClick={handleReset} style={{ flex: 1 }}>다시 측정하기</button>
            <button className="btn-primary" onClick={() => alert("공유 기능은 준비 중입니다!")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Icons.Upload /> 결과 공유</button>
          </div>
        </div>
      )}
    </main>
  );
}
