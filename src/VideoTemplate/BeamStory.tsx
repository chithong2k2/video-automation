import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { P, FONT, enterStyle, MotionBackground, OutroMark } from "./MotionVisuals";

// ═════════════════════════════════════════════════════════════════════════════
// BEAM — Reflection AI mở weights 501B, Apache 2.0 (16/10/2026)
//
// Video riêng cho tin này. Không dùng primitive chung nào của hệ FreeVideo.
// Mỗi cảnh là một component viết riêng cho đúng nội dung nó phải nói.
//
// Sự thật dùng trong video (đã đối chiếu nhiều nguồn):
//   · 501 tỷ tham số tổng, 23 tỷ kích hoạt mỗi token  → 4,6%
//   · Apache 2.0, weights lên Hugging Face ngày 16/10/2026
//   · ~10.500 GPU GB300, pre-train 4 tuần + RL 4 tuần
//   · cửa sổ ngữ cảnh 1.000.000 token
//   · checkpoint BF16 / FP8 / NVFP4
// ═════════════════════════════════════════════════════════════════════════════

const CL = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const viNum = (n: number, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [i, d] = s.split(".");
  const gi = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return d ? `${gi},${d}` : gi;
};

/** PRNG có seed — để mọi lần render ra đúng một bố cục, không nhấp nháy. */
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

const TOTAL = 501;
const ACTIVE = 23;
const COLS = 27;
const CELL = 30;
const GAP = 3;

/** 23 ô "thức dậy" — rải đều khắp lưới, không dồn một góc. */
const ACTIVE_IDX: number[] = (() => {
  const r = mulberry(20261016);
  const set = new Set<number>();
  for (let k = 0; k < ACTIVE; k++) {
    const base = Math.floor((k + 0.5) * (TOTAL / ACTIVE));
    const j = Math.floor((r() - 0.5) * 14);
    set.add(Math.min(TOTAL - 1, Math.max(0, base + j)));
  }
  let guard = 0;
  while (set.size < ACTIVE && guard++ < 500) {
    set.add(Math.floor(r() * TOTAL));
  }
  return [...set].sort((a, b) => a - b);
})();

const ORDER = new Map(ACTIVE_IDX.map((idx, order) => [idx, order]));

// ─── Lưới tham số dùng chung cho 2 cảnh đầu ─────────────────────────────────
const ParamGrid: React.FC<{
  ignite: boolean;
  igniteAt?: number;
  step?: number;
  reveal?: number;
  dim?: number;
}> = ({ ignite, igniteAt = 12, step = 4, reveal = 1, dim = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cx = (COLS - 1) / 2;
  const cy = (Math.ceil(TOTAL / COLS) - 1) / 2;

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
        gap: GAP,
        opacity: dim,
      }}
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const dist = Math.hypot(col - cx, row - cy);

        // Hiện dần từ tâm ra
        const appear = interpolate(
          frame,
          [dist * 0.9, dist * 0.9 + 14],
          [0, 1],
          CL
        );
        const isOn = ignite && ORDER.has(i);
        const order = ORDER.get(i) ?? 99;
        const onP = isOn
          ? spring({
              frame: Math.max(0, frame - (igniteAt + order * step)),
              fps,
              config: { damping: 12, mass: 0.5 },
            })
          : 0;
        const lit = Math.min(1, Math.max(0, onP));

        return (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 7,
              background: lit > 0.01
                ? `linear-gradient(135deg, ${P.sky}, ${P.violet})`
                : "rgba(148,163,184,0.16)",
              opacity: appear * reveal * (lit > 0.01 ? 1 : 0.85),
              transform: `scale(${lit > 0.01 ? 1 + lit * 0.28 : 1})`,
              boxShadow:
                lit > 0.01 ? `0 0 ${18 + lit * 22}px rgba(56,189,248,${0.55 * lit})` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

// ─── 1. COVER ───────────────────────────────────────────────────────────────
const BeamCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = enterStyle(frame, fps, 26, { y: 44, scale: 0.96 });
  const kicker = enterStyle(frame, fps, 14, { y: 20, scale: 1 });
  const sub = enterStyle(frame, fps, 58, { y: 22, scale: 1 });
  const veil = interpolate(frame, [30, 62], [0.30, 0.62], CL);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <ParamGrid ignite igniteAt={34} step={3} reveal={0.8} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(7,10,18,${veil})`,
          }}
        />
      </div>

      <div style={{ position: "relative", width: 900, textAlign: "left" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 30,
            opacity: kicker.opacity,
            transform: kicker.transform,
          }}
        >
          <div style={{ width: 52, height: 3, background: P.violet, borderRadius: 2 }} />
          <div
            style={{
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: "6px",
              color: P.violet,
              textTransform: "uppercase",
            }}
          >
            Open weights · 16/10/2026
          </div>
        </div>

        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: "-5px",
            color: P.text,
            opacity: title.opacity,
            transform: title.transform,
            textShadow: "0 14px 60px rgba(0,0,0,0.75)",
          }}
        >
          501 tỷ
          <br />
          tham số
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 40,
            fontWeight: 700,
            color: P.dim,
            lineHeight: 1.35,
            opacity: sub.opacity,
            transform: sub.transform,
          }}
        >
          vừa được thả miễn phí
          <span style={{ color: P.sky, fontWeight: 900 }}> cho tất cả</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── 2. CHỈ 23 TỶ THỨC DẬY ──────────────────────────────────────────────────
const AwakeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.round(
    interpolate(frame, [30, 150], [0, ACTIVE], CL)
  );
  const pct = interpolate(frame, [140, 180], [0, 4.6], CL);
  const scan = interpolate(frame, [10, 200], [-40, 1180], CL);

  const head = enterStyle(frame, fps, 6, { y: 24, scale: 0.96 });
  const foot = enterStyle(frame, fps, 168, { y: 20, scale: 1 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: 900 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 26,
            opacity: head.opacity,
            transform: head.transform,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "3px", color: P.faint }}>
              MỖI TOKEN ĐI QUA
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: P.text, marginTop: 8 }}>
              Chỉ một phần nhỏ bật sáng
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 900,
                lineHeight: 0.9,
                color: P.sky,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-3px",
              }}
            >
              {count}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: P.faint }}>/ {TOTAL} tỷ</div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <ParamGrid ignite igniteAt={26} step={5} />

          {/* Vệt quét */}
          <div
            style={{
              position: "absolute",
              top: -20,
              left: scan,
              width: 2,
              height: 660,
              background: `linear-gradient(180deg, transparent, ${P.sky}, transparent)`,
              opacity: 0.45,
              filter: "blur(1px)",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 34,
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            opacity: foot.opacity,
            transform: foot.transform,
          }}
        >
          <div
            style={{
              fontSize: 64,
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
          <div style={{ fontSize: 26, fontWeight: 700, color: P.dim, paddingBottom: 8 }}>
            tham số hoạt động mỗi token
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── 3. 10.500 GPU ──────────────────────────────────────────────────────────
const ROWS = 10;
const PER_ROW = 24;
const GPU_PER_ROW = 1050;

const GpuScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enterStyle(frame, fps, 6, { y: 24, scale: 0.96 });
  const total = Math.round(interpolate(frame, [20, 160], [0, 10500], CL));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 900 }}>
        <div style={{ opacity: head.opacity, transform: head.transform }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "3px", color: P.faint }}>
            ĐỂ TRAIN RA NÓ
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 10 }}>
            <div
              style={{
                fontSize: 104,
                fontWeight: 900,
                letterSpacing: "-5px",
                color: P.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {viNum(total)}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: P.amber }}>GPU GB300</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 9,
            padding: "22px 24px",
            borderRadius: 22,
            border: `1px solid ${P.line}`,
            background: "rgba(15,23,42,0.6)",
          }}
        >
          {Array.from({ length: ROWS }, (_, r) => {
            const rowDelay = 14 + r * 9;
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 74,
                    fontSize: 15,
                    fontWeight: 800,
                    color: P.faint,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {viNum(GPU_PER_ROW)}
                </div>
                <div style={{ display: "flex", gap: 6, flex: 1 }}>
                  {Array.from({ length: PER_ROW }, (_, c) => {
                    const d = rowDelay + c * 1.6;
                    const p = spring({
                      frame: Math.max(0, frame - d),
                      fps,
                      config: { damping: 14, mass: 0.5 },
                    });
                    const lit = Math.min(1, Math.max(0, p));
                    return (
                      <div
                        key={c}
                        style={{
                          flex: 1,
                          height: 20,
                          borderRadius: 4,
                          background:
                            lit > 0.05
                              ? `linear-gradient(180deg, ${P.amber}, #B45309)`
                              : "rgba(148,163,184,0.12)",
                          opacity: 0.35 + lit * 0.65,
                          boxShadow: lit > 0.05 ? `0 0 10px rgba(245,158,11,${0.4 * lit})` : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 22, fontSize: 22, color: P.faint }}>
          Mỗi hàng tượng trưng 1.050 GPU · 4 tuần pre-train + 4 tuần reinforcement learning
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── 4. CỬA SỔ 1 TRIỆU TOKEN ────────────────────────────────────────────────
const BLOCKS = 100;
const TOK_PER_BLOCK = 10000;

const ContextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = enterStyle(frame, fps, 6, { y: 24, scale: 0.96 });
  const scroll = interpolate(frame, [10, 190], [0, -260], CL);
  const n = Math.round(interpolate(frame, [16, 150], [0, 1000000], CL));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 900, overflow: "hidden" }}>
        <div style={{ opacity: head.opacity, transform: head.transform }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "3px", color: P.faint }}>
            CỬA SỔ NGỮ CẢNH
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: "-4px",
              color: P.text,
              marginTop: 8,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {viNum(n)}
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: P.green, marginTop: -4 }}>
            token
          </div>
        </div>

        {/* Dải token trôi ngang */}
        <div style={{ marginTop: 44, position: "relative", height: 210 }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              transform: `translateX(${scroll}px)`,
              width: BLOCKS * 30,
            }}
          >
            {Array.from({ length: BLOCKS }, (_, i) => {
              const p = spring({
                frame: Math.max(0, frame - (10 + i * 1.1)),
                fps,
                config: { damping: 16, mass: 0.6 },
              });
              const h = 40 + ((i * 37) % 90);
              return (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: h * Math.min(1, Math.max(0, p)),
                    borderRadius: 4,
                    background:
                      i % 7 === 0
                        ? `linear-gradient(180deg, ${P.green}, #047857)`
                        : "rgba(16,185,129,0.28)",
                    alignSelf: "flex-end",
                  }}
                />
              );
            })}
          </div>

          {/* Hai mép mờ để thấy dải dài vô tận */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${P.ink} 0%, transparent 14%, transparent 86%, ${P.ink} 100%)`,
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ marginTop: 26, fontSize: 21, color: P.faint }}>
          Mỗi khối tượng trưng 10.000 token · dải chạy tiếp, không phải toàn bộ
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── 5. THẢ WEIGHTS: APACHE 2.0 + 3 ĐỊNH DẠNG ───────────────────────────────
const FORMATS = [
  { name: "BF16", bytes: 2, note: "đầy đủ, nặng nhất" },
  { name: "FP8", bytes: 1, note: "nửa dung lượng" },
  { name: "NVFP4", bytes: 0.5, note: "nhẹ nhất" },
];

const OpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Con dấu đập xuống
  const slam = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 9, mass: 1.1 },
  });
  const ring = interpolate(frame, [12, 46], [0, 1], CL);
  const stampO = interpolate(frame, [8, 16], [0, 1], CL);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 900, position: "relative" }}>
        <div style={{ position: "relative", height: 300, display: "grid", placeItems: "center" }}>
          {/* Vòng xung kích */}
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: "50%",
              border: `2px solid ${P.green}`,
              opacity: (1 - ring) * 0.5,
              transform: `scale(${0.4 + ring * 1.5})`,
            }}
          />

          {/* Con dấu */}
          <div
            style={{
              transform: `scale(${interpolate(slam, [0, 1], [2.6, 1])}) rotate(${interpolate(
                slam,
                [0, 1],
                [-16, -6]
              )}deg)`,
              opacity: stampO,
              border: `5px solid ${P.green}`,
              borderRadius: 20,
              padding: "20px 44px",
              color: P.green,
              fontSize: 68,
              fontWeight: 900,
              letterSpacing: "2px",
              background: "rgba(16,185,129,0.08)",
              boxShadow: `0 0 60px rgba(16,185,129,0.35), inset 0 0 40px rgba(16,185,129,0.12)`,
            }}
          >
            APACHE 2.0
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 34,
            fontWeight: 800,
            color: P.text,
            textAlign: "center",
          }}
        >
          Không phí, không giới hạn thương mại
        </div>

        {/* 3 định dạng, thanh dài theo số byte thật */}
        <div style={{ marginTop: 54, display: "flex", flexDirection: "column", gap: 20 }}>
          {FORMATS.map((f, i) => {
            const s = enterStyle(frame, fps, 54 + i * 10, { y: 26, scale: 0.97 });
            const w = spring({
              frame: Math.max(0, frame - (56 + i * 10)),
              fps,
              config: { damping: 18, mass: 0.8 },
            });
            const pctW = (f.bytes / 2) * 100 * Math.min(1, Math.max(0, w));
            return (
              <div key={f.name} style={{ opacity: s.opacity, transform: s.transform }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 9,
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 900, color: P.text }}>{f.name}</div>
                  <div style={{ fontSize: 21, color: P.faint }}>{f.note}</div>
                </div>
                <div
                  style={{
                    height: 16,
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

        <div style={{ marginTop: 22, fontSize: 21, color: P.faint }}>
          Thanh dài theo số byte mỗi tham số · BF16 = 2 byte, FP8 = 1 byte, NVFP4 = 0,5 byte
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Khung chuyển cảnh ──────────────────────────────────────────────────────
const Scene: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const exitAt = Math.max(6, dur - 16);
  const inO = interpolate(frame, [0, 9], [0, 1], CL);
  const outO = interpolate(frame, [exitAt, dur], [1, 0], CL);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
        opacity: Math.min(inO, outO),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ─── Composition ────────────────────────────────────────────────────────────
const SCENES = [
  { id: "cover", dur: 150, tint: P.violet },
  { id: "awake", dur: 240, tint: P.sky },
  { id: "gpu", dur: 180, tint: P.amber },
  { id: "context", dur: 165, tint: P.green },
  { id: "open", dur: 195, tint: P.green },
  { id: "outro", dur: 150, tint: P.blue },
];

export const BEAM_FRAMES = SCENES.reduce((n, s) => n + s.dur, 0);

export const BeamVideo: React.FC = () => {
  let acc = 0;
  const timed = SCENES.map((s) => {
    const item = { ...s, from: acc };
    acc += s.dur;
    return item;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: P.ink, fontFamily: FONT }}>
      {timed.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          <MotionBackground tint={s.tint} />
          <Scene dur={s.dur}>
            {s.id === "cover" && <BeamCover />}
            {s.id === "awake" && <AwakeScene />}
            {s.id === "gpu" && <GpuScene />}
            {s.id === "context" && <ContextScene />}
            {s.id === "open" && <OpenScene />}
            {s.id === "outro" && (
              <OutroMark cta="Theo dõi Nexo Studio" sub="Tin AI, kể trong 35 giây" />
            )}
          </Scene>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
