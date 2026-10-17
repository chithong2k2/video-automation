import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Màu thương hiệu — có thể đổi theo bạn
const BRAND_COLORS = {
  primary: "#1E40AF",   // Xanh đậm
  secondary: "#3B82F6", // Xanh nhạt
  accent: "#F59E0B",    // Vàng cam
  text: "#FFFFFF",
  textDim: "rgba(255,255,255,0.8)",
};

const BACKGROUNDS = [
  "linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #065F46 0%, #1E40AF 100%)",
  "linear-gradient(135deg, #7C2D12 0%, #1E40AF 100%)",
  "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
];

interface VideoTemplateProps {
  title: string;
  points: string[];
  cta: string;
  audioUrl: string;
  backgroundIndex: number;
  hashtags: string;
}

export const VideoTemplate: React.FC<VideoTemplateProps> = ({
  title,
  points,
  cta,
  audioUrl,
  backgroundIndex,
  hashtags,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo / intro animation (0-1s)
  const logoScale = spring({ frame, fps, config: { damping: 12 } });

  // Title animation (0.5s - 2s)
  const titleOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [15, 45], [40, 0], { extrapolateRight: "clamp" });

  // Points animation — mỗi point xuất hiện lần lượt
  const pointDelays = [60, 100, 140]; // frame bắt đầu mỗi điểm

  // CTA animation (cuối video)
  const ctaOpacity = interpolate(frame, [550, 600], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 550, fps, config: { damping: 10 } });

  // Hashtag animation
  const hashtagOpacity = interpolate(frame, [700, 750], [0, 1], { extrapolateRight: "clamp" });

  const bg = BACKGROUNDS[backgroundIndex % BACKGROUNDS.length];

  return (
    <AbsoluteFill style={{ background: bg, fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* Background pattern */}
      <AbsoluteFill style={{ opacity: 0.05 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "2px solid white",
              top: `${(i * 157) % 100}%`,
              left: `${(i * 97) % 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Audio */}
      {audioUrl ? (
        <Audio
          src={
            audioUrl.startsWith("http://") || audioUrl.startsWith("https://")
              ? audioUrl
              : staticFile("voice.mp3")
          }
        />
      ) : null}

      {/* Main content */}
      <AbsoluteFill style={{ padding: "80px 60px", justifyContent: "center" }}>

        {/* Logo / Brand tag */}
        <div style={{
          transform: `scale(${logoScale})`,
          background: BRAND_COLORS.accent,
          borderRadius: 12,
          padding: "10px 24px",
          alignSelf: "flex-start",
          marginBottom: 48,
        }}>
          <span style={{ color: "#1E1B4B", fontWeight: 800, fontSize: 28 }}>
            💼 DOANH NGHIỆP
          </span>
        </div>

        {/* Title */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 60,
        }}>
          <h1 style={{
            color: BRAND_COLORS.text,
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.15,
            margin: 0,
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}>
            {title}
          </h1>
        </div>

        {/* Points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 60 }}>
          {points.map((point, i) => {
            const delay = pointDelays[i] ?? 60 + i * 40;
            const opacity = interpolate(frame, [delay, delay + 30], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(frame, [delay, delay + 30], [-60, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ opacity, transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: BRAND_COLORS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "#1E1B4B", fontWeight: 900, fontSize: 22 }}>{i + 1}</span>
                </div>
                <p style={{ color: BRAND_COLORS.text, fontSize: 42, margin: 0, fontWeight: 600, lineHeight: 1.3 }}>
                  {point}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{
          opacity: ctaOpacity,
          transform: `scale(${Math.max(ctaScale, 0)})`,
          background: BRAND_COLORS.accent,
          borderRadius: 20,
          padding: "28px 40px",
          marginBottom: 40,
        }}>
          <p style={{ color: "#1E1B4B", fontSize: 44, fontWeight: 800, margin: 0, textAlign: "center" }}>
            {cta}
          </p>
        </div>

        {/* Hashtags */}
        <p style={{
          opacity: hashtagOpacity,
          color: BRAND_COLORS.textDim,
          fontSize: 32,
          margin: 0,
          fontWeight: 500,
        }}>
          {hashtags}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
