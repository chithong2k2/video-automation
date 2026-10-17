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
import { KaraokeSubtitles, SubtitleWord } from "./KaraokeSubtitles";

// ─── INTERFACES DÀNH CHO CẢ 2 LOẠI VIDEO (TIN TỨC & BÀI HỌC B2B) ─────────────
export interface HookSceneData {
  durationInSeconds?: number;
  badge?: string;
  title: string;
  highlightWord?: string;
  voiceover?: string;
  visualType?: string;
  animationType?: string;
}

export interface ContentSceneData {
  stepLabel: string;
  durationInSeconds?: number;
  icon?: string;
  statHighlight?: string;
  headline: string;
  bodyText: string;
  highlightWord?: string;
  voiceover?: string;
  visualType?: string;
  animationType?: string;
}

export interface CtaSceneData {
  durationInSeconds?: number;
  mainCta: string;
  offerSubtext?: string;
  voiceover?: string;
  visualType?: string;
  animationType?: string;
}

export interface VideoMetadata {
  categoryTag?: string;
  topicType?: "NEWS" | "PRACTICAL_LESSON" | string;
  topic?: string;
  eventDate?: string;
  publishedAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  targetAudience?: string;
  businessGoal?: string;
  backgroundIndex?: number;
  aspectRatio?: string;
  totalDurationInSeconds?: number;
  hashtags?: string;
}

export interface VideoTemplateProps {
  metadata?: VideoMetadata;
  hookScene?: HookSceneData;
  scenes?: ContentSceneData[];
  ctaScene?: CtaSceneData;
  // Hỗ trợ tương thích ngược nếu truyền kiểu cũ
  title?: string;
  slides?: any[];
  points?: string[];
  cta?: string | any;
  audioUrl?: string;
  hashtags?: string;
  subtitles?: SubtitleWord[];
}

// ─── HÀM HIGHLIGHT TỪ KHÓA CHÍNH XÁC VỚI HIỆU ỨNG GLOW NEON ──────────────────
const renderHighlightedText = (
  text: string,
  highlight?: string,
  highlightColor = "#FACC15"
) => {
  if (!text) return null;
  if (!highlight || !text.includes(highlight)) return text;

  const parts = text.split(highlight);
  return (
    <>
      {parts[0]}
      <span
        style={{
          color: highlightColor,
          textShadow: `0 0 25px ${highlightColor}99, 0 4px 10px rgba(0,0,0,0.8)`,
          fontWeight: 900,
        }}
      >
        {highlight}
      </span>
      {parts.slice(1).join(highlight)}
    </>
  );
};

// ─── KHUNG TRÌNH DIỄN MỖI PHÂN CẢNH (CĂN GIỮA 100%, CHUYỂN CẢNH MƯỢT MÀ) ─────
const SceneWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hiệu ứng zoom nhẹ từ 0.9 lên 1.0 và trượt lên mượt mà
  const enter = spring({ frame, fps, config: { damping: 13, mass: 0.7 } });
  const scale = interpolate(enter, [0, 1], [0.9, 1]);
  const translateY = interpolate(enter, [0, 1], [35, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
};

// ─── CẢNH 1: THE HOOK SCENE (0 - 4s) ──────────────────────────────────────────
const HookScene: React.FC<{
  data: HookSceneData;
  metadata?: VideoMetadata;
}> = ({ data, metadata }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.12) * 5;

  const isNews = metadata?.topicType === "NEWS";
  const badgeBg = isNews
    ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" // Xanh dương tin tức công nghệ
    : "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)"; // Đỏ cảnh báo bài học kinh doanh
  const badgeBorder = isNews ? "#93C5FD" : "#FCA5A5";
  const badgeShadow = isNews ? "rgba(37, 99, 235, 0.5)" : "rgba(239, 68, 68, 0.5)";

  const badgeText =
    data.badge ||
    (isNews ? `📰 BẢN TIN CÔNG NGHỆ 24H` : `🔥 BÀI HỌC KINH DOANH`);

  return (
    <SceneWrapper>
      {/* Badge thu hút */}
      <div
        style={{
          background: badgeBg,
          color: "#FFFFFF",
          padding: "14px 38px",
          borderRadius: "50px",
          fontSize: "26px",
          fontWeight: 900,
          letterSpacing: "2px",
          boxShadow: `0 10px 30px ${badgeShadow}`,
          border: `2px solid ${badgeBorder}`,
          marginBottom: "32px",
          transform: `translateY(${pulse}px)`,
          textTransform: "uppercase",
        }}
      >
        {badgeText}
      </div>

      {/* Headline giật tít đánh trúng vấn đề */}
      <h1
        style={{
          fontSize: "72px",
          fontWeight: 900,
          lineHeight: "1.25",
          color: "#FFFFFF",
          margin: 0,
          textTransform: "uppercase",
          textShadow:
            "0 15px 35px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.4)",
        }}
      >
        {renderHighlightedText(data.title, data.highlightWord, "#38BDF8")}
      </h1>

      {/* Nguồn tin hoặc phụ đề */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "30px",
        }}
      >
        {metadata?.sourceName ? (
          <span
            style={{
              fontSize: "22px",
              color: "#60A5FA",
              fontWeight: 800,
              background: "rgba(37, 99, 235, 0.15)",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              padding: "6px 20px",
              borderRadius: "20px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Nguồn: {metadata.sourceName}
          </span>
        ) : (
          <span style={{ fontSize: "28px", color: "#94A3B8", fontWeight: 700 }}>
            Góc Nhìn Thực Chiến Cho Quản Trị Viên & Startup
          </span>
        )}
      </div>
    </SceneWrapper>
  );
};

// ─── CÁC CẢNH NỘI DUNG (DIỄN BIẾN -> CHI TIẾT -> TÁC ĐỘNG) ────────────────────
const ContentScene: React.FC<{
  data: ContentSceneData;
  index: number;
  total: number;
  topicType?: string;
}> = ({ data, index, total, topicType }) => {
  const isNews = topicType === "NEWS";

  // Màu sắc phù hợp theo từng bước
  const accentColor =
    index === 0 ? (isNews ? "#3B82F6" : "#EF4444") : index === 1 ? "#10B981" : "#F59E0B";
  const badgeBorder =
    index === 0 ? (isNews ? "#93C5FD" : "#FCA5A5") : index === 1 ? "#6EE7B7" : "#FDE68A";

  return (
    <SceneWrapper>
      {/* Nhãn chỉ số bước: 01 / 03 • DIỄN BIẾN / THỰC TRẠNG */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.08)",
          border: `1.5px solid ${badgeBorder}`,
          padding: "8px 24px",
          borderRadius: "30px",
          marginBottom: "24px",
          boxShadow: `0 8px 25px ${accentColor}33`,
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: 900,
            letterSpacing: "2px",
            color: accentColor,
            textTransform: "uppercase",
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} • {data.stepLabel}
        </span>
      </div>

      {/* Icon lớn phong cách tối giản */}
      <div
        style={{
          width: "110px",
          height: "110px",
          borderRadius: "30px",
          background: "rgba(255, 255, 255, 0.06)",
          border: `2px solid ${badgeBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "56px",
          marginBottom: "24px",
          boxShadow: `0 10px 30px ${accentColor}44`,
        }}
      >
        {data.icon || (index === 0 ? "📰" : index === 1 ? "🔍" : "📊")}
      </div>

      {/* Nếu có Stat Highlight */}
      {data.statHighlight && (
        <div
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#FFFFFF",
            padding: "8px 24px",
            borderRadius: "20px",
            fontSize: "24px",
            fontWeight: 900,
            letterSpacing: "2px",
            marginBottom: "20px",
            boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)",
          }}
        >
          ⭐ {data.statHighlight}
        </div>
      )}

      {/* Headline ngắn gọn (3-8 từ) */}
      <h2
        style={{
          fontSize: "58px",
          fontWeight: 900,
          lineHeight: "1.28",
          color: "#FFFFFF",
          margin: 0,
          marginBottom: "28px",
          textShadow: "0 10px 30px rgba(0,0,0,0.8)",
        }}
      >
        {renderHighlightedText(data.headline, data.highlightWord, "#FACC15")}
      </h2>

      {/* Thẻ Body Text (5-14 từ súc tích, Glassmorphism cao cấp) */}
      {data.bodyText && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "24px",
            padding: "26px 36px",
            width: "100%",
            boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
          }}
        >
          <p
            style={{
              fontSize: "38px",
              fontWeight: 700,
              lineHeight: "1.4",
              color: "#E2E8F0",
              margin: 0,
            }}
          >
            {renderHighlightedText(data.bodyText, data.highlightWord, "#38BDF8")}
          </p>
        </div>
      )}
    </SceneWrapper>
  );
};

// ─── CẢNH CUỐI: CTA HOẶC OUTRO BẢN TIN (CALL TO ACTION / BRAND OUTRO) ─────────
const CtaScene: React.FC<{
  data: CtaSceneData;
  topicType?: string;
}> = ({ data, topicType }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.15) * 6;
  const isNews = topicType === "NEWS";

  const btnBg = isNews
    ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
    : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
  const btnBorder = isNews ? "#93C5FD" : "#FDE68A";
  const btnShadow = isNews ? "rgba(37, 99, 235, 0.5)" : "rgba(245, 158, 11, 0.5)";

  return (
    <SceneWrapper>
      <div style={{ fontSize: "90px", marginBottom: "20px", transform: `translateY(${pulse}px)` }}>
        {isNews ? "🔔" : "🚀"}
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
          color: "#FFFFFF",
          padding: "10px 28px",
          borderRadius: "30px",
          fontSize: "24px",
          fontWeight: 800,
          letterSpacing: "2px",
          marginBottom: "24px",
          border: "1.5px solid #93C5FD",
        }}
      >
        {isNews ? "🌐 NEXO STUDIO TECH NEWS" : "🤝 ĐỒNG HÀNH CÙNG NEXO STUDIO"}
      </div>

      <h2
        style={{
          fontSize: "56px",
          fontWeight: 900,
          color: "#FFFFFF",
          margin: 0,
          marginBottom: "36px",
          lineHeight: "1.25",
        }}
      >
        {isNews
          ? "Cập Nhật Xu Hướng Công Nghệ & Kinh Doanh Mới Mỗi Ngày"
          : "Tăng Trưởng Bứt Phá Cùng Nexo Studio"}
      </h2>

      {/* Nút Kêu Gọi Hành Động Nổi Bật */}
      <div
        style={{
          background: btnBg,
          color: "#FFFFFF",
          padding: "28px 52px",
          borderRadius: "50px",
          fontSize: "38px",
          fontWeight: 900,
          boxShadow: `0 20px 50px ${btnShadow}`,
          border: `2px solid ${btnBorder}`,
          transform: `scale(${1 + Math.sin(frame * 0.1) * 0.03})`,
          marginBottom: "28px",
        }}
      >
        {data.mainCta || (isNews ? "Theo dõi Nexo Studio để cập nhật tin mới" : "Nhắn tin cho Nexo Studio")}
      </div>

      <p style={{ fontSize: "28px", color: "#93C5FD", fontWeight: 700, margin: 0 }}>
        {data.offerSubtext ||
          (isNews
            ? "Công nghệ, startup và kinh doanh — ngắn gọn, dễ hiểu"
            : "Thiết Kế Website Chuẩn UX/UI • Phần Mềm Tự Động Hóa")}
      </p>
    </SceneWrapper>
  );
};

// ─── TỔNG HỢP: TEMPLATE VIDEO DỌC CHUẨN NEXO STUDIO (TIN TỨC & BÀI HỌC B2B) ──
export const VideoTemplate: React.FC<VideoTemplateProps> = (props) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = (frame / durationInFrames) * 100;
  const topicType = props.metadata?.topicType || "NEWS";

  // Chuẩn hóa dữ liệu đầu vào: hỗ trợ cả schema mới và fallback dữ liệu cũ
  const hookData: HookSceneData = props.hookScene || {
    title: props.title || "Chuyển Đổi Số Cho Doanh Nghiệp",
    badge: props.metadata?.categoryTag || (topicType === "NEWS" ? "BẢN TIN CÔNG NGHỆ" : "BÀI HỌC KINH DOANH"),
  };

  const scenesData: ContentSceneData[] =
    props.scenes && props.scenes.length > 0
      ? props.scenes
      : (props.slides || props.points || []).map((item: any, idx: number) => {
          const isObj = typeof item === "object";
          const rawText = isObj ? item.headline || item.title : String(item);
          const cleanText = rawText.replace(/^(Luận điểm \d+:\s*|Giải pháp \d+:\s*)/i, "");
          const labels =
            topicType === "NEWS"
              ? ["DIỄN BIẾN", "CHI TIẾT", "TÁC ĐỘNG"]
              : ["THỰC TRẠNG", "GIẢI PHÁP", "KẾT QUẢ"];
          return {
            stepLabel: isObj && item.badge ? item.badge : labels[idx % labels.length],
            headline: cleanText,
            bodyText: isObj ? item.subtext || "" : "",
            icon: isObj && item.icon ? item.icon : idx === 0 ? "📰" : idx === 1 ? "🔍" : "📊",
          };
        });

  const ctaData: CtaSceneData = props.ctaScene || {
    mainCta:
      typeof props.cta === "object"
        ? props.cta.action || props.cta.mainCta
        : props.cta || (topicType === "NEWS" ? "Theo dõi Nexo Studio để cập nhật tin mới" : "Nhắn tin cho Nexo Studio"),
    offerSubtext:
      typeof props.cta === "object"
        ? props.cta.subtext || props.cta.offerSubtext
        : (topicType === "NEWS"
            ? "Công nghệ, startup và kinh doanh — ngắn gọn, dễ hiểu"
            : "Nhận tư vấn giải pháp tối ưu cho doanh nghiệp"),
  };

  // Phân bổ thời lượng linh hoạt trong khoảng 35s - 45s
  // HookScene ~ 16%, CtaScene ~ 18%, các scenes nội dung chia đều
  const hookDuration = Math.round(durationInFrames * 0.16);
  const ctaDuration = Math.round(durationInFrames * 0.18);
  const contentTotalFrames = durationInFrames - hookDuration - ctaDuration;
  const sceneDuration = Math.floor(contentTotalFrames / Math.max(1, scenesData.length));

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
      {props.audioUrl ? (
        <Audio
          src={
            props.audioUrl.startsWith("http://") || props.audioUrl.startsWith("https://")
              ? props.audioUrl
              : staticFile("voice.mp3")
          }
        />
      ) : null}

      {/* Top Header Nhận Diện Nexo Studio */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "4px",
            color: "rgba(255, 255, 255, 0.45)",
            textTransform: "uppercase",
          }}
        >
          {topicType === "NEWS"
            ? "Nexo Studio • Bản Tin Công Nghệ & Kinh Doanh"
            : "Nexo Studio • Giải Pháp Số Doanh Nghiệp"}
        </span>
      </div>

      {/* KHU VỰC NỘI DUNG CHÍNH (CENTER 100%, ĐỆM DƯỚI CHO KARAOKE SUBTITLES) */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 48px 340px 48px",
          zIndex: 20,
        }}
      >
        {/* HOOK SCENE */}
        <Sequence from={0} durationInFrames={hookDuration}>
          <HookScene data={hookData} metadata={props.metadata} />
        </Sequence>

        {/* 3 PHÂN CẢNH NỘI DUNG */}
        {scenesData.map((scene, i) => {
          const fromFrame = hookDuration + i * sceneDuration;
          const currentDuration =
            i === scenesData.length - 1
              ? contentTotalFrames - i * sceneDuration
              : sceneDuration;

          return (
            <Sequence key={i} from={fromFrame} durationInFrames={currentDuration}>
              <ContentScene
                data={scene}
                index={i}
                total={scenesData.length}
                topicType={topicType}
              />
            </Sequence>
          );
        })}

        {/* CTA SCENE */}
        <Sequence
          from={hookDuration + contentTotalFrames}
          durationInFrames={ctaDuration}
        >
          <CtaScene data={ctaData} topicType={topicType} />
        </Sequence>
      </AbsoluteFill>

      {/* KHU VỰC PHỤ ĐỀ KARAOKE (CÁCH NỘI DUNG MỘT KHOẢNG THOÁNG ĐẸP MẮT) */}
      <div
        style={{
          position: "absolute",
          bottom: "120px",
          left: "50px",
          right: "50px",
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <KaraokeSubtitles subtitles={props.subtitles || []} />
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
          zIndex: 100,
        }}
      />
    </AbsoluteFill>
  );
};
