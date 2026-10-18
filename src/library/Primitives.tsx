import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { P, FONT, enterStyle } from "../VideoTemplate/MotionVisuals";

// ═════════════════════════════════════════════════════════════════════════════
// THƯ VIỆN PRIMITIVE — component dùng lại được, điều khiển bằng dữ liệu.
//
// Mỗi component ở đây KHÔNG gắn với một tin cụ thể. Nó nhận tham số, nên video
// sau (tin khác) vẫn dùng được. Đây là thứ khiến freeform mạnh dần lên.
//
// Không gian nội dung: rộng 900px. Mọi giá trị đều bị kẹp để JSON hỏng không
// làm vỡ bố cục.
// ═════════════════════════════════════════════════════════════════════════════

const CL = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const cl = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const viNum = (n: number, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [i, d] = s.split(".");
  const gi = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return d ? `${gi},${d}` : gi;
};

const mulberry = (s: number) => {
  let a = s;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
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
const tone = (t?: string) => TONE[t || "sky"] || P.sky;

// ─── Đầu cảnh dùng chung ────────────────────────────────────────────────────
const Head: React.FC<{
  eyebrow?: string;
  headline?: string;
  big?: string;
  unit?: string;
  unitTone?: string;
  delay?: number;
}> = ({ eyebrow, headline, big, unit, unitTone = "sky", delay = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = enterStyle(frame, fps, delay, { y: 24, scale: 0.96 });

  return (
    <div style={{ opacity: s.opacity, transform: s.transform }}>
      {eyebrow ? (
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "3px",
            color: P.faint,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      ) : null}

      {big ? (
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: "-5px",
              lineHeight: 0.95,
              color: P.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {big}
          </div>
          {unit ? (
            <div style={{ fontSize: 30, fontWeight: 800, color: tone(unitTone) }}>{unit}</div>
          ) : null}
        </div>
      ) : null}

      {headline ? (
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: P.text,
            letterSpacing: "-1px",
            marginTop: big ? 10 : 8,
            lineHeight: 1.25,
          }}
        >
          {headline}
        </div>
      ) : null}
    </div>
  );
};

const Caption: React.FC<{ text?: string; delay?: number }> = ({ text, delay = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!text) return null;
  const s = enterStyle(frame, fps, delay, { y: 16, scale: 1 });
  return (
    <div
      style={{
        marginTop: 24,
        fontSize: 22,
        lineHeight: 1.5,
        color: "rgba(248,250,252,0.5)",
        opacity: s.opacity,
        transform: s.transform,
      }}
    >
      {text}
    </div>
  );
};

// ─── 1. GRID — lưới N ô, M ô bật sáng ──────────────────────────────────────
// Dùng cho: mật độ, tỷ lệ, "chỉ một phần nhỏ hoạt động", phân bố.
export const GridScene: React.FC<any> = ({
  eyebrow,
  headline,
  cols = 27,
  total = 100,
  active = 5,
  activeUnit = "",
  totalUnit = "",
  showPercent = true,
  percentLabel,
  caption,
  cellGap = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const C = cl(Math.round(num(cols, 27)), 4, 40);
  const T = cl(Math.round(num(total, 100)), 2, 1200);
  const A = cl(Math.round(num(active, Math.max(1, Math.round(T * 0.05)))), 1, T);

  const gap = cl(num(cellGap, 3), 1, 12);
  const cell = Math.max(6, Math.min(38, Math.floor((900 - gap * (C - 1)) / C)));

  // Chọn A ô rải đều, có seed để render lần nào cũng giống nhau
  const activeIdx = React.useMemo(() => {
    const r = mulberry(7919 + T * 31 + A);
    const set = new Set<number>();
    for (let k = 0; k < A; k++) {
      const base = Math.floor((k + 0.5) * (T / A));
      const j = Math.floor((r() - 0.5) * (T / A) * 0.5);
      set.add(cl(base + j, 0, T - 1));
    }
    let guard = 0;
    while (set.size < A && guard++ < 2000) set.add(Math.floor(r() * T));
    return [...set].sort((a, b) => a - b);
  }, [T, A]);

  const order = React.useMemo(
    () => new Map(activeIdx.map((idx, k) => [idx, k])),
    [activeIdx]
  );

  const rows = Math.ceil(T / C);
  const cx = (C - 1) / 2;
  const cy = (rows - 1) / 2;
  const igniteAt = 22;
  const step = Math.max(2, Math.round(90 / Math.max(1, A)));

  // Đếm khớp đúng nhịp các ô bật sáng
  const count = Math.round(interpolate(frame, [igniteAt, igniteAt + step * A], [0, A], CL));
  const pct = interpolate(frame, [igniteAt + step * A, igniteAt + step * A + 34], [0, (A / T) * 100], CL);

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
        }}
      >
        <Head eyebrow={eyebrow} headline={headline} />
        <div style={{ textAlign: "right", minWidth: 130 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-3px",
              color: P.sky,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: P.faint, marginTop: 6 }}>
            / {viNum(T)} {totalUnit}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${C}, ${cell}px)`,
          gap,
        }}
      >
        {Array.from({ length: T }, (_, i) => {
          const col = i % C;
          const row = Math.floor(i / C);
          const dist = Math.hypot(col - cx, row - cy);
          const appear = interpolate(frame, [dist * 0.8, dist * 0.8 + 12], [0, 1], CL);
          const isOn = order.has(i);
          const k = order.get(i) ?? 0;
          const p = isOn
            ? spring({
                frame: Math.max(0, frame - (igniteAt + k * step)),
                fps,
                config: { damping: 12, mass: 0.5 },
              })
            : 0;
          const lit = cl(p, 0, 1);

          return (
            <div
              key={i}
              style={{
                width: cell,
                height: cell,
                borderRadius: Math.max(3, cell * 0.22),
                background:
                  lit > 0.01
                    ? `linear-gradient(135deg, ${P.sky}, ${P.violet})`
                    : "rgba(148,163,184,0.16)",
                opacity: appear * (lit > 0.01 ? 1 : 0.85),
                transform: `scale(${lit > 0.01 ? 1 + lit * 0.26 : 1})`,
                boxShadow:
                  lit > 0.01
                    ? `0 0 ${14 + lit * 20}px rgba(56,189,248,${0.5 * lit})`
                    : "none",
              }}
            />
          );
        })}
      </div>

      {showPercent ? (
        <div
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            opacity: interpolate(frame, [igniteAt + step * A, igniteAt + step * A + 18], [0, 1], CL),
          }}
        >
          <div
            style={{
              fontSize: 62,
              fontWeight: 900,
              letterSpacing: "-2px",
              backgroundImage: `linear-gradient(100deg, ${P.sky}, ${P.violet})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {pct.toFixed(1).replace(".", ",")}%
          </div>
          <div style={{ fontSize: 25, fontWeight: 700, color: P.dim, paddingBottom: 7 }}>
            {percentLabel || "trên tổng số"}
          </div>
        </div>
      ) : null}

      <Caption text={caption} delay={igniteAt + step * A + 20} />
    </div>
  );
};

// ─── 2. RACK — số lượng lớn, mỗi hàng là một mốc ───────────────────────────
// Dùng cho: số GPU, số server, số cửa hàng, số nhân viên… bất cứ khi nào con số
// quá lớn để vẽ từng đơn vị.
export const RackScene: React.FC<any> = ({
  eyebrow,
  headline,
  rows = 8,
  perRow = 20,
  perRowValue,
  total = 1000,
  unit = "",
  unitTone = "amber",
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const R = cl(Math.round(num(rows, 8)), 1, 16);
  const PR = cl(Math.round(num(perRow, 20)), 4, 40);
  const T = Math.max(1, num(total, 1000));
  const rowVal = num(perRowValue, T / R);
  const count = Math.round(interpolate(frame, [16, 150], [0, T], CL));

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <Head
        eyebrow={eyebrow}
        headline={headline}
        big={viNum(count)}
        unit={unit}
        unitTone={unitTone}
      />

      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "20px 22px",
          borderRadius: 22,
          border: `1px solid ${P.line}`,
          background: "rgba(15,23,42,0.6)",
        }}
      >
        {Array.from({ length: R }, (_, r) => {
          const rowDelay = 12 + r * 7;
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 72,
                  fontSize: 15,
                  fontWeight: 800,
                  color: P.faint,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {viNum(rowVal)}
              </div>
              <div style={{ display: "flex", gap: 5, flex: 1 }}>
                {Array.from({ length: PR }, (_, c) => {
                  const p = spring({
                    frame: Math.max(0, frame - (rowDelay + c * 1.5)),
                    fps,
                    config: { damping: 14, mass: 0.5 },
                  });
                  const lit = cl(p, 0, 1);
                  const col = tone(unitTone);
                  return (
                    <div
                      key={c}
                      style={{
                        flex: 1,
                        height: 18,
                        borderRadius: 4,
                        background:
                          lit > 0.05
                            ? `linear-gradient(180deg, ${col}, ${col}99)`
                            : "rgba(148,163,184,0.12)",
                        opacity: 0.35 + lit * 0.65,
                        boxShadow: lit > 0.05 ? `0 0 10px ${col}66` : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Caption
        text={
          caption ||
          (perRowValue
            ? `Mỗi hàng tượng trưng ${viNum(rowVal)} ${unit}`
            : undefined)
        }
        delay={90}
      />
    </div>
  );
};

// ─── 3. STREAM — dải khối trôi ngang, cho khối lượng dài vô tận ────────────
// Dùng cho: số token, số giao dịch, dòng thời gian dày đặc.
export const StreamScene: React.FC<any> = ({
  eyebrow,
  headline,
  blocks = 80,
  perBlock,
  total = 100000,
  unit = "",
  unitTone = "green",
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const B = cl(Math.round(num(blocks, 80)), 20, 140);
  const T = Math.max(1, num(total, 100000));
  const n = Math.round(interpolate(frame, [16, 150], [0, T], CL));
  const scroll = interpolate(frame, [0, 180], [0, -B * 6], CL);
  const bw = cl((900 - 4 * (B - 1)) / B, 3, 30);

  return (
    <div style={{ width: 900, fontFamily: FONT, overflow: "hidden" }}>
      <Head
        eyebrow={eyebrow}
        headline={headline}
        big={viNum(n)}
        unit={unit}
        unitTone={unitTone}
      />

      <div style={{ marginTop: 38, position: "relative", height: 200 }}>
        <div
          style={{
            display: "flex",
            gap: 4,
            transform: `translateX(${scroll}px)`,
            width: B * (bw + 4) * 2,
          }}
        >
          {Array.from({ length: B * 2 }, (_, i) => {
            const p = spring({
              frame: Math.max(0, frame - (8 + (i % B) * 1.0)),
              fps,
              config: { damping: 16, mass: 0.6 },
            });
            const h = 132 + ((i * 37) % 26);
            const col = tone(unitTone);
            return (
              <div
                key={i}
                style={{
                  width: bw,
                  height: h * cl(p, 0, 1),
                  borderRadius: 3,
                  alignSelf: "flex-end",
                  background: i % 7 === 0 ? `linear-gradient(180deg, ${col}, ${col}88)` : `${col}44`,
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${P.ink} 0%, transparent 12%, transparent 88%, ${P.ink} 100%)`,
            pointerEvents: "none",
          }}
        />
      </div>

      <Caption
        text={caption || (perBlock ? `Mỗi khối tượng trưng ${viNum(perBlock)} ${unit}` : undefined)}
        delay={80}
      />
    </div>
  );
};

// ─── 4. STAMP — con dấu + thanh so sánh tỷ lệ ──────────────────────────────
// Dùng cho: giấy phép, chứng nhận, phê duyệt, kèm so sánh các mức.
export const StampScene: React.FC<any> = ({
  stampText = "APACHE 2.0",
  subtitle,
  stampTone = "green",
  bars = [],
  barUnit,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 9, mass: 1.1 },
  });
  const ring = interpolate(frame, [10, 44], [0, 1], CL);
  const stampO = interpolate(frame, [6, 14], [0, 1], CL);
  const col = tone(stampTone);

  const items = Array.isArray(bars) ? bars.slice(0, 6) : [];
  const maxV = Math.max(...items.map((b: any) => Math.abs(num(b.value, 0))), 1);

  return (
    <div style={{ width: 900, fontFamily: FONT }}>
      <div style={{ position: "relative", height: 260, display: "grid", placeItems: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: `2px solid ${col}`,
            opacity: (1 - ring) * 0.5,
            transform: `scale(${0.4 + ring * 1.5})`,
          }}
        />

        <div
          style={{
            transform: `scale(${interpolate(slam, [0, 1], [2.4, 1])}) rotate(${interpolate(
              slam,
              [0, 1],
              [-16, -6]
            )}deg)`,
            opacity: stampO,
            border: `5px solid ${col}`,
            borderRadius: 18,
            padding: "18px 40px",
            color: col,
            fontSize: 62,
            fontWeight: 900,
            letterSpacing: "2px",
            background: `${col}14`,
            boxShadow: `0 0 60px ${col}55, inset 0 0 40px ${col}1F`,
          }}
        >
          {stampText}
        </div>
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 12,
            fontSize: 32,
            fontWeight: 800,
            color: P.text,
            textAlign: "center",
            lineHeight: 1.35,
            opacity: interpolate(frame, [20, 34], [0, 1], CL),
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {items.length ? (
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 18 }}>
          {items.map((b: any, i: number) => {
            const s = enterStyle(frame, fps, 44 + i * 9, { y: 24, scale: 0.97 });
            const w = spring({
              frame: Math.max(0, frame - (46 + i * 9)),
              fps,
              config: { damping: 18, mass: 0.8 },
            });
            const pctW = (Math.abs(num(b.value, 0)) / maxV) * 100 * cl(w, 0, 1);
            return (
              <div key={i} style={{ opacity: s.opacity, transform: s.transform }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 27, fontWeight: 900, color: P.text }}>{b.name}</div>
                  <div style={{ fontSize: 20, color: P.faint }}>{b.note}</div>
                </div>
                <div
                  style={{
                    height: 15,
                    borderRadius: 999,
                    background: "rgba(148,163,184,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pctW}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${P.sky}, ${P.violet})`,
                      boxShadow: "0 0 22px rgba(56,189,248,0.45)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <Caption text={caption || (barUnit ? `Thanh dài theo ${barUnit}` : undefined)} delay={100} />
    </div>
  );
};

// ─── Registry: để router tra cứu ────────────────────────────────────────────
export const LIBRARY_SCENES: Record<string, React.FC<any>> = {
  grid: GridScene,
  rack: RackScene,
  stream: StreamScene,
  stamp: StampScene,
};
