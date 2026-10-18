import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KaraokeSubtitles, SubtitleWord } from "./KaraokeSubtitles";
import {
  BarChart,
  FONT,
  KineticText,
  MotionBackground,
  NewsCard,
  OutroMark,
  P,
  SplitCompare,
  UIWindow,
  WorkflowFlow,
} from "./MotionVisuals";

export interface DynamicScene {
  id: string;
  stepLabel?: string;
  startSeconds?: number;
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

const clampBoth = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const shorten = (s: string | undefined, max = 110) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

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

  // Timeline: ưu tiên startSeconds thật do pipeline suy ra từ word-boundary giọng đọc.
  // Nhờ vậy tổng các scene luôn khớp durationInFrames -> scene cuối không bị cắt cụt.
  let acc = 0;
  const sceneStarts = displayScenes.map((scene) => {
    const from =
      typeof scene.startSeconds === "number"
        ? Math.round(scene.startSeconds * fps)
        : acc;
    const dur = scene.durationInSeconds
      ? Math.round(scene.durationInSeconds * fps)
      : Math.floor(durationInFrames / displayScenes.length);
    acc = from + dur;
    return from;
  });

  const sceneItems = displayScenes.map((scene, i) => {
    const from = sceneStarts[i];
    // Scene cuối luôn kéo tới hết video để không còn khoảng trống ở đuôi
    const to = i < sceneStarts.length - 1 ? sceneStarts[i + 1] : durationInFrames;
    return {
      ...scene,
      from,
      durationInFrames: Math.max(1, to - from),
    };
  });

  return (
    <AbsoluteFill style={{ color: P.text, fontFamily: FONT }}>
      <MotionBackground tint={P.blue} />

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

      {/* Header nhận diện */}
      <div
        style={{
          position: "absolute",
          top: 74,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 26px",
            borderRadius: 99,
            background: "rgba(7,10,18,0.55)",
            border: "1px solid rgba(148,163,184,0.22)",
            backdropFilter: "blur(12px)",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "3px",
            color: "rgba(248,250,252,0.62)",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 99,
              background: P.green,
              opacity: 0.6 + Math.sin(frame * 0.18) * 0.4,
            }}
          />
          Nexo Studio
        </div>
      </div>

      {/* Scene nội dung */}
      <AbsoluteFill style={{ zIndex: 20 }}>
        {sceneItems.map((scene, i) => (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
          >
            <SceneFrame
              scene={scene}
              frames={scene.durationInFrames}
              ctaSub={ctaScene?.offerSubtext}
              category={i === 0 ? metadata?.category : undefined}
            />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* Karaoke */}
      <div
        style={{
          position: "absolute",
          bottom: 118,
          left: "50px",
          right: "50px",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <KaraokeSubtitles subtitles={subtitles} />
      </div>

      {/* Thanh tiến trình */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 8,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${P.blue}, ${P.sky}, ${P.green})`,
          zIndex: 999,
          boxShadow: "0 0 22px rgba(56,189,248,0.75)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Một cảnh: badge + kinetic headline + motion graphic theo visualType ─────
const SceneFrame: React.FC<{
  scene: DynamicScene;
  frames: number;
  ctaSub?: string;
  category?: string;
}> = ({ scene, frames, ctaSub, category }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitAt = Math.max(1, frames - 10);
  const exitOpacity = interpolate(frame, [exitAt, frames], [1, 0], clampBoth);
  const exitScale = interpolate(frame, [exitAt, frames], [1, 0.96], clampBoth);

  const vt = scene.visualType || "";
  const isCTA = /CTA|OUTRO/.test(vt);
  const isMockup = /MOCKUP|DASHBOARD|PRODUCT_DEMO|PRODUCT/.test(vt);
  const isChart = /CHART|HERO_STAT|DATA/.test(vt);
  const isFlow = /WORKFLOW|DIAGRAM/.test(vt);
  const isCompare = /BEFORE/.test(vt);

  const caption = shorten(scene.bodyText);

  const renderVisual = () => {
    if (isCTA) return <OutroMark cta={scene.headline} sub={ctaSub} />;
    if (isMockup) return <UIWindow caption={caption} />;
    if (isChart) return <BarChart caption={caption} />;
    if (isFlow) return <WorkflowFlow caption={caption} />;
    if (isCompare) return <SplitCompare caption={caption} />;
    return <NewsCard badge={category} caption={caption} />;
  };

  return (
    <AbsoluteFill
      style={{
        padding: "210px 48px 400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Badge chuyên mục nằm trong khung tin (NewsCard), không lặp ở đây */}

      {/* Headline kinetic */}
      {scene.headline && !isCTA ? (
        <div style={{ marginBottom: 34, maxWidth: 960 }}>
          <KineticText text={scene.headline} fontSize={66} delay={6} step={3} />
        </div>
      ) : null}

      {/* Motion graphic */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {renderVisual()}
      </div>
    </AbsoluteFill>
  );
};
