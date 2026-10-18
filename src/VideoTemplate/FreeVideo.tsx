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
import { P, FONT, MotionBackground } from "./MotionVisuals";
import { FreeHeader, renderFreeScene } from "./FreeScenes";
import { SceneBackdrop } from "../library/MotionKit";

const CL = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const TINT: Record<string, string> = {
  blue: P.blue,
  sky: P.sky,
  green: P.green,
  amber: P.amber,
  red: P.red,
  violet: P.violet,
};

export type FreeScene = {
  type: string;
  seconds?: number;
  tint?: string;
  [key: string]: any;
};

export type FreeScript = {
  brand?: string;
  scenes: FreeScene[];
};

/** Tổng số frame của một script (dùng cho calculateMetadata). */
export const scriptFrames = (script?: FreeScript, fps = 30) => {
  const total = (script?.scenes || []).reduce(
    (n, s) => n + Math.max(1, Math.round((s.seconds ?? 4) * fps)),
    0
  );
  return Math.max(1, total);
};

/**
 * Khung dựng chung: nền chuyển động + header + từng cảnh chạy theo Sequence.
 * Không có audio, không có phụ đề — mỗi cảnh tự lo phần hình của nó.
 */
export const FreeVideo: React.FC<FreeScript> = (script) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scenes = script?.scenes || [];

  let acc = 0;
  const timed = scenes.map((s) => {
    const dur = Math.max(1, Math.round((s.seconds ?? 4) * fps));
    const item = { s, from: acc, dur };
    acc += dur;
    return item;
  });
  const total = acc || 1;

  const current = Math.max(
    0,
    timed.findIndex((t) => frame >= t.from && frame < t.from + t.dur)
  );
  const tintKey = scenes[current]?.tint || "blue";

  return (
    <AbsoluteFill style={{ backgroundColor: P.ink, fontFamily: FONT }}>
      <MotionBackground tint={TINT[tintKey] || P.blue} />

      {/* Vignette nhẹ cho chữ nổi */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 30%, rgba(3,6,15,0.55) 100%)",
        }}
      />

      <FreeHeader
        label={script?.brand || "NEXO STUDIO"}
        index={current}
        total={scenes.length}
      />

      {/* Thanh tiến trình toàn video */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: `${Math.min(100, (frame / Math.max(1, durationInFrames)) * 100)}%`,
          background: `linear-gradient(90deg, ${P.sky}, ${P.violet})`,
          boxShadow: "0 0 18px rgba(56,189,248,0.6)",
          zIndex: 50,
        }}
      />

      {timed.map(({ s, from, dur }, i) => (
        <Sequence key={i} from={from} durationInFrames={dur} name={`${i + 1}. ${s.type}`}>
          {s.audio ? <Audio src={staticFile(String(s.audio))} /> : null}
          {s.backdrop ? (
            <SceneBackdrop
              preset={String(s.backdrop)}
              intensity={Number(s.backdropIntensity ?? 1)}
              palette={s.tint}
            />
          ) : null}
          <SceneWrap dur={dur}>{renderFreeScene(s)}</SceneWrap>
          {Array.isArray(s.words) && s.words.length ? <Karaoke words={s.words} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ─── Karaoke: tô sáng đúng từ đang được đọc, theo word-boundary của edge-tts ──
const Karaoke: React.FC<{ words: { w: string; s: number; e: number }[] }> = ({
  words,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <div
      style={{
        position: "absolute",
        left: 76,
        right: 76,
        bottom: 148,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 12px",
        fontFamily: FONT,
        fontSize: 42,
        fontWeight: 800,
        lineHeight: 1.38,
        textAlign: "center",
        zIndex: 30,
      }}
    >
      {words.map((w, i) => {
        const on = t >= w.s && t < w.e;
        const done = t >= w.e;
        return (
          <span
            key={i}
            style={{
              color: on ? P.sky : done ? P.text : "rgba(248,250,252,0.38)",
              textShadow: "0 4px 22px rgba(0,0,0,0.9)",
              transform: on ? "translateY(-2px)" : "none",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// Vào bằng spring nhẹ, ra bằng fade + scale nhỏ — giữ nhịp, không cắt cụt.
const SceneWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const exitAt = Math.max(4, dur - 14);
  const inO = interpolate(frame, [0, 8], [0, 1], CL);
  const outO = interpolate(frame, [exitAt, dur], [1, 0], CL);
  const outS = interpolate(frame, [exitAt, dur], [1, 0.97], CL);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 84px",
        paddingTop: 60,
        paddingBottom: 120,
        opacity: Math.min(inO, outO),
        transform: `scale(${outS})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
