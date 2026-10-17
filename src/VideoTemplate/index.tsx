import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface VideoTemplateProps {
  title: string;
  points: string[];
  cta: string;
  audioUrl: string;
  backgroundIndex: number;
  hashtags: string;
}

// ─── CẢNH 1: THE HOOK (0s - 6s / Frame 0 - 180) ──────────────────────────────
const HookScene: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hiệu ứng giật nảy mạnh mẽ lúc mở đầu để giữ chân người xem 3s đầu
  const scale = spring({ frame, fps, config: { damping: 9, mass: 0.6 } });
  const rotate = interpolate(frame, [0, 40], [-5, 0], {
    extrapolateRight: "clamp",
  });
  const glow = interpolate(frame, [0, 90, 180], [0.3, 0.7, 0.3]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px",
        background: "radial-gradient(circle at center, #1E1B4B 0%, #0F172A 100%)",
      }}
    >
      {/* Vòng sáng năng lượng phía sau */}
      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
          opacity: glow,
          filter: "blur(80px)",
        }}
      />

      {/* Badge Tag */}
      <div
        style={{
          position: "absolute",
          top: "140px",
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "16px 36px",
          borderRadius: "40px",
          fontSize: "32px",
          fontWeight: 900,
          letterSpacing: "2px",
          boxShadow: "0 10px 30px rgba(239, 68, 68, 0.5)",
          transform: `scale(${scale})`,
        }}
      >
        ⚠️ CẢNH BÁO DOANH NGHIỆP
      </div>

      {/* Tiêu đề giật tít Hook */}
      <div
        style={{
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          textAlign: "center",
          maxWidth: "950px",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "82px",
            fontWeight: 900,
            lineHeight: "1.2",
            color: "#FFFFFF",
            textTransform: "uppercase",
            textShadow:
              "0 20px 40px rgba(0,0,0,0.8), 0 0 40px rgba(99, 102, 241, 0.6)",
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "160px",
          fontSize: "32px",
          color: "rgba(255,255,255,0.6)",
          fontWeight: 700,
        }}
      >
        NEXO STUDIO • GIẢI PHÁP SỐ
      </div>
    </AbsoluteFill>
  );
};

// ─── CẢNH 2: VẤN ĐỀ & THỰC TRẠNG (6s - 13s / Frame 180 - 390) ────────────────
const ProblemScene: React.FC<{ problemText: string }> = ({ problemText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideY = spring({ frame, fps, config: { damping: 12 } });
  const pulse = Math.sin(frame * 0.1) * 10;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px",
        background: "radial-gradient(circle at center, #311010 0%, #0B0F19 100%)",
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - slideY) * 100}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
          textAlign: "center",
        }}
      >
        {/* Icon cảnh báo rung */}
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "3px solid #EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
            transform: `translateY(${pulse}px)`,
            boxShadow: "0 0 50px rgba(239, 68, 68, 0.4)",
          }}
        >
          ❌
        </div>

        <span
          style={{
            color: "#F87171",
            fontSize: "34px",
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Thực Trạng Hiện Nay
        </span>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "36px",
            padding: "50px 40px",
            maxWidth: "920px",
          }}
        >
          <p
            style={{
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: "1.3",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            {problemText}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── CẢNH 3: GIẢI PHÁP TỪ PHẦN MỀM & WEBSITE (13s - 22s / Frame 390 - 660) ─────
const SolutionScene: React.FC<{ points: string[] }> = ({ points }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        padding: "120px 70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "radial-gradient(circle at top right, #064E3B 0%, #022C22 50%, #0B0F19 100%)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div
          style={{
            display: "inline-block",
            background: "#10B981",
            color: "#022C22",
            padding: "14px 34px",
            borderRadius: "30px",
            fontSize: "30px",
            fontWeight: 900,
            marginBottom: "20px",
          }}
        >
          💡 GIẢI PHÁP ĐỘT PHÁ
        </div>
        <h2
          style={{
            fontSize: "56px",
            fontWeight: 900,
            color: "#FFFFFF",
            margin: 0,
          }}
        >
          Ứng Dụng Công Nghệ Thực Chiến
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "34px" }}>
        {points.map((pt, i) => {
          const delay = i * 40;
          const pop = spring({ frame: frame - delay, fps, config: { damping: 11 } });

          return (
            <div
              key={i}
              style={{
                transform: `scale(${Math.max(0, pop)})`,
                opacity: pop,
                display: "flex",
                alignItems: "center",
                gap: "30px",
                background: "rgba(6, 78, 59, 0.4)",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "28px",
                padding: "36px 40px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: 900,
                  color: "#064E3B",
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <p
                style={{
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  margin: 0,
                  lineHeight: "1.3",
                }}
              >
                {pt}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── CẢNH 4: CALL TO ACTION (22s - 30s / Frame 660 - 900) ───────────────────
const CTAScene: React.FC<{ cta: string; hashtags: string }> = ({
  cta,
  hashtags,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = spring({ frame, fps, config: { damping: 10 } });
  const pulse = Math.sin(frame * 0.15) * 8;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "80px",
        background: "radial-gradient(circle at center, #1E3A8A 0%, #0F172A 100%)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${Math.max(0, zoom)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px",
        }}
      >
        <div
          style={{
            fontSize: "90px",
            transform: `translateY(${pulse}px)`,
          }}
        >
          🚀
        </div>

        <h2
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: "1.25",
            maxWidth: "900px",
          }}
        >
          Bắt Đầu Chuyển Đổi Số Cùng Nexo Studio
        </h2>

        {/* Nút bấm CTA nổi bật */}
        <div
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#FFFFFF",
            padding: "36px 60px",
            borderRadius: "50px",
            fontSize: "44px",
            fontWeight: 900,
            boxShadow:
              "0 20px 50px rgba(245, 158, 11, 0.5), 0 0 30px rgba(245, 158, 11, 0.4)",
            border: "2px solid #FDE68A",
            transform: `scale(${1 + Math.sin(frame * 0.1) * 0.03})`,
          }}
        >
          {cta}
        </div>

        <div style={{ marginTop: "30px" }}>
          <p
            style={{
              fontSize: "30px",
              color: "#93C5FD",
              fontWeight: 700,
              margin: 0,
            }}
          >
            🌐 Thiết Kế Website • 📱 Phần Mềm Theo Yêu Cầu
          </p>
          <p
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "20px",
            }}
          >
            {hashtags}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── TỔNG HỢP MULTI-SCENE BẰNG REMOTION SEQUENCE ─────────────────────────────
export const VideoTemplate: React.FC<VideoTemplateProps> = ({
  title,
  points,
  cta,
  audioUrl,
  hashtags,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* Voice Audio chạy xuyên suốt toàn bộ video */}
      {audioUrl ? (
        <Audio
          src={
            audioUrl.startsWith("http://") || audioUrl.startsWith("https://")
              ? audioUrl
              : staticFile("voice.mp3")
          }
        />
      ) : null}

      {/* 🎬 CẢNH 1: THE HOOK (0s - 6s / Frame 0 -> 180) */}
      <Sequence from={0} durationInFrames={180}>
        <HookScene title={title} />
      </Sequence>

      {/* 🎬 CẢNH 2: VẤN ĐỀ THỰC TRẠNG (6s - 13s / Frame 180 -> 390) */}
      <Sequence from={180} durationInFrames={210}>
        <ProblemScene problemText={points[0] || "Doanh nghiệp lãng phí chi phí nhưng hiệu quả chưa cao"} />
      </Sequence>

      {/* 🎬 CẢNH 3: GIẢI PHÁP CÔNG NGHỆ (13s - 22s / Frame 390 -> 660) */}
      <Sequence from={390} durationInFrames={270}>
        <SolutionScene points={points.slice(1)} />
      </Sequence>

      {/* 🎬 CẢNH 4: KÊU GỌI HÀNH ĐỘNG CTA (22s - 30s / Frame 660 -> 900) */}
      <Sequence from={660} durationInFrames={240}>
        <CTAScene cta={cta} hashtags={hashtags} />
      </Sequence>

      {/* Thanh tiến trình thời gian ở cạnh đáy */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "14px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6)",
          zIndex: 999,
          boxShadow: "0 0 25px rgba(59, 130, 246, 0.8)",
        }}
      />
    </AbsoluteFill>
  );
};
