import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KaraokeSubtitles, SubtitleWord } from "./KaraokeSubtitles";

export interface DynamicScene {
  id: string;
  stepLabel?: string;
  durationInSeconds?: number;
  headline?: string;
  bodyText?: string;
  icon?: string;
  visualType?: string;
  voiceover?: string;
}

export interface VideoTemplateProps {
  audioUrl?: string;
  subtitles?: SubtitleWord[];
  scenes?: DynamicScene[];
  metadata?: {
    topic?: string;
    category?: string;
    sourceName?: string;
  };
  hookScene?: {
    title?: string;
    badge?: string;
  };
  ctaScene?: {
    mainCta?: string;
    offerSubtext?: string;
  };
  durationInFrames?: number;
}

export const VideoTemplate: React.FC<VideoTemplateProps> = ({
  audioUrl,
  subtitles = [],
  scenes = [],
  metadata,
  hookScene,
  ctaScene,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = (frame / durationInFrames) * 100;

  // Cấu hình các cảnh hiển thị linh động theo AI
  const displayScenes: DynamicScene[] =
    scenes.length > 0
      ? scenes
      : [
          {
            id: "s1",
            stepLabel: "HOOK",
            headline: hookScene?.title || "Giải Pháp Số Hóa Nexo Studio",
            visualType: "HOOK",
            icon: "🔥",
            bodyText: metadata?.topic || "Tự động hóa vận hành cho doanh nghiệp",
          },
          {
            id: "s2",
            stepLabel: "SOLUTION",
            headline: "Hệ Thống Quản Trị Tự Động",
            visualType: "UI_MOCKUP",
            icon: "💻",
            bodyText: "Đồng bộ website, đơn hàng và khách hàng trên một nền tảng",
          },
          {
            id: "s3",
            stepLabel: "CTA",
            headline: ctaScene?.mainCta || "Nhắn tin cho Nexo Studio",
            visualType: "BRAND_OUTRO",
            icon: "🚀",
            bodyText: ctaScene?.offerSubtext || "Thiết Kế Website Chuẩn UX/UI • Phần Mềm Tự Động Hóa",
          },
        ];

  let currentFrameAccumulator = 0;
  const sceneItems = displayScenes.map((scene) => {
    const rawFrames = scene.durationInSeconds
      ? Math.round(scene.durationInSeconds * fps)
      : Math.floor(durationInFrames / displayScenes.length);
    const from = currentFrameAccumulator;
    currentFrameAccumulator += rawFrames;
    return {
      ...scene,
      from,
      durationInFrames: rawFrames,
    };
  });

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
      {/* Background Ambient Glows */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "5%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          right: "5%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)",
          filter: "blur(90px)",
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

      {/* Top Header Nhận Diện Thương Hiệu Nexo Studio */}
      <div
        style={{
          position: "absolute",
          top: "70px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "4px",
            color: "rgba(255, 255, 255, 0.5)",
            textTransform: "uppercase",
          }}
        >
          Nexo Studio • Chuyển Đổi Số & Tự Động Hóa
        </span>
      </div>

      {/* CÁC SCENE NỘI DUNG HIỂN THỊ ĐỘNG 100% THEO KỊCH BẢN AI */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 48px 340px 48px", // Chừa khoảng trống 340px cho Karaoke Subtitles
          zIndex: 20,
        }}
      >
        {sceneItems.map((scene) => (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
          >
            <DynamicSceneContent scene={scene} />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* KHU VỰC PHỤ ĐỀ KARAOKE: CHẠY TỪNG TỪ MÀU VÀNG SÁNG RỰC RỠ */}
      <div
        style={{
          position: "absolute",
          bottom: "120px",
          left: "50px",
          right: "50px",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <KaraokeSubtitles subtitles={subtitles} />
      </div>

      {/* Thanh tiến trình thời gian chạy ở đáy */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "12px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6)",
          zIndex: 999,
          boxShadow: "0 0 25px rgba(59, 130, 246, 0.8)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Component Render Visual Staggered Animation Từng Phần Xuất Hiện Tuần Tự ───
const DynamicSceneContent: React.FC<{ scene: DynamicScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = scene.durationInSeconds ? Math.round(scene.durationInSeconds * fps) : 180;

  // Hiệu ứng mờ dần khi chuyển sang cảnh tiếp theo (8 frames cuối)
  const exitOpacity = interpolate(
    frame,
    [duration - 8, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitScale = interpolate(
    frame,
    [duration - 8, duration],
    [1, 0.95],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 1. Phút 0-12: Badge chủ đề xuất hiện đầu tiên (từ trên rơi xuống)
  const badgeSpring = spring({ frame, fps, config: { damping: 11, mass: 0.7 } });
  const badgeY = interpolate(badgeSpring, [0, 1], [-45, 0]);
  const badgeOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // 2. Phút 10-24: Tiêu đề Headline xuất hiện thứ hai (từ dưới trượt lên)
  const headlineSpring = spring({ frame: frame - 9, fps, config: { damping: 12, mass: 0.8 } });
  const headlineY = interpolate(headlineSpring, [0, 1], [40, 0]);
  const headlineOpacity = interpolate(frame, [9, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 3. Phút 20+: Visual đồ họa mô phỏng xuất hiện thứ ba
  const visualSpring = spring({ frame: frame - 18, fps, config: { damping: 12, mass: 0.9 } });
  const visualScale = interpolate(visualSpring, [0, 1], [0.85, 1]);
  const visualOpacity = interpolate(frame, [18, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isMockup = scene.visualType?.includes("MOCKUP");
  const isWorkflow = scene.visualType?.includes("WORKFLOW");
  const isChart = scene.visualType?.includes("CHART");
  const isBeforeAfter = scene.visualType?.includes("BEFORE");
  const isCTA = scene.visualType?.includes("CTA") || scene.visualType?.includes("OUTRO");

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* 1. BADGE CHỦ ĐỀ (Xuất hiện trước nhất) */}
      <div
        style={{
          transform: `translateY(${badgeY}px) scale(${Math.max(0.01, badgeSpring)})`,
          opacity: badgeOpacity,
          background: isCTA
            ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            : isBeforeAfter
            ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
            : "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
          color: "#FFFFFF",
          padding: "10px 32px",
          borderRadius: "30px",
          fontSize: "24px",
          fontWeight: 900,
          letterSpacing: "2px",
          textTransform: "uppercase",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          marginBottom: "28px",
        }}
      >
        {scene.icon || "💡"} {scene.stepLabel || "NEXO STUDIO"}
      </div>

      {/* 2. HEADLINE TIÊU ĐỀ (Xuất hiện ngay sau Badge) */}
      <h1
        style={{
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
          fontSize: "58px",
          fontWeight: 900,
          color: "#FFFFFF",
          lineHeight: "1.25",
          margin: "0 0 32px 0",
          maxWidth: "920px",
          textShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        {scene.headline}
      </h1>

      {/* 3. VISUAL ĐỒ HỌA MÔ PHỎNG (Xuất hiện theo tuần tự) */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          transform: `scale(${Math.max(0.01, visualScale)})`,
          opacity: visualOpacity,
        }}
      >
        {/* MÔ PHỎNG GIAO DIỆN (UI MOCKUP) */}
        {isMockup && (
          <div
            style={{
              width: "90%",
              maxWidth: "880px",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "28px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 35px rgba(59, 130, 246, 0.2)",
              overflow: "hidden",
              padding: "24px 32px",
              textAlign: "left",
            }}
          >
            {/* macOS window header */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#10B981" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#60A5FA" }}>⚡ Nexo Studio Dashboard</span>
              <span style={{ fontSize: "22px", background: "#064E3B", color: "#34D399", padding: "6px 16px", borderRadius: "12px", fontWeight: 700 }}>● Live Auto</span>
            </div>
            <p style={{ fontSize: "30px", color: "rgba(255,255,255,0.9)", lineHeight: "1.4", margin: 0 }}>
              {scene.bodyText}
            </p>
          </div>
        )}

        {/* MÔ PHỎNG QUY TRÌNH TỰ ĐỘNG HÓA (WORKFLOW) - TỪNG BƯỚC NỐI TIẾP HIỆN RA */}
        {isWorkflow && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "85%", maxWidth: "800px" }}>
            {[
              { label: "1. Khách Gửi Yêu Cầu / Đơn Hàng", status: "Auto Trigger", color: "#3B82F6", delay: 24 },
              { label: "2. Hệ Thống Xử Lý & Đồng Bộ CRM", status: "Processing", color: "#8B5CF6", delay: 38 },
              { label: "3. Tự Động Phân Phối & Báo Cáo", status: "Hoàn Tất", color: "#10B981", delay: 52 },
            ].map((node, i) => {
              const nodeSpring = spring({ frame: frame - node.delay, fps, config: { damping: 11 } });
              const nodeOpacity = interpolate(frame, [node.delay, node.delay + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const nodeY = interpolate(nodeSpring, [0, 1], [30, 0]);

              return (
                <div
                  key={i}
                  style={{
                    transform: `translateY(${nodeY}px) scale(${Math.max(0.01, nodeSpring)})`,
                    opacity: nodeOpacity,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(30, 41, 59, 0.8)",
                    border: `2px solid ${node.color}66`,
                    borderRadius: "20px",
                    padding: "22px 30px",
                    boxShadow: `0 8px 24px ${node.color}22`,
                  }}
                >
                  <span style={{ fontSize: "30px", fontWeight: 700, color: "#FFFFFF" }}>{node.label}</span>
                  <span style={{ fontSize: "22px", color: node.color, fontWeight: 800 }}>✓ {node.status}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* SO SÁNH TRƯỚC VÀ SAU (BEFORE / AFTER) - BÊN TRÁI XUẤT HIỆN TRƯỚC, BÊN PHẢI SAU */}
        {isBeforeAfter && (
          <div style={{ display: "flex", gap: "20px", width: "90%", maxWidth: "880px" }}>
            {/* Cột Trước: xuất hiện ở frame 22 */}
            <div
              style={{
                flex: 1,
                transform: `translateX(${interpolate(
                  spring({ frame: frame - 22, fps, config: { damping: 11 } }),
                  [0, 1],
                  [-40, 0]
                )}px)`,
                opacity: interpolate(frame, [22, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                background: "rgba(239, 68, 68, 0.15)",
                border: "2px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "24px",
                padding: "28px",
              }}
            >
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#EF4444", marginBottom: "12px" }}>❌ TRƯỚC ĐÂY</div>
              <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: "1.35" }}>
                Nhiều bảng tính rời rạc, sót đơn, thao tác thủ công tốn thời gian.
              </p>
            </div>

            {/* Cột Sau: xuất hiện ở frame 38 với viền sáng xanh */}
            <div
              style={{
                flex: 1,
                transform: `translateX(${interpolate(
                  spring({ frame: frame - 38, fps, config: { damping: 11 } }),
                  [0, 1],
                  [40, 0]
                )}px)`,
                opacity: interpolate(frame, [38, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid rgba(16, 185, 129, 0.5)",
                borderRadius: "24px",
                padding: "28px",
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.25)",
              }}
            >
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#10B981", marginBottom: "12px" }}>✅ VỚI PHẦN MỀM</div>
              <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: "1.35" }}>
                1 giao diện duy nhất, tự động hóa quy trình, chính xác 100%.
              </p>
            </div>
          </div>
        )}

        {/* BIỂU ĐỒ & SỐ LIỆU ĐỘT PHÁ (DATA CHART) */}
        {isChart && (
          <div
            style={{
              width: "88%",
              maxWidth: "850px",
              background: "rgba(30, 41, 59, 0.8)",
              border: "2px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "28px",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
              <div
                style={{
                  transform: `scale(${Math.max(
                    0.01,
                    spring({ frame: frame - 26, fps, config: { damping: 10 } })
                  )})`,
                  opacity: interpolate(frame, [26, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <div style={{ fontSize: "56px", fontWeight: 900, color: "#10B981" }}>-80%</div>
                <div style={{ fontSize: "24px", color: "#94A3B8" }}>Thời gian thao tác</div>
              </div>
              <div
                style={{
                  transform: `scale(${Math.max(
                    0.01,
                    spring({ frame: frame - 40, fps, config: { damping: 10 } })
                  )})`,
                  opacity: interpolate(frame, [40, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                <div style={{ fontSize: "56px", fontWeight: 900, color: "#3B82F6" }}>x3</div>
                <div style={{ fontSize: "24px", color: "#94A3B8" }}>Hiệu suất xử lý</div>
              </div>
            </div>
            <p
              style={{
                fontSize: "28px",
                color: "rgba(255,255,255,0.85)",
                margin: 0,
                opacity: interpolate(frame, [48, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              {scene.bodyText}
            </p>
          </div>
        )}

        {/* CALL TO ACTION (CTA NỔI BẬT NHẤP NHÁY) */}
        {isCTA && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#FFFFFF",
                padding: "28px 56px",
                borderRadius: "50px",
                fontSize: "40px",
                fontWeight: 900,
                boxShadow: "0 20px 45px rgba(245, 158, 11, 0.5)",
                border: "2px solid #FDE68A",
                transform: `scale(${1 + Math.sin(frame * 0.12) * 0.03})`,
              }}
            >
              {scene.headline || "Nhắn Tin Cho Nexo Studio"}
            </div>
            <p
              style={{
                fontSize: "28px",
                color: "#93C5FD",
                fontWeight: 700,
                margin: 0,
                opacity: interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              Thiết Kế Website • Phần Mềm Quản Trị • Tự Động Hóa Doanh Nghiệp
            </p>
          </div>
        )}

        {/* MẶC ĐỊNH CHO CÁC TIN TỨC HOẶC MÔ TẢ KHÁC */}
        {!isMockup && !isWorkflow && !isBeforeAfter && !isChart && !isCTA && (
          <div
            style={{
              maxWidth: "850px",
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "24px",
              padding: "28px 36px",
            }}
          >
            <p style={{ fontSize: "32px", color: "rgba(255,255,255,0.9)", lineHeight: "1.4", margin: 0 }}>
              {scene.bodyText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
