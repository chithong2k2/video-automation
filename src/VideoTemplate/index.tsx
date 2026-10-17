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

  // Tính toán thời lượng frame cho từng scene một cách linh động
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

// ─── Component Render Visual cho từng Scene theo loại hình ảnh AI chỉ định ────
const DynamicSceneContent: React.FC<{ scene: DynamicScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 11, mass: 0.8 } });
  const pulse = Math.sin(frame * 0.1) * 6;

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
        transform: `scale(${Math.max(0.01, pop)})`,
        opacity: interpolate(frame, [0, 8], [0, 1]),
      }}
    >
      {/* Badge / Chủ đề */}
      <div
        style={{
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

      {/* Headline chính */}
      <h1
        style={{
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

      {/* Visual Component trực quan (SHOW, DON'T JUST TELL) */}
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

      {isWorkflow && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "85%", maxWidth: "800px" }}>
          {[
            { label: "1. Khách Gửi Yêu Cầu / Đơn Hàng", status: "Auto Trigger", color: "#3B82F6" },
            { label: "2. Hệ Thống Xử Lý & Đồng Bộ CRM", status: "Processing", color: "#8B5CF6" },
            { label: "3. Tự Động Phân Phối & Báo Cáo", status: "Completed", color: "#10B981" },
          ].map((node, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(30, 41, 59, 0.7)",
                border: `2px solid ${node.color}55`,
                borderRadius: "20px",
                padding: "22px 30px",
              }}
            >
              <span style={{ fontSize: "30px", fontWeight: 700, color: "#FFFFFF" }}>{node.label}</span>
              <span style={{ fontSize: "22px", color: node.color, fontWeight: 800 }}>✓ {node.status}</span>
            </div>
          ))}
        </div>
      )}

      {isBeforeAfter && (
        <div style={{ display: "flex", gap: "20px", width: "90%", maxWidth: "880px" }}>
          <div
            style={{
              flex: 1,
              background: "rgba(239, 68, 68, 0.15)",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#EF4444", marginBottom: "12px" }}>❌ TRƯỚC ĐÂY</div>
            <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: "1.35" }}>
              Nhiều bảng tính rời rạc, sót đơn, thủ công tốn thời gian.
            </p>
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(16, 185, 129, 0.15)",
              border: "2px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#10B981", marginBottom: "12px" }}>✅ VỚI PHẦN MỀM</div>
            <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: "1.35" }}>
              1 giao diện duy nhất, tự động hóa quy trình, chính xác 100%.
            </p>
          </div>
        </div>
      )}

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
            <div>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#10B981" }}>-80%</div>
              <div style={{ fontSize: "24px", color: "#94A3B8" }}>Thời gian thao tác</div>
            </div>
            <div>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#3B82F6" }}>x3</div>
              <div style={{ fontSize: "24px", color: "#94A3B8" }}>Hiệu suất xử lý</div>
            </div>
          </div>
          <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.85)", margin: 0 }}>
            {scene.bodyText}
          </p>
        </div>
      )}

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
              transform: `translateY(${pulse}px)`,
            }}
          >
            {scene.headline || "Nhắn Tin Cho Nexo Studio"}
          </div>
          <p style={{ fontSize: "28px", color: "#93C5FD", fontWeight: 700, margin: 0 }}>
            Thiết Kế Website • Phần Mềm Quản Trị • Tự Động Hóa Doanh Nghiệp
          </p>
        </div>
      )}

      {!isMockup && !isWorkflow && !isBeforeAfter && !isChart && !isCTA && (
        <div
          style={{
            maxWidth: "850px",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
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
  );
};
