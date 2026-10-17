import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
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

export const VideoTemplate: React.FC<VideoTemplateProps> = ({
  title,
  points,
  cta,
  audioUrl,
  backgroundIndex,
  hashtags,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Progress Bar chạy dọc theo thời lượng video
  const progress = (frame / durationInFrames) * 100;

  // Hiệu ứng Gradient nền chuyển động nhẹ nhàng
  const bgHue = (backgroundIndex * 40 + frame * 0.1) % 360;

  // Badge Agency xuất hiện với độ nảy
  const badgeSpring = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });

  // Tiêu đề chính xuất hiện
  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 12 } });

  // Điểm nảy của các ý chính
  const pointDelays = [40, 80, 120];

  // CTA xuất hiện ở 6 giây cuối
  const ctaStartFrame = durationInFrames - 150;
  const ctaSpring = spring({
    frame: frame - ctaStartFrame,
    fps,
    config: { damping: 10 },
  });

  const icons = ["⚡", "🚀", "🎯", "💡"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0F19",
        color: "#FFFFFF",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Glows */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, hsla(${bgHue}, 80%, 50%, 0.35) 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: `radial-gradient(circle, hsla(${(bgHue + 120) % 360}, 85%, 55%, 0.3) 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />

      {/* Grid Pattern công nghệ hiện đại */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Voice Audio */}
      {audioUrl ? (
        <Audio
          src={
            audioUrl.startsWith("http://") || audioUrl.startsWith("https://")
              ? audioUrl
              : staticFile("voice.mp3")
          }
        />
      ) : null}

      {/* Container Chính */}
      <AbsoluteFill
        style={{
          padding: "100px 70px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header: Logo / Tag thương hiệu */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              transform: `scale(${Math.max(0, badgeSpring)})`,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              padding: "16px 32px",
              borderRadius: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 16px #10B981",
              }}
            />
            <span
              style={{
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "1px",
                background: "linear-gradient(90deg, #FFFFFF, #93C5FD)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NEXO STUDIO • TECH INSIGHTS
            </span>
          </div>

          <span
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
            }}
          >
            #DAILY
          </span>
        </div>

        {/* Nội Dung Trung Tâm */}
        <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
          {/* Card Tiêu Đề Nổi Bật */}
          <div
            style={{
              transform: `scale(${Math.max(0, titleSpring)})`,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "32px",
              padding: "48px 44px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h1
              style={{
                fontSize: "64px",
                fontWeight: 900,
                lineHeight: "1.25",
                margin: 0,
                background: "linear-gradient(135deg, #FFFFFF 30%, #60A5FA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Danh Sách 3 Luận Điểm Giá Trị */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {points.map((point, index) => {
              const delay = pointDelays[index] ?? 40 + index * 40;
              const pointSpring = spring({
                frame: frame - delay,
                fps,
                config: { damping: 12 },
              });

              return (
                <div
                  key={index}
                  style={{
                    transform: `translateX(${(1 - pointSpring) * -60}px)`,
                    opacity: pointSpring,
                    display: "flex",
                    alignItems: "center",
                    gap: "28px",
                    background: "rgba(17, 24, 39, 0.75)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "24px",
                    padding: "32px 36px",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "34px",
                      flexShrink: 0,
                      boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    {icons[index % icons.length]}
                  </div>
                  <p
                    style={{
                      fontSize: "38px",
                      fontWeight: 700,
                      lineHeight: "1.35",
                      margin: 0,
                      color: "#E2E8F0",
                    }}
                  >
                    {point}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Kêu Gọi Hành Động (CTA) & Hashtags */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          <div
            style={{
              transform: `scale(${Math.max(0, ctaSpring)})`,
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              borderRadius: "28px",
              padding: "36px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 15px 40px rgba(37, 99, 235, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  margin: 0,
                  color: "#FFFFFF",
                }}
              >
                {cta}
              </p>
              <span
                style={{
                  fontSize: "26px",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 600,
                }}
              >
                Thiết kế Website • Phát triển Phần mềm theo yêu cầu
              </span>
            </div>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "50%",
                width: "64px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "#1D4ED8",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ➜
            </div>
          </div>

          <p
            style={{
              fontSize: "28px",
              color: "rgba(255, 255, 255, 0.4)",
              margin: 0,
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            {hashtags}
          </p>
        </div>
      </AbsoluteFill>

      {/* Progress Bar ở đáy video */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "12px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #3B82F6, #10B981)",
          boxShadow: "0 0 20px #3B82F6",
        }}
      />
    </AbsoluteFill>
  );
};
