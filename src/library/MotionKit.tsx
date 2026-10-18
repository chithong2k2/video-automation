import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { P, FONT } from "../VideoTemplate/MotionVisuals";
import { viNum } from "./Primitives";

// ─────────────────────────────────────────────────────────────────────────────
// MOTION KIT — 8 component chuyển động dựng sẵn.
//
// Nguyên tắc:
//  • Mỗi component render ĐƯỢC MỌI nội dung khớp schema, không phải một khung cứng.
//  • Nhiều biến thể qua prop (style / layout / transition), không đẻ component trùng.
//  • Có fallback: thiếu dữ liệu thì lùi về bố cục chữ, không bao giờ ra khung trắng.
//  • Tất cả deterministic — dùng PRNG có seed, không Math.random() lúc render.
// ─────────────────────────────────────────────────────────────────────────────

const CL = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** PRNG có seed — cùng seed ra cùng bố cục ở mọi frame. */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);

/** Vào bằng spring, delay theo thứ tự. Hàm THUẦN — gọi được trong .map() không vi phạm hooks. */
const enterAt = (
  frame: number,
  fps: number,
  delay = 0,
  opts: { y?: number; x?: number; scale?: number } = {}
) => {
  const { y = 40, x = 0, scale = 0.94 } = opts;
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, mass: 0.7 } });
  return {
    p,
    opacity: Math.min(1, Math.max(0, p)),
    transform: `translate3d(${interpolate(p, [0, 1], [x, 0])}px, ${interpolate(
      p,
      [0, 1],
      [y, 0]
    )}px, 0) scale(${interpolate(p, [0, 1], [scale, 1])})`,
  };
};

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      background: P.panel,
      border: `1px solid ${P.line}`,
      borderRadius: 28,
      padding: "30px 34px",
      backdropFilter: "blur(14px)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ═══ 1. KINETIC HEADLINE ═════════════════════════════════════════════════════
// Chữ lớn trượt vào từng từ, mask reveal, nhấn từ khoá, nhiều biến thể style.
export const KineticHeadline: React.FC<any> = ({
  text = "",
  highlightWords = [],
  kicker,
  style = "editorial",
  direction = "mask",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = String(text).split(/\s+/).filter(Boolean);
  // Tách cụm từ khoá thành từng từ: ["giả vờ ngoan"] -> giả, vờ, ngoan
  const clean = (w: string) => w.toLowerCase().replace(/[.,;:!?"“”'’()]/g, "");
  const hl = new Set(
    asArray(highlightWords)
      .flatMap((w) => String(w).split(/\s+/))
      .map(clean)
      .filter(Boolean)
  );

  const STYLE: Record<string, { size: number; weight: number; ls: number; lh: number; upper?: boolean }> = {
    editorial: { size: 94, weight: 900, ls: -2.6, lh: 1.08 },
    minimal: { size: 78, weight: 400, ls: 0.4, lh: 1.22 },
    futuristic: { size: 84, weight: 800, ls: 1.6, lh: 1.12, upper: true },
    poster: { size: 104, weight: 900, ls: -3.6, lh: 0.98, upper: true },
  };
  const st = STYLE[style] || STYLE.editorial;

  if (!words.length) {
    return (
      <div style={{ width: 900, fontFamily: FONT, fontSize: 56, color: P.dim }}>
        (không có nội dung)
      </div>
    );
  }

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      {kicker ? (
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 5,
            color: P.sky,
            marginBottom: 26,
            opacity: interpolate(frame, [0, 12], [0, 1], CL),
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0 0.26em",
          fontSize: st.size,
          fontWeight: st.weight,
          letterSpacing: st.ls,
          lineHeight: st.lh,
          color: P.text,
          textTransform: st.upper ? "uppercase" : "none",
        }}
      >
        {words.map((w, i) => {
          const d = i * 3.5;
          const on = hl.has(clean(w));

          if (direction === "mask") {
            const p = spring({
              frame: Math.max(0, frame - d),
              fps,
              config: { damping: 18, mass: 0.6 },
            });
            return (
              <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 6 }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${interpolate(p, [0, 1], [110, 0])}%)`,
                    background: on
                      ? `linear-gradient(100deg, ${P.sky}, ${P.violet})`
                      : undefined,
                    WebkitBackgroundClip: on ? "text" : undefined,
                    WebkitTextFillColor: on ? "transparent" : undefined,
                  }}
                >
                  {w}
                </span>
              </span>
            );
          }

          const e = enterAt(frame, fps, d, {
            y: direction === "up" ? 40 : 0,
            x: direction === "left" ? 60 : 0,
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                ...e,
                background: on ? `linear-gradient(100deg, ${P.sky}, ${P.violet})` : undefined,
                WebkitBackgroundClip: on ? "text" : undefined,
                WebkitTextFillColor: on ? "transparent" : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ═══ 2. BEFORE / AFTER ═══════════════════════════════════════════════════════
// Hai trạng thái xếp trên/dưới, sau đó chuyển từ vấn đề sang giải pháp.
export const BeforeAfter: React.FC<any> = ({
  before,
  after,
  labels = {},
  transition = "split-reveal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const b = before || {};
  const a = after || {};
  if (!b.title && !a.title) {
    return (
      <div style={{ width: 900, fontFamily: FONT, fontSize: 52, color: P.dim }}>
        (thiếu nội dung before/after)
      </div>
    );
  }

  const wipe = transition === "wipe";
  const p = spring({ frame, fps, config: { damping: 16, mass: 0.8 } });
  const pAfter = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 16, mass: 0.8 } });

  const card = (
    data: any,
    opts: { side: "before" | "after"; label: string; t: number; accent: string; dim: boolean }
  ) => (
    <Panel
      style={{
        width: 900,
        borderColor: `${opts.accent}55`,
        boxShadow: `0 24px 60px -30px ${opts.accent}88`,
        opacity: opts.dim ? 0.82 : 1,
        transform: `translateX(${interpolate(opts.t, [0, 1], [opts.side === "before" ? -70 : 70, 0])}px)`,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 3.4,
          color: opts.accent,
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        {opts.label}
      </div>
      <div style={{ fontSize: 46, fontWeight: 900, color: P.text, lineHeight: 1.16 }}>
        {data.title || ""}
      </div>
      {data.description ? (
        <div style={{ fontSize: 28, color: P.dim, marginTop: 12, lineHeight: 1.4 }}>
          {data.description}
        </div>
      ) : null}
      {asArray(data.points).length ? (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {asArray(data.points)
            .slice(0, 4)
            .map((pt: any, i: number) => (
              <div
                key={i}
                style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 25, color: P.dim }}
              >
                <span style={{ color: opts.accent, fontWeight: 900 }}>·</span>
                <span>{String(pt)}</span>
              </div>
            ))}
        </div>
      ) : null}
    </Panel>
  );

  return (
    <div style={{ width: 900, fontFamily: FONT, display: "flex", flexDirection: "column", gap: 22 }}>
      {card(b, {
        side: "before",
        label: labels.before || "HIỆN TẠI",
        t: p,
        accent: P.red,
        dim: true,
      })}

      <div
        style={{
          alignSelf: "center",
          opacity: interpolate(frame, [10, 22], [0, 1], CL),
          transform: `scale(${interpolate(frame, [10, 26], [0.6, 1], CL)})`,
        }}
      >
        <svg width={46} height={46} viewBox="0 0 24 24">
          <path
            d="M12 4v13M6.5 12.5L12 18l5.5-5.5"
            stroke={P.sky}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${P.sky}aa)` }}
          />
        </svg>
      </div>

      <Panel
        style={{
          width: 900,
          borderColor: `${P.green}66`,
          boxShadow: `0 28px 70px -30px ${P.green}77`,
          opacity: Math.min(1, Math.max(0, pAfter)),
          transform: `translateX(${interpolate(pAfter, [0, 1], [70, 0])}px)`,
          clipPath: wipe
            ? `inset(0 ${interpolate(pAfter, [0, 1], [100, 0], CL)}% 0 0)`
            : undefined,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3.4,
            color: P.green,
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          {labels.after || "SAU KHI ĐỔI"}
        </div>
        <div style={{ fontSize: 46, fontWeight: 900, color: P.text, lineHeight: 1.16 }}>
          {a.title || ""}
        </div>
        {a.description ? (
          <div style={{ fontSize: 28, color: P.dim, marginTop: 12, lineHeight: 1.4 }}>
            {a.description}
          </div>
        ) : null}
        {asArray(a.points).length ? (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {asArray(a.points)
              .slice(0, 4)
              .map((pt: any, i: number) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 25, color: P.dim }}
                >
                  <span style={{ color: P.green, fontWeight: 900 }}>✓</span>
                  <span>{String(pt)}</span>
                </div>
              ))}
          </div>
        ) : null}
      </Panel>
    </div>
  );
};

// ═══ 3. TIMELINE FLOW ════════════════════════════════════════════════════════
// Các mốc thời gian hiện lần lượt, đường nối được vẽ dần.
export const TimelineFlow: React.FC<any> = ({ events = [], title, unit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const list = asArray(events).slice(0, 5);

  if (!list.length) {
    return (
      <div style={{ width: 900, fontFamily: FONT, fontSize: 52, color: P.dim }}>
        (chưa có mốc thời gian)
      </div>
    );
  }

  // Giãn theo độ dài cảnh: mốc cuối phải hiện trước ~60% thời lượng, không thì cảnh ngắn sẽ cụt
  const STEP = Math.max(14, Math.min(150, (durationInFrames * 0.6) / list.length));
  const lineP = interpolate(frame, [8, 8 + STEP * list.length], [0, 1], CL);

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      {title ? (
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3.6,
            color: P.sky,
            marginBottom: 34,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
      ) : null}

      <div style={{ position: "relative", paddingLeft: 74 }}>
        {/* Đường dọc vẽ dần */}
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 12,
            width: 3,
            height: `calc(100% - 24px)`,
            background: P.line,
            borderRadius: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 12,
            width: 3,
            height: `calc((100% - 24px) * ${lineP})`,
            background: `linear-gradient(180deg, ${P.sky}, ${P.violet})`,
            borderRadius: 3,
            boxShadow: `0 0 16px ${P.sky}88`,
          }}
        />

        {list.map((e: any, i: number) => {
          const d = 8 + i * STEP;
          const p = spring({ frame: Math.max(0, frame - d), fps: 30, config: { damping: 16, mass: 0.7 } });
          const dot = interpolate(frame, [d, d + 12], [0, 1], CL);
          return (
            <div key={i} style={{ position: "relative", marginBottom: 30 }}>
              {/* Chấm mốc */}
              <div
                style={{
                  position: "absolute",
                  left: -60,
                  top: 8,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: i === 0 ? P.sky : P.ink,
                  border: `3px solid ${i === 0 ? P.sky : P.violet}`,
                  boxShadow: `0 0 20px ${i === 0 ? P.sky : P.violet}99`,
                  transform: `scale(${dot})`,
                }}
              />
              <div
                style={{
                  opacity: Math.min(1, Math.max(0, p)),
                  transform: `translateX(${interpolate(p, [0, 1], [34, 0])}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: 2,
                    color: P.violet,
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {e.date || e.when || ""}
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: P.text, lineHeight: 1.24 }}>
                  {e.title || ""}
                </div>
                {e.description ? (
                  <div style={{ fontSize: 25, color: P.dim, marginTop: 6, lineHeight: 1.38 }}>
                    {e.description}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {unit ? (
        <div style={{ marginTop: 10, fontSize: 22, color: P.faint, textAlign: "right" }}>{unit}</div>
      ) : null}
    </div>
  );
};

// ═══ 4. PROCESS DIAGRAM ══════════════════════════════════════════════════════
// Các node + mũi tên nối, xuất hiện theo từng bước.
export const ProcessDiagram: React.FC<any> = ({ nodes = [], title, direction = "down" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const list = asArray(nodes).slice(0, 5);

  if (!list.length) {
    return (
      <div style={{ width: 900, fontFamily: FONT, fontSize: 52, color: P.dim }}>
        (chưa có bước nào)
      </div>
    );
  }

  // Giãn theo độ dài cảnh, cùng lý do với TimelineFlow
  const STEP = Math.max(14, Math.min(120, (durationInFrames * 0.6) / list.length));
  const zigzag = direction !== "down";

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      {title ? (
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3.6,
            color: P.sky,
            marginBottom: 30,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {list.map((n: any, i: number) => {
          const d = i * STEP;
          const p = spring({ frame: Math.max(0, frame - d), fps: 30, config: { damping: 15, mass: 0.7 } });
          const side = zigzag && i % 2 === 1;
          const accent = tone(n.tone || (i === 0 ? "sky" : i === list.length - 1 ? "green" : "blue"));

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  alignSelf: side ? "flex-end" : "flex-start",
                  maxWidth: 640,
                  opacity: Math.min(1, Math.max(0, p)),
                  transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${interpolate(
                    p,
                    [0, 1],
                    [0.94, 1]
                  )})`,
                }}
              >
                <Panel
                  style={{
                    padding: "24px 30px",
                    borderColor: `${accent}55`,
                    boxShadow: `0 20px 50px -28px ${accent}99`,
                  }}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div
                      style={{
                        minWidth: 46,
                        height: 46,
                        borderRadius: 23,
                        background: `${accent}22`,
                        border: `2px solid ${accent}`,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 24,
                        fontWeight: 900,
                        color: accent,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 34, fontWeight: 800, color: P.text, lineHeight: 1.2 }}>
                        {n.label || n.title || ""}
                      </div>
                      {n.sub || n.description ? (
                        <div style={{ fontSize: 24, color: P.dim, marginTop: 4 }}>
                          {n.sub || n.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Panel>
              </div>

              {i < list.length - 1 ? (
                <div
                  style={{
                    // Canh mũi tên theo phía của NODE KẾ TIẾP, không phải node hiện tại
                    alignSelf: zigzag && (i + 1) % 2 === 1 ? "flex-end" : "flex-start",
                    marginLeft: zigzag && (i + 1) % 2 === 1 ? 0 : 60,
                    marginRight: zigzag && (i + 1) % 2 === 1 ? 60 : 0,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    opacity: interpolate(frame, [d + 10, d + 26], [0, 1], CL),
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div
                      style={{
                        width: 2,
                        height: 28,
                        background: `linear-gradient(180deg, ${accent}00, ${accent})`,
                      }}
                    />
                    <svg width={22} height={18} viewBox="0 0 22 18">
                      <path d="M11 17L1 2h20L11 17z" fill={accent} opacity={0.9} />
                    </svg>
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ═══ 5. DATA STORY ═══════════════════════════════════════════════════════════
// Biểu đồ chọn theo dữ liệu: bars | line | donut. Số đếm lên.
export const DataStory: React.FC<any> = ({
  chartType = "bars",
  data = [],
  unit,
  title,
  note,
}) => {
  const frame = useCurrentFrame();
  const items = asArray(data).slice(0, 6);
  const max = Math.max(...items.map((d: any) => Math.abs(Number(d.value) || 0)), 1);

  if (!items.length) {
    return (
      <div style={{ width: 900, fontFamily: FONT, fontSize: 52, color: P.dim }}>
        (chưa có dữ liệu — không vẽ biểu đồ)
      </div>
    );
  }

  const head = (
    <>
      {title ? (
        <div style={{ fontSize: 32, fontWeight: 800, color: P.text, marginBottom: 8, lineHeight: 1.24 }}>
          {title}
        </div>
      ) : null}
      {unit ? (
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
            color: P.sky,
            marginBottom: 26,
            textTransform: "uppercase",
          }}
        >
          {unit}
        </div>
      ) : null}
    </>
  );

  if (chartType === "line") {
    const W = 900;
    const H = 520;
    const pad = 46;
    // Trục bắt đầu quanh giá trị nhỏ nhất (không phải 0) — nếu không, mọi đường
    // xu hướng đều bẹt thành gần như nằm ngang và không nói lên điều gì.
    const vals = items.map((d: any) => Number(d.value) || 0);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const spread = hi - lo || Math.abs(hi) * 0.2 || 1;
    const min = lo - spread * 0.25;
    const span = hi + spread * 0.25 - min || 1;
    const pts = items.map((d: any, i: number) => {
      const x = pad + (i / Math.max(1, items.length - 1)) * (W - pad * 2);
      const y = H - pad - ((Number(d.value) - min) / span) * (H - pad * 2);
      return [x, y] as [number, number];
    });
    const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const prog = interpolate(frame, [10, 10 + items.length * 22], [0, 1], CL);

    return (
      <div style={{ width: 900, fontFamily: FONT }}>
        {head}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {[0, 0.5, 1].map((g) => (
            <line
              key={g}
              x1={pad}
              x2={W - pad}
              y1={pad + g * (H - pad * 2)}
              y2={pad + g * (H - pad * 2)}
              stroke={P.line}
              strokeWidth={1.5}
              strokeDasharray="6 8"
            />
          ))}
          <path
            d={path}
            fill="none"
            stroke={P.sky}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - prog}
            style={{ filter: `drop-shadow(0 0 14px ${P.sky}aa)` }}
          />
          {pts.map(([x, y], i) => {
            const d = 10 + (i / Math.max(1, items.length - 1)) * items.length * 22;
            const on = interpolate(frame, [d, d + 10], [0, 1], CL);
            return (
              <g key={i} opacity={on}>
                <circle cx={x} cy={y} r={11} fill={P.ink} stroke={P.sky} strokeWidth={4} />
                <text
                  x={x}
                  y={y - 26}
                  textAnchor="middle"
                  fill={P.text}
                  fontSize={26}
                  fontWeight={800}
                  fontFamily={FONT}
                >
                  {viNum(Number(items[i].value) || 0)}
                </text>
                <text
                  x={x}
                  y={H - 8}
                  textAnchor="middle"
                  fill={P.dim}
                  fontSize={21}
                  fontFamily={FONT}
                >
                  {String(items[i].label || "").slice(0, 12)}
                </text>
              </g>
            );
          })}
        </svg>
        {note ? (
          <div style={{ fontSize: 21, color: P.faint, marginTop: 22 }}>{note}</div>
        ) : null}
      </div>
    );
  }

  if (chartType === "donut") {
    const R = 190;
    const C = 2 * Math.PI * R;
    let acc = 0;
    const total = items.reduce((n: number, d: any) => n + (Number(d.value) || 0), 0) || 1;
    const prog = interpolate(frame, [8, 60], [0, 1], CL);
    const COLORS = [P.sky, P.violet, P.green, P.amber, P.blue, P.red];

    return (
      <div style={{ width: 900, fontFamily: FONT }}>
        {head}
        <div style={{ display: "flex", gap: 46, alignItems: "center" }}>
          <svg width={R * 2 + 30} height={R * 2 + 30} viewBox={`0 0 ${R * 2 + 30} ${R * 2 + 30}`}>
            <g transform={`translate(${R + 15},${R + 15}) rotate(-90)`}>
              <circle r={R} fill="none" stroke={P.line} strokeWidth={34} />
              {items.map((d: any, i: number) => {
                const frac = (Number(d.value) || 0) / total;
                const seg = frac * prog;
                const el = (
                  <circle
                    key={i}
                    r={R}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={34}
                    strokeDasharray={`${(seg * C).toFixed(1)} ${C.toFixed(1)}`}
                    strokeDashoffset={-(acc * C).toFixed(1)}
                    strokeLinecap="butt"
                  />
                );
                acc += frac;
                return el;
              })}
            </g>
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((d: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  fontSize: 25,
                  opacity: interpolate(frame, [12 + i * 6, 22 + i * 6], [0, 1], CL),
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: COLORS[i % COLORS.length],
                  }}
                />
                <span style={{ color: P.dim }}>{String(d.label || "")}</span>
                <span style={{ color: P.text, fontWeight: 800, marginLeft: "auto" }}>
                  {viNum(Number(d.value) || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
        {note ? <div style={{ fontSize: 21, color: P.faint, marginTop: 10 }}>{note}</div> : null}
      </div>
    );
  }

  // bars (mặc định)
  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      {head}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {items.map((d: any, i: number) => {
          const v = Number(d.value) || 0;
          const d0 = 10 + i * 9;
          const target = (Math.abs(v) / max) * 100;
          const w = interpolate(frame, [d0, d0 + 34], [0, target], CL);
          const accent = tone(d.tone || (d.highlight ? "sky" : "blue"));
          const shown = viNum(v * (target ? w / target : 0));
          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 9,
                  fontSize: 26,
                  opacity: interpolate(frame, [d0, d0 + 12], [0, 1], CL),
                }}
              >
                <span style={{ color: d.highlight ? P.text : P.dim, fontWeight: d.highlight ? 800 : 600 }}>
                  {String(d.label || "")}
                </span>
                <span style={{ color: accent, fontWeight: 900, fontSize: 30 }}>{shown}</span>
              </div>
              <div style={{ height: 20, background: P.line, borderRadius: 10, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${w}%`,
                    height: "100%",
                    borderRadius: 10,
                    background: `linear-gradient(90deg, ${accent}99, ${accent})`,
                    boxShadow: `0 0 18px ${accent}77`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {note ? <div style={{ fontSize: 21, color: P.faint, marginTop: 20 }}>{note}</div> : null}
    </div>
  );
};

// ═══ 6. FLOATING UI ══════════════════════════════════════════════════════════
// Cửa sổ website / dashboard / thẻ tính năng bay vào, xếp lớp tạo chiều sâu.
export const FloatingUI: React.FC<any> = ({
  cards = [],
  layout = "stack",
  depth = 1,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = asArray(cards).slice(0, 4);

  if (!list.length) {
    return (
      <div style={{ width: 900, fontFamily: FONT, fontSize: 52, color: P.dim }}>
        (chưa có thẻ nào)
      </div>
    );
  }

  // Khoảng cách phải đủ lớn để thẻ sau không che mất tiêu đề thẻ trước.
  // Thẻ cao ~340px, nên bước 250px là mức chồng lấp còn đọc được.
  const POS: Record<string, Array<{ x: number; y: number; rot: number; s: number }>> = {
    stack: [
      { x: -52, y: -250, rot: -5, s: 0.86 },
      { x: 50, y: 0, rot: 3, s: 0.93 },
      { x: -20, y: 250, rot: -2, s: 1 },
    ],
    fan: [
      { x: -160, y: 40, rot: -12, s: 0.86 },
      { x: 160, y: 60, rot: 12, s: 0.86 },
      { x: 0, y: -190, rot: 0, s: 1 },
    ],
    grid: [
      { x: -215, y: -190, rot: -2, s: 0.8 },
      { x: 215, y: -190, rot: 2, s: 0.8 },
      { x: -215, y: 200, rot: 2, s: 0.8 },
      { x: 215, y: 200, rot: -2, s: 0.8 },
    ],
  };
  const pos = POS[layout] || POS.stack;

  return (
    <div
      style={{
        width: 900,
        height: 1000,
        position: "relative",
        fontFamily: FONT,
        perspective: 1200 * depth,
      }}
    >
      {list.map((c: any, i: number) => {
        const p = pos[i % pos.length];
        const sp = spring({
          frame: Math.max(0, frame - i * 9),
          fps,
          config: { damping: 15, mass: 0.8 },
        });
        const accent = tone(c.accent || accentColor);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 560,
              marginLeft: -280,
              marginTop: -170,
              opacity: Math.min(1, Math.max(0, sp)),
              transform: `translate3d(${p.x * sp}px, ${p.y + (1 - sp) * 120}px, ${
                i * 40 * depth
              }px) rotate(${p.rot}deg) scale(${p.s})`,
              zIndex: 10 + i,
            }}
          >
            <div
              style={{
                background: "rgba(11,17,32,0.94)",
                border: `1px solid ${P.line}`,
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: `0 ${28 + i * 10}px ${60 + i * 14}px -24px rgba(0,0,0,0.9), 0 0 0 1px ${
                  accent}22, 0 22px 60px -34px ${accent}aa`,
              }}
            >
              {/* thanh tiêu đề kiểu cửa sổ */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 18px",
                  borderBottom: `1px solid ${P.line}`,
                  background: "rgba(148,163,184,0.06)",
                }}
              >
                <span style={{ width: 11, height: 11, borderRadius: 6, background: "#F87171" }} />
                <span style={{ width: 11, height: 11, borderRadius: 6, background: "#FBBF24" }} />
                <span style={{ width: 11, height: 11, borderRadius: 6, background: "#34D399" }} />
                <span style={{ marginLeft: 12, fontSize: 19, color: P.faint, fontWeight: 600 }}>
                  {String(c.kind || c.title || "app").slice(0, 26)}
                </span>
              </div>

              <div style={{ padding: "22px 22px 26px" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: P.text, marginBottom: 6 }}>
                  {String(c.title || "")}
                </div>
                {c.sub || c.description ? (
                  <div style={{ fontSize: 22, color: P.dim, marginBottom: 16, lineHeight: 1.36 }}>
                    {String(c.sub || c.description)}
                  </div>
                ) : null}

                {/* Skeleton nội dung — cho cảm giác UI thật */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[100, 78, 90, 62].slice(0, c.lines ? Math.min(4, Number(c.lines)) : 4).map((w, k) => (
                    <div
                      key={k}
                      style={{
                        height: 12,
                        width: `${w}%`,
                        borderRadius: 6,
                        background: k === 0 ? `${accent}55` : "rgba(148,163,184,0.16)",
                        transform: `scaleX(${interpolate(
                          frame,
                          [10 + i * 6 + k * 3, 26 + i * 6 + k * 3],
                          [0, 1],
                          CL
                        )})`,
                        transformOrigin: "left",
                      }}
                    />
                  ))}
                </div>

                {c.metric ? (
                  <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 46, fontWeight: 900, color: accent }}>{String(c.metric)}</span>
                    {c.metricLabel ? (
                      <span style={{ fontSize: 21, color: P.faint }}>{String(c.metricLabel)}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══ 7. NETWORK MOTION ═══════════════════════════════════════════════════════
// Node, đường nối, hạt sáng chuyển động — cho mạng lưới / hệ sinh thái / dữ liệu.
export const NetworkMotion: React.FC<any> = ({
  nodes = 14,
  edges = 2,
  density = 1,
  color,
  caption,
  labels = [],
}) => {
  const frame = useCurrentFrame();
  const seed = 1337;

  const count = Math.max(5, Math.min(24, Number(Array.isArray(nodes) ? nodes.length : nodes) || 14));
  const accent = tone(color || "sky");

  const pts = React.useMemo(() => {
    const r2 = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const ang = (i / count) * Math.PI * 2 + r2() * 0.5;
      const rad = 250 + r2() * 190;
      return {
        x: 450 + Math.cos(ang) * rad,
        y: 470 + Math.sin(ang) * rad * 0.92,
        r: 7 + r2() * 9,
        phase: r2() * Math.PI * 2,
      };
    });
  }, [count]);

  const links = React.useMemo(() => {
    const out: Array<[number, number]> = [];
    const per = Math.max(1, Math.min(4, Number(edges) || 2));
    for (let i = 0; i < count; i++) {
      const dists = pts
        .map((p, j) => ({ j, d: Math.hypot(p.x - pts[i].x, p.y - pts[i].y) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, per);
      for (const { j } of dists) if (j > i) out.push([i, j]);
    }
    return out;
  }, [pts, count, edges]);

  const labelList = asArray(labels);

  return (
    <div style={{ width: 900, fontFamily: FONT, position: "relative" }}>
      <svg width={900} height={960} viewBox="0 0 900 960" style={{ overflow: "visible" }}>
        {links.map(([a, b], i) => {
          const A = pts[a];
          const B = pts[b];
          const on = interpolate(frame, [i * 1.6, i * 1.6 + 22], [0, 1], CL);
          const travel = ((frame * 0.012 + i * 0.17) % 1) * on;
          return (
            <g key={i}>
              <line
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={accent}
                strokeWidth={1.6}
                opacity={0.16 * on * density}
              />
              <circle
                cx={A.x + (B.x - A.x) * travel}
                cy={A.y + (B.y - A.y) * travel}
                r={3.4}
                fill={accent}
                opacity={0.85 * on}
              />
            </g>
          );
        })}

        {pts.map((p, i) => {
          const pulse = 0.55 + 0.45 * Math.sin(frame * 0.09 + p.phase);
          const on = interpolate(frame, [i * 2.2, i * 2.2 + 20], [0, 1], CL);
          return (
            <g key={i} opacity={on}>
              <circle cx={p.x} cy={p.y} r={p.r * 3.4} fill={accent} opacity={0.1 * pulse * density} />
              <circle cx={p.x} cy={p.y} r={p.r} fill={accent} opacity={0.55 + 0.45 * pulse} />
              {labelList[i] ? (
                <text
                  x={p.x}
                  y={p.y - p.r - 14}
                  textAnchor="middle"
                  fill={P.dim}
                  fontSize={20}
                  fontWeight={700}
                  fontFamily={FONT}
                >
                  {String(labelList[i])}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {caption ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -10,
            textAlign: "center",
            fontSize: 30,
            fontWeight: 800,
            color: P.text,
            opacity: interpolate(frame, [26, 44], [0, 1], CL),
          }}
        >
          {String(caption)}
        </div>
      ) : null}
    </div>
  );
};

// ═══ 8. BRAND END CARD ═══════════════════════════════════════════════════════
// Outro thương hiệu: tên, thông điệp, CTA, liên hệ.
export const BrandEndCard: React.FC<any> = ({ brand, headline, cta, contact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p1 = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  const p2 = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 14, mass: 0.7 } });
  const p3 = spring({ frame: Math.max(0, frame - 26), fps, config: { damping: 14, mass: 0.7 } });

  return (
    <div
      style={{
        width: 900,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 132,
          height: 132,
          borderRadius: 36,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(140deg, ${P.sky}33, ${P.violet}33)`,
          border: `2px solid ${P.sky}66`,
          boxShadow: `0 0 60px -12px ${P.sky}88`,
          marginBottom: 34,
          opacity: Math.min(1, Math.max(0, p1)),
          transform: `scale(${interpolate(p1, [0, 1], [0.5, 1])}) rotate(${interpolate(
            p1,
            [0, 1],
            [-14, 0]
          )}deg)`,
        }}
      >
        <div
          style={{
            fontSize: 62,
            fontWeight: 900,
            background: `linear-gradient(120deg, ${P.sky}, ${P.violet})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {String(brand || "N").trim().charAt(0).toUpperCase()}
        </div>
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 6,
          color: P.sky,
          textTransform: "uppercase",
          marginBottom: 22,
          opacity: Math.min(1, Math.max(0, p2)),
          transform: `translateY(${interpolate(p2, [0, 1], [26, 0])}px)`,
        }}
      >
        {String(brand || "NEXO STUDIO")}
      </div>

      <div
        style={{
          fontSize: 58,
          fontWeight: 900,
          color: P.text,
          lineHeight: 1.2,
          letterSpacing: -1.2,
          opacity: Math.min(1, Math.max(0, p2)),
          transform: `translateY(${interpolate(p2, [0, 1], [30, 0])}px)`,
        }}
      >
        {String(headline || "")}
      </div>

      {cta ? (
        <div
          style={{
            marginTop: 44,
            padding: "22px 52px",
            borderRadius: 999,
            background: `linear-gradient(120deg, ${P.sky}, ${P.violet})`,
            color: "#050810",
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: 0.4,
            boxShadow: `0 24px 60px -20px ${P.sky}cc`,
            opacity: Math.min(1, Math.max(0, p3)),
            transform: `translateY(${interpolate(p3, [0, 1], [34, 0])}px) scale(${interpolate(
              p3,
              [0, 1],
              [0.9, 1]
            )})`,
          }}
        >
          {String(cta)}
        </div>
      ) : null}

      {contact ? (
        <div
          style={{
            marginTop: 26,
            fontSize: 25,
            color: P.dim,
            opacity: Math.min(1, Math.max(0, p3)),
          }}
        >
          {String(contact)}
        </div>
      ) : null}
    </div>
  );
};

// ─── Đăng ký: id trong JSON -> component ─────────────────────────────────────
export const MOTION_KIT: Record<string, React.FC<any>> = {
  kineticheadline: KineticHeadline,
  beforeafter: BeforeAfter,
  timelineflow: TimelineFlow,
  processdiagram: ProcessDiagram,
  datastory: DataStory,
  floatingui: FloatingUI,
  networkmotion: NetworkMotion,
  brandendcard: BrandEndCard,
};

// ═══ LỚP NỀN THEO CẢNH (không phải scene) ════════════════════════════════════
// Dùng qua prop "backdrop" của cảnh, KHÔNG đăng ký thành type — nếu thành scene
// thì AI sẽ tạo ra cảnh chỉ có nền, không có nội dung.
export const SceneBackdrop: React.FC<{
  preset?: string;
  intensity?: number;
  palette?: string;
}> = ({ preset = "grid", intensity = 1, palette }) => {
  const frame = useCurrentFrame();
  const accent = tone(palette || "sky");
  const seed = 4242;

  const dots = React.useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 46 }, () => ({
      x: r() * 1080,
      y: r() * 1920,
      s: 1 + r() * 3.4,
      v: 0.15 + r() * 0.5,
      ph: r() * Math.PI * 2,
    }));
  }, []);

  const rings = React.useMemo(() => {
    const r = rng(seed + 1);
    return Array.from({ length: 5 }, (_, i) => ({ base: 190 + i * 130, sp: 0.35 + r() * 0.4 }));
  }, []);

  if (!preset || preset === "none") return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intensity }}>
      {preset === "grid" ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${accent}12 1px, transparent 1px), linear-gradient(90deg, ${accent}12 1px, transparent 1px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0px ${(frame * 0.35) % 90}px`,
            maskImage: "radial-gradient(circle at 50% 45%, #000 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 45%, #000 20%, transparent 78%)",
          }}
        />
      ) : null}

      {preset === "particles" ? (
        <AbsoluteFill>
          {dots.map((d, i) => {
            const y = (d.y - frame * d.v * 2.2) % 1920;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: d.x,
                  top: y < 0 ? y + 1920 : y,
                  width: d.s,
                  height: d.s,
                  borderRadius: d.s,
                  background: accent,
                  opacity: 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(frame * 0.05 + d.ph)),
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}

      {preset === "rings" ? (
        <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
          {rings.map((r, i) => {
            const rad = r.base + ((frame * r.sp) % 130);
            const op = Math.max(0, 1 - (rad - r.base) / 130) * 0.2;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: rad * 2,
                  height: rad * 2,
                  borderRadius: "50%",
                  border: `2px solid ${accent}`,
                  opacity: op,
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}

      {preset === "beams" ? (
        <AbsoluteFill>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 120 + i * 300,
                top: -300,
                width: 160,
                height: 2400,
                background: `linear-gradient(180deg, transparent, ${accent}22, transparent)`,
                transform: `rotate(${14 + i * 6}deg) translateY(${((frame * (0.6 + i * 0.2)) % 400) - 200}px)`,
                filter: "blur(26px)",
              }}
            />
          ))}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
