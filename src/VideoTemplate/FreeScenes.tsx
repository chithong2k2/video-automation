import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { P, FONT, enterStyle, OutroMark } from "./MotionVisuals";
import { LIBRARY_SCENES } from "../library/Primitives";
import { MOTION_KIT } from "../library/MotionKit";

// ─────────────────────────────────────────────────────────────────────────────
// FREE SCENES — bộ primitive để AI tự dựng graphic từ dữ liệu tin tức.
// AI không chọn "khung có sẵn", nó xuất JSON mô tả nội dung; mỗi primitive ở
// đây render BẤT KỲ nội dung nào khớp schema đó.
// ─────────────────────────────────────────────────────────────────────────────

const CL = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Đếm số từ `from` → `to` trong `dur` frame, bắt đầu ở `start`. */
const countTo = (frame: number, start: number, dur: number, to: number, from = 0) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], CL);
  return from + (to - from) * easeOut(p);
};

/** 1234567 -> "1.234.567" (định dạng Việt Nam) */
const viNum = (n: number, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [i, d] = s.split(".");
  const gi = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return d ? `${gi},${d}` : gi;
};

const TONE: Record<string, string> = {
  blue: P.blue,
  sky: P.sky,
  green: P.green,
  amber: P.amber,
  red: P.red,
  violet: P.violet,
};
const tone = (t?: string) => TONE[t || "blue"] || P.blue;

const stripPunct = (w: string) => w.toLowerCase().replace(/[.,;:!?"“”'’()]/g, "");

// ─── Headline: từng từ bật lên, 1 từ được tô gradient ────────────────────────
export const Headline: React.FC<{
  text: string;
  accent?: string;
  size?: number;
  delay?: number;
  step?: number;
  align?: "left" | "center";
}> = ({ text, accent, size = 96, delay = 8, step = 4, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const acc = stripPunct(accent || "");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `${Math.round(size * 0.22)}px`,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.14,
        letterSpacing: "-1.5px",
        color: P.text,
        textShadow: "0 12px 44px rgba(0,0,0,0.72)",
      }}
    >
      {words.map((w, i) => {
        const s = enterStyle(frame, fps, delay + i * step, { y: 54, scale: 0.9, damping: 12 });
        const isAcc = !!acc && stripPunct(w) === acc;
        return (
          <span
            key={`${w}-${i}`}
            style={{
              opacity: s.opacity,
              transform: s.transform,
              display: "inline-block",
              ...(isAcc
                ? {
                    backgroundImage: `linear-gradient(100deg, ${P.sky} 0%, ${P.violet} 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 0 26px rgba(139,92,246,0.35))",
                  }
                : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ─── 1. COVER ───────────────────────────────────────────────────────────────
export const CoverScene: React.FC<any> = ({ kicker, title, accent, meta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rule = interpolate(frame, [6, 32], [0, 1], CL);
  const k = enterStyle(frame, fps, 4, { y: 24, scale: 1 });
  const m = enterStyle(frame, fps, 46, { y: 18, scale: 1 });

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 38,
          opacity: k.opacity,
          transform: k.transform,
        }}
      >
        <div style={{ width: 58 * rule, height: 3, background: P.sky, borderRadius: 2 }} />
        <div
          style={{
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: "7px",
            color: P.sky,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
      </div>

      <Headline text={title} accent={accent} size={106} delay={10} step={4} />

      <div
        style={{
          marginTop: 50,
          height: 1,
          background: `linear-gradient(90deg, ${P.line}, transparent)`,
          width: 900 * rule,
        }}
      />
      <div
        style={{
          marginTop: 26,
          fontSize: 27,
          color: P.faint,
          fontWeight: 600,
          letterSpacing: "0.5px",
          opacity: m.opacity,
          transform: m.transform,
        }}
      >
        {meta}
      </div>
    </div>
  );
};

// ─── 2. STAT — một con số khổng lồ đếm lên ──────────────────────────────────
export const StatScene: React.FC<any> = ({
  value = 0,
  unit,
  label,
  delta,
  deltaTone = "amber",
  decimals = 0,
  note,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = countTo(frame, 12, 40, value, 0);
  const ring = interpolate(frame, [4, 46], [0, 1], CL);
  const d = enterStyle(frame, fps, 46, { y: 26, scale: 0.94 });
  const c = tone(deltaTone);
  const R = 330;

  return (
    <div style={{ width: 900, fontFamily: FONT, position: "relative" }}>
      {/* Vòng cung vẽ dần phía sau con số */}
      <svg
        width={760}
        height={760}
        style={{ position: "absolute", left: -10, top: -190, opacity: 0.5 }}
      >
        <circle cx={380} cy={380} r={R} fill="none" stroke={P.line} strokeWidth={2} />
        <circle
          cx={380}
          cy={380}
          r={R}
          fill="none"
          stroke={`url(#g)`}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * R}
          strokeDashoffset={2 * Math.PI * R * (1 - ring)}
          transform="rotate(-90 380 380)"
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={P.sky} />
            <stop offset="100%" stopColor={P.violet} />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div
            style={{
              fontSize: 232,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: "-10px",
              color: P.text,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 18px 70px rgba(56,189,248,0.22)",
            }}
          >
            {viNum(n, decimals)}
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              color: P.sky,
              paddingBottom: 26,
              letterSpacing: "-1px",
            }}
          >
            {unit}
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 34,
            fontWeight: 700,
            color: P.dim,
            lineHeight: 1.35,
            maxWidth: 700,
          }}
        >
          {label}
        </div>

        {delta ? (
          <div
            style={{
              marginTop: 34,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 24px",
              borderRadius: 999,
              border: `1px solid ${c}66`,
              background: `${c}1A`,
              color: c,
              fontSize: 27,
              fontWeight: 800,
              opacity: d.opacity,
              transform: d.transform,
            }}
          >
            <span style={{ fontSize: 30 }}>↓</span>
            {delta}
          </div>
        ) : null}

        {note ? (
          <div style={{ marginTop: 26, fontSize: 22, color: P.faint, opacity: d.opacity }}>
            {note}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── 3. BARS — biểu đồ cột ngang, dữ liệu thật từ tin ───────────────────────
export const BarsScene: React.FC<any> = ({ title, unit, items = [], caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enterStyle(frame, fps, 4, { y: 26, scale: 0.96 });
  const max = Math.max(...items.map((i: any) => Math.abs(i.value) || 0), 1);

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div style={{ opacity: head.opacity, transform: head.transform, marginBottom: 12 }}>
        <div style={{ fontSize: 22, color: P.faint, fontWeight: 800, letterSpacing: "3px" }}>
          {unit}
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, color: P.text, marginTop: 8, letterSpacing: "-1px" }}>
          {title}
        </div>
      </div>

      <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 30 }}>
        {items.map((it: any, i: number) => {
          const delay = 12 + i * 7;
          const w = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 18, mass: 0.8 },
          });
          const v = countTo(frame, delay + 4, 32, it.value, 0);
          const col = it.highlight ? P.sky : P.line;
          const ratio = (Math.abs(it.value) / max) * 100 * w;

          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 12,
                  opacity: Math.min(1, w * 1.4),
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: it.highlight ? 800 : 600,
                    color: it.highlight ? P.text : P.dim,
                  }}
                >
                  {it.label}
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    color: it.highlight ? P.sky : P.dim,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {viNum(v, it.decimals || 0)}
                  {it.suffix || ""}
                </div>
              </div>

              <div
                style={{
                  height: it.highlight ? 22 : 16,
                  borderRadius: 999,
                  background: "rgba(148,163,184,0.12)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${ratio}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: it.highlight
                      ? `linear-gradient(90deg, ${P.sky}, ${P.violet})`
                      : "rgba(148,163,184,0.45)",
                    boxShadow: it.highlight ? "0 0 30px rgba(56,189,248,0.55)" : "none",
                  }}
                />
              </div>

              {it.note ? (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 21,
                    color: P.faint,
                    opacity: Math.min(1, w * 1.4),
                  }}
                >
                  {it.note}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {caption ? (
        <div style={{ marginTop: 36, fontSize: 22, color: P.faint }}>{caption}</div>
      ) : null}
    </div>
  );
};

// ─── 4. COMPARE — hai cách làm đặt cạnh nhau ────────────────────────────────
export const CompareScene: React.FC<any> = ({ title, left, right }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enterStyle(frame, fps, 4, { y: 26, scale: 0.96 });
  const l = enterStyle(frame, fps, 16, { y: 40, scale: 0.96 });
  const r = enterStyle(frame, fps, 28, { y: 40, scale: 0.96 });
  const vs = enterStyle(frame, fps, 22, { y: 0, scale: 0.7 });

  const card = (data: any, style: any, delay: number) => {
    const c = tone(data?.tone);
    return (
      <div
        style={{
          ...style,
          width: "100%",
          borderRadius: 26,
          border: `1px solid ${c}55`,
          background: "rgba(15,23,42,0.72)",
          padding: "28px 30px",
          boxShadow: `inset 0 1px 0 ${c}22`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: c }} />
          <div style={{ fontSize: 34, fontWeight: 900, color: P.text, letterSpacing: "-0.5px" }}>
            {data?.name}
          </div>
        </div>
        <div
          style={{
            display: "inline-block",
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: "2.5px",
            color: c,
            border: `1px solid ${c}55`,
            borderRadius: 999,
            padding: "4px 13px",
            marginBottom: 18,
          }}
        >
          {data?.tag}
        </div>

        {(data?.points || []).map((p: string, i: number) => {
          const s = enterStyle(frame, fps, delay + i * 6, { y: 18, scale: 1 });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                fontSize: 25,
                lineHeight: 1.42,
                color: P.dim,
                marginTop: 10,
                opacity: s.opacity,
                transform: s.transform,
              }}
            >
              <span style={{ color: c, fontWeight: 900 }}>—</span>
              <span>{p}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div
        style={{
          opacity: head.opacity,
          transform: head.transform,
          fontSize: 44,
          fontWeight: 900,
          color: P.text,
          letterSpacing: "-1px",
          marginBottom: 30,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {card(left, { opacity: l.opacity, transform: l.transform }, 22)}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 76,
            opacity: vs.opacity,
            transform: vs.transform,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "4px",
              color: P.dim,
              padding: "8px 20px",
              border: `1px solid ${P.line}`,
              borderRadius: 999,
              background: P.ink,
            }}
          >
            KHÁC Ở CHỖ NÀY
          </div>
        </div>

        {card(right, { opacity: r.opacity, transform: r.transform }, 34)}
      </div>
    </div>
  );
};

// ─── 5. VERSUS — hai con số đối đầu ────────────────────────────────────────
export const VersusScene: React.FC<any> = ({ title, a, b, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enterStyle(frame, fps, 4, { y: 24, scale: 0.96 });
  const div = interpolate(frame, [10, 40], [0, 1], CL);
  const na = countTo(frame, 14, 34, a?.value || 0);
  const nb = countTo(frame, 20, 34, b?.value || 0);
  const n = enterStyle(frame, fps, 54, { y: 20, scale: 1 });

  const side = (data: any, value: number, color: string, align: "left" | "right") => (
    <div
      style={{
        flex: 1,
        textAlign: align,
        fontFamily: FONT,
        padding: align === "left" ? "0 30px 0 0" : "0 0 0 30px",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "2px",
          color,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {data?.name}
      </div>
      <div
        style={{
          fontSize: 132,
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-6px",
          color: P.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {viNum(value)}
      </div>
      <div style={{ fontSize: 24, color: P.faint, marginTop: 12, fontWeight: 700 }}>
        {data?.unit}
      </div>
    </div>
  );

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div
        style={{
          opacity: head.opacity,
          transform: head.transform,
          fontSize: 42,
          fontWeight: 900,
          color: P.text,
          letterSpacing: "-1px",
          marginBottom: 48,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", alignItems: "stretch" }}>
        {side(a, na, P.sky, "left")}
        <div
          style={{
            width: 3,
            background: `linear-gradient(180deg, transparent, ${P.sky}99, transparent)`,
            transform: `scaleY(${div})`,
            transformOrigin: "center",
          }}
        />
        {side(b, nb, P.violet, "right")}
      </div>

      {note ? (
        <div
          style={{
            marginTop: 44,
            padding: "20px 26px",
            borderRadius: 18,
            borderLeft: `3px solid ${P.amber}`,
            background: "rgba(245,158,11,0.08)",
            fontSize: 26,
            lineHeight: 1.45,
            color: P.dim,
            opacity: n.opacity,
            transform: n.transform,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};

// ─── 6. STEPS — dòng thời gian dọc ─────────────────────────────────────────
export const StepsScene: React.FC<any> = ({ title, items = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enterStyle(frame, fps, 4, { y: 24, scale: 0.96 });
  const line = interpolate(frame, [10, 20 + items.length * 9], [0, 1], CL);

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div
        style={{
          opacity: head.opacity,
          transform: head.transform,
          fontSize: 44,
          fontWeight: 900,
          color: P.text,
          letterSpacing: "-1px",
          marginBottom: 44,
        }}
      >
        {title}
      </div>

      <div style={{ position: "relative", paddingLeft: 78 }}>
        {/* Đường dọc vẽ dần */}
        <div
          style={{
            position: "absolute",
            left: 27,
            top: 12,
            bottom: 40,
            width: 2,
            background: `linear-gradient(180deg, ${P.sky}, ${P.violet}55)`,
            transform: `scaleY(${line})`,
            transformOrigin: "top",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 42 }}>
          {items.map((it: any, i: number) => {
            const delay = 14 + i * 9;
            const s = enterStyle(frame, fps, delay, { y: 30, scale: 0.97 });
            const dot = spring({
              frame: Math.max(0, frame - delay),
              fps,
              config: { damping: 11, mass: 0.6 },
            });
            return (
              <div key={i} style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: -78,
                    top: 2,
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    border: `2px solid ${P.sky}`,
                    background: P.ink,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 24,
                    fontWeight: 900,
                    color: P.sky,
                    transform: `scale(${dot})`,
                    boxShadow: "0 0 24px rgba(56,189,248,0.35)",
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontSize: 33,
                    fontWeight: 800,
                    color: P.text,
                    lineHeight: 1.3,
                    opacity: s.opacity,
                    transform: s.transform,
                  }}
                >
                  {it.label}
                </div>
                {it.note ? (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 24,
                      color: P.faint,
                      lineHeight: 1.45,
                      opacity: s.opacity,
                    }}
                  >
                    {it.note}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── 7. QUOTE — trích dẫn ───────────────────────────────────────────────────
export const QuoteScene: React.FC<any> = ({ text, author, source }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = enterStyle(frame, fps, 2, { y: 0, scale: 0.7 });
  const s = enterStyle(frame, fps, 18, { y: 28, scale: 0.98 });
  const a = enterStyle(frame, fps, 40, { y: 16, scale: 1 });

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', 'Noto Serif', serif",
          fontSize: 190,
          lineHeight: 0.62,
          color: P.violet,
          fontWeight: 700,
          opacity: q.opacity * 0.7,
          transform: q.transform,
          marginBottom: 26,
          height: 92,
          overflow: "hidden",
        }}
      >
        “
      </div>

      <div
        style={{
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.34,
          color: P.text,
          letterSpacing: "-0.8px",
          opacity: s.opacity,
          transform: s.transform,
        }}
      >
        {text}
      </div>

      <div
        style={{
          marginTop: 38,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: a.opacity,
          transform: a.transform,
        }}
      >
        <div style={{ width: 44, height: 2, background: P.violet }} />
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: P.text }}>{author}</div>
          {source ? (
            <div style={{ fontSize: 21, color: P.faint, marginTop: 4 }}>{source}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ─── 8. OUTRO — logo thật + CTA (tái dùng từ hệ cũ) ────────────────────────
export const OutroScene: React.FC<any> = ({ cta, sub }) => (
  <OutroMark cta={cta} sub={sub} />
);

// ─── 9. CANVAS — AI tự vẽ bằng hình khối cấp thấp ───────────────────────────
// Đây là "cây bút": AI xuất toạ độ + hình khối, không xuất tên cảnh có sẵn.
// Không gian vẽ: 900 × 1200 (px), gốc toạ độ ở góc trên trái.
const CW = 900;
const CH = 1200;

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clampN = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const CanvasScene: React.FC<any> = ({ elements = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const els: any[] = Array.isArray(elements) ? elements.slice(0, 40) : [];

  const anim = (el: any, i: number) => {
    const delay = num(el.delay, 6 + i * 4);
    const p = spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 16, mass: 0.7 },
    });
    return { p: Math.min(1, Math.max(0, p)), delay };
  };

  const shapes = els
    .map((el, i) => ({ el, i }))
    .filter(({ el }) => el && el.kind !== "text");

  const texts = els
    .map((el, i) => ({ el, i }))
    .filter(({ el }) => el && el.kind === "text");

  // Tự canh giữa dọc: AI hiếm khi dùng hết 1200px, đừng để nội dung dồn lên trên.
  const bottoms = els.map((el) => {
    if (!el) return 0;
    if (el.kind === "text") return num(el.y) + num(el.size, 32) * 2.6;
    if (el.kind === "rect") return num(el.y) + num(el.h, 20);
    if (el.kind === "circle") return num(el.y) + num(el.r, 40);
    if (el.kind === "line") return Math.max(num(el.y1), num(el.y2));
    return num(el.y, 0);
  });
  const offsetY = Math.max(0, (CH - Math.max(...bottoms, 0)) / 2);

  return (
    <div style={{ position: "relative", width: CW, height: CH, fontFamily: FONT }}>
      <svg
        width={CW}
        height={CH}
        viewBox={`0 0 ${CW} ${CH}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          transform: `translateY(${offsetY}px)`,
        }}
      >
        {shapes.map(({ el, i }) => {
          const { p } = anim(el, i);
          const op = clampN(num(el.opacity, 1), 0, 1) * p;
          const dy = (1 - p) * 12;
          const draw =
            el.animate === "draw"
              ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p }
              : {};

          if (el.kind === "rect") {
            return (
              <rect
                key={i}
                x={clampN(num(el.x), -200, CW + 200)}
                y={clampN(num(el.y), -200, CH + 200) + dy}
                width={clampN(num(el.w, 100), 1, CW * 2)}
                height={clampN(num(el.h, 20), 1, CH * 2)}
                rx={num(el.radius, 0)}
                fill={el.fill || "none"}
                stroke={el.stroke || "none"}
                strokeWidth={num(el.strokeWidth, 0)}
                opacity={op}
              />
            );
          }

          if (el.kind === "circle") {
            return (
              <circle
                key={i}
                cx={clampN(num(el.x), -200, CW + 200)}
                cy={clampN(num(el.y), -200, CH + 200) + dy}
                r={clampN(num(el.r, 40), 1, 800) * (el.animate === "grow" ? p : 1)}
                fill={el.fill || "none"}
                stroke={el.stroke || "none"}
                strokeWidth={num(el.strokeWidth, 0)}
                opacity={op}
                {...draw}
              />
            );
          }

          if (el.kind === "line") {
            return (
              <line
                key={i}
                x1={num(el.x1)}
                y1={num(el.y1)}
                x2={num(el.x2)}
                y2={num(el.y2)}
                stroke={el.color || P.line}
                strokeWidth={num(el.width, 2)}
                strokeLinecap="round"
                opacity={op}
                {...draw}
              />
            );
          }

          if (el.kind === "polygon") {
            const pts = (el.points || [])
              .map((pt: any) => `${num(pt[0])},${num(pt[1])}`)
              .join(" ");
            return (
              <polygon
                key={i}
                points={pts}
                fill={el.fill || "none"}
                stroke={el.stroke || "none"}
                strokeWidth={num(el.strokeWidth, 0)}
                strokeLinejoin="round"
                opacity={op}
                {...draw}
              />
            );
          }

          if (el.kind === "path") {
            return (
              <path
                key={i}
                d={String(el.d || "")}
                fill={el.fill || "none"}
                stroke={el.stroke || "none"}
                strokeWidth={num(el.strokeWidth, 0)}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={op}
                {...draw}
              />
            );
          }

          return null;
        })}
      </svg>

      {texts.map(({ el, i }) => {
        const { p } = anim(el, i);
        const s = enterStyle(frame, fps, num(el.delay, 6 + i * 4), { y: 18, scale: 1 });
        const color = el.color || P.text;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: clampN(num(el.x), -200, CW + 200),
              top: clampN(num(el.y), -200, CH + 200) + offsetY,
              width: clampN(num(el.w, 420), 20, CW),
              fontSize: clampN(num(el.size, 32), 12, 170),
              fontWeight: num(el.weight, 700),
              color,
              textAlign: (el.align || "left") as any,
              lineHeight: num(el.lineHeight, 1.3),
              letterSpacing:
                el.letterSpacing != null ? `${num(el.letterSpacing)}px` : undefined,
              opacity: s.opacity * clampN(num(el.opacity, 1), 0, 1),
              transform: s.transform,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(el.text ?? "")}
          </div>
        );
      })}
    </div>
  );
};

// ─── Router: JSON type → component ─────────────────────────────────────────
// Thư viện primitive dùng lại được (grid/rack/stream/stamp…). Thêm primitive mới
// chỉ cần đăng ký một dòng trong LIBRARY_SCENES, không phải sửa router này.
export const renderFreeScene = (s: any) => {
  // Nhận cả 2 quy ước:
  //   { "type": "datastory", "title": "..." }            (phẳng — quy ước cũ)
  //   { "component": "DataStory", "props": { ... } }     (lồng — như spec motion registry)
  const key = String(s?.type || s?.component || "").toLowerCase();
  const props =
    s && typeof s.props === "object" && s.props !== null ? { ...s, ...s.props } : s;

  const Kit = MOTION_KIT[key];
  if (Kit) return <Kit {...props} />;

  const Lib = LIBRARY_SCENES[key];
  if (Lib) return <Lib {...props} />;

  switch (key) {
    case "cover":
      return <CoverScene {...props} />;
    case "stat":
      return <StatScene {...props} />;
    case "bars":
      return <BarsScene {...props} />;
    case "compare":
      return <CompareScene {...props} />;
    case "versus":
      return <VersusScene {...props} />;
    case "steps":
      return <StepsScene {...props} />;
    case "quote":
      return <QuoteScene {...props} />;
    case "canvas":
      return <CanvasScene {...props} />;
    case "outro":
      return <OutroScene {...props} />;
    default:
      // Không nhận ra type → vẫn render được, không bao giờ ra khung trắng
      return (
        <div style={{ width: 900, fontFamily: FONT }}>
          <Headline text={props?.title || props?.text || ""} size={76} />
          {props?.note ? (
            <div style={{ marginTop: 24, fontSize: 28, color: P.dim }}>{props.note}</div>
          ) : null}
        </div>
      );
  }
};

// ─── Header thương hiệu + thanh tiến trình theo cảnh ────────────────────────
export const FreeHeader: React.FC<{
  label?: string;
  index?: number;
  total?: number;
}> = ({ label, index = 0, total = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 86,
        left: 84,
        right: 84,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FONT,
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Img
          src={staticFile("brand/logo-mark.png")}
          style={{ height: 42, width: "auto", objectFit: "contain" }}
        />
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: "4px",
            color: P.dim,
            textTransform: "uppercase",
          }}
        >
          {label || "NEXO STUDIO"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        {Array.from({ length: Math.max(1, total) }).map((_, i) => {
          const active = i === index;
          const done = i < index;
          return (
            <div
              key={i}
              style={{
                width: active ? 34 : 20,
                height: 3,
                borderRadius: 2,
                background: active ? P.sky : done ? "rgba(56,189,248,0.5)" : P.line,
                boxShadow: active ? "0 0 14px rgba(56,189,248,0.7)" : "none",
                transition: "none",
                opacity: active ? 0.85 + Math.sin(frame * 0.12) * 0.15 : 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
