import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Palette ─────────────────────────────────────────────────────────────────
export const P = {
  ink: "#070A12",
  blue: "#3B82F6",
  sky: "#38BDF8",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  violet: "#8B5CF6",
  text: "#F8FAFC",
  dim: "rgba(248,250,252,0.62)",
  faint: "rgba(248,250,252,0.32)",
  panel: "rgba(15,23,42,0.78)",
  line: "rgba(148,163,184,0.20)",
};

// Font: ưu tiên Noto Sans (CI có sẵn qua fonts-noto), fallback Segoe UI trên Windows.
// Không set fontFamily -> Chrome headless render ra serif, trông như tài liệu Word.
export const FONT =
  "'Be Vietnam Pro', 'Noto Sans', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";

const clampBoth = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

/**
 * Pure helper (không dùng hook) để gọi được trong .map() mà không vi phạm rules of hooks.
 * Trả về opacity + transform của một khối trượt vào bằng spring.
 */
export const enterStyle = (
  frame: number,
  fps: number,
  delay = 0,
  opts: {
    damping?: number;
    mass?: number;
    y?: number;
    x?: number;
    scale?: number;
  } = {}
) => {
  const { damping = 15, mass = 0.7, y = 36, x = 0, scale = 0.92 } = opts;
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping, mass },
  });
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

// ─── Background: lưới trôi + quầng sáng di chuyển ────────────────────────────
export const MotionBackground: React.FC<{ tint?: string }> = ({ tint = P.blue }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const gridY = (frame * 0.55) % 96;
  const gridX = (frame * 0.22) % 96;

  const orb = (ampX: number, ampY: number, speed: number, phase: number) => ({
    x: Math.sin(t * speed + phase) * ampX,
    y: Math.cos(t * speed * 0.8 + phase) * ampY,
  });

  const o1 = orb(70, 50, 0.42, 0);
  const o2 = orb(60, 80, 0.31, 2.1);
  const o3 = orb(40, 60, 0.55, 4.2);

  return (
    <AbsoluteFill style={{ backgroundColor: P.ink, overflow: "hidden" }}>
      {/* Lưới kỹ thuật, trôi chậm + mờ dần về rìa */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.075) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          backgroundPosition: `${gridX}px ${gridY}px`,
          maskImage: "radial-gradient(circle at 50% 42%, #000 0%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 42%, #000 0%, transparent 74%)",
        }}
      />

      {/* Quầng sáng */}
      <div
        style={{
          position: "absolute",
          top: 120 + o1.y,
          left: -240 + o1.x,
          width: 880,
          height: 880,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tint}4D 0%, transparent 66%)`,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160 + o2.y,
          right: -260 + o2.x,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${P.green}40 0%, transparent 66%)`,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 760 + o3.y,
          left: 300 + o3.x,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${P.violet}33 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
      />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, transparent 40%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Kinetic text: từng từ bật lên ───────────────────────────────────────────
export const KineticText: React.FC<{
  text: string;
  fontSize?: number;
  delay?: number;
  step?: number;
  align?: "center" | "left";
  color?: string;
  weight?: number;
}> = ({
  text,
  fontSize = 62,
  delay = 8,
  step = 3,
  align = "center",
  color = P.text,
  weight = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = String(text || "").split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `${Math.round(fontSize * 0.26)}px`,
        fontSize,
        fontWeight: weight,
        lineHeight: 1.18,
        color,
        letterSpacing: "-0.5px",
        textShadow: "0 6px 26px rgba(0,0,0,0.65)",
      }}
    >
      {words.map((w, i) => {
        const s = enterStyle(frame, fps, delay + i * step, {
          y: 40,
          scale: 0.86,
          damping: 13,
        });
        return (
          <span
            key={`${w}-${i}`}
            style={{ opacity: s.opacity, transform: s.transform, display: "inline-block" }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ─── UI MOCKUP: cửa sổ ứng dụng thật, hàng dữ liệu tự đổ vào ─────────────────
const UI_ROWS = [
  { icon: "◧", name: "Đơn hàng mới", meta: "#1024 · vừa xong", status: "Đã đồng bộ", color: P.green },
  { icon: "◉", name: "Khách hàng mới", meta: "Form website", status: "Đã tạo CRM", color: P.sky },
  { icon: "◈", name: "Nhắc thanh toán", meta: "Tự động · 09:00", status: "Đã gửi", color: P.amber },
  { icon: "▤", name: "Báo cáo tuần", meta: "Tự động · Thứ 2", status: "Hoàn tất", color: P.green },
];

export const UIWindow: React.FC<{ caption?: string }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shell = enterStyle(frame, fps, 14, { y: 46, scale: 0.94, damping: 16 });
  const livePulse = 0.55 + Math.sin(frame * 0.22) * 0.45;

  // Sparkline vẽ dần
  const sparkProgress = interpolate(frame, [40, 90], [0, 1], clampBoth);
  const pts = [18, 30, 24, 42, 38, 58, 52, 72, 88];
  const sparkPath = pts
    .map((v, i) => `${(i / (pts.length - 1)) * 720},${100 - v}`)
    .join(" ");

  return (
    <div
      style={{
        width: 900,
        borderRadius: 30,
        background: P.panel,
        border: "1.5px solid rgba(59,130,246,0.35)",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.62), 0 0 60px rgba(59,130,246,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
        overflow: "hidden",
        opacity: shell.opacity,
        transform: shell.transform,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 26px",
          borderBottom: `1px solid ${P.line}`,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ width: 13, height: 13, borderRadius: 99, background: P.red }} />
        <div style={{ width: 13, height: 13, borderRadius: 99, background: P.amber }} />
        <div style={{ width: 13, height: 13, borderRadius: 99, background: P.green }} />
        <div
          style={{
            marginLeft: 18,
            fontSize: 22,
            fontWeight: 700,
            color: P.dim,
            letterSpacing: "0.3px",
          }}
        >
          Nexo Studio · Quản trị vận hành
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 99,
            background: "rgba(16,185,129,0.14)",
            border: "1px solid rgba(16,185,129,0.45)",
            fontSize: 19,
            fontWeight: 800,
            color: "#34D399",
          }}
        >
          <span style={{ opacity: livePulse }}>●</span> Live
        </div>
      </div>

      {/* Thân: rail trái + danh sách */}
      <div style={{ display: "flex", minHeight: 400 }}>
        <div
          style={{
            width: 84,
            borderRight: `1px solid ${P.line}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            padding: "24px 0",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {["▦", "◉", "▤", "⚙"].map((g, i) => {
            const s = enterStyle(frame, fps, 18 + i * 4, { y: 0, x: -14, scale: 0.8 });
            return (
              <div
                key={g}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  color: i === 0 ? P.text : P.dim,
                  background: i === 0 ? "rgba(59,130,246,0.28)" : "rgba(255,255,255,0.05)",
                  border: i === 0 ? "1px solid rgba(96,165,250,0.5)" : "1px solid rgba(148,163,184,0.18)",
                  opacity: s.opacity,
                  transform: s.transform,
                }}
              >
                {g}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: "22px 26px" }}>
          {/* Header nhỏ */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: P.text }}>Luồng tự động</div>
            <div style={{ fontSize: 20, color: P.faint, fontWeight: 600 }}>Hôm nay</div>
          </div>

          {UI_ROWS.map((row, i) => {
            const s = enterStyle(frame, fps, 22 + i * 8, { y: 26, x: 18, scale: 1 });
            return (
              <div
                key={row.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  marginBottom: 10,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.045)",
                  border: `1px solid ${P.line}`,
                  opacity: s.opacity,
                  transform: s.transform,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    color: row.color,
                    background: `${row.color}22`,
                    border: `1px solid ${row.color}55`,
                  }}
                >
                  {row.icon}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: P.text }}>{row.name}</div>
                  <div style={{ fontSize: 18, color: P.faint, marginTop: 2 }}>{row.meta}</div>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: row.color,
                    padding: "6px 14px",
                    borderRadius: 99,
                    background: `${row.color}1F`,
                    border: `1px solid ${row.color}4D`,
                  }}
                >
                  ✓ {row.status}
                </div>
              </div>
            );
          })}

          {/* Sparkline */}
          <svg width="100%" height="110" viewBox="0 0 720 110" style={{ marginTop: 6 }}>
            <defs>
              <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={P.blue} />
                <stop offset="100%" stopColor={P.sky} />
              </linearGradient>
            </defs>
            <polyline
              points={sparkPath}
              fill="none"
              stroke="url(#spark)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={900}
              strokeDashoffset={900 * (1 - sparkProgress)}
            />
          </svg>
        </div>
      </div>

      {caption ? (
        <div
          style={{
            padding: "16px 26px 22px",
            borderTop: `1px solid ${P.line}`,
            fontSize: 24,
            color: P.dim,
            textAlign: "left",
            lineHeight: 1.35,
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};

// ─── DATA CHART: cột mọc lên + số đếm ───────────────────────────────────────
const BARS = [
  { label: "Nhập liệu", before: 96, after: 22 },
  { label: "Xử lý đơn", before: 88, after: 34 },
  { label: "Báo cáo", before: 92, after: 26 },
  { label: "Chăm khách", before: 80, after: 40 },
];

export const BarChart: React.FC<{ caption?: string }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const head = enterStyle(frame, fps, 10, { y: 26, scale: 0.95 });
  const chartH = 380;

  return (
    <div style={{ width: 900, textAlign: "left" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 18,
          opacity: head.opacity,
          transform: head.transform,
        }}
      >
        <div>
          <div style={{ fontSize: 20, color: P.faint, fontWeight: 700, letterSpacing: "2px" }}>
            THỜI GIAN THAO TÁC THỦ CÔNG
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: P.text, marginTop: 6 }}>
            Trước và sau khi tự động hóa
          </div>
        </div>
        <div
          style={{
            fontSize: 17,
            color: P.faint,
            border: `1px solid ${P.line}`,
            borderRadius: 99,
            padding: "5px 14px",
          }}
        >
          Mô phỏng
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: chartH,
          borderRadius: 26,
          background: "rgba(15,23,42,0.66)",
          border: `1px solid ${P.line}`,
          padding: "26px 26px 0",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          gap: 18,
        }}
      >
        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <div
            key={g}
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              bottom: `${g * 100}%`,
              height: 1,
              background: P.line,
            }}
          />
        ))}

        {BARS.map((b, i) => {
          const hBefore = spring({
            frame: Math.max(0, frame - (20 + i * 5)),
            fps,
            config: { damping: 16, mass: 0.9 },
          });
          const hAfter = spring({
            frame: Math.max(0, frame - (34 + i * 5)),
            fps,
            config: { damping: 15, mass: 0.9 },
          });

          return (
            <div
              key={b.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  height: chartH - 120,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: (b.before / 100) * (chartH - 150) * hBefore,
                    borderRadius: "10px 10px 4px 4px",
                    background: "rgba(148,163,184,0.28)",
                    border: "1px solid rgba(148,163,184,0.35)",
                  }}
                />
                <div
                  style={{
                    width: 52,
                    height: (b.after / 100) * (chartH - 150) * hAfter,
                    borderRadius: "10px 10px 4px 4px",
                    background: `linear-gradient(180deg, ${P.green} 0%, ${P.sky} 100%)`,
                    boxShadow: "0 0 26px rgba(16,185,129,0.45)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bottom: (b.after / 100) * (chartH - 150) * hAfter + 10,
                    fontSize: 21,
                    fontWeight: 800,
                    color: P.green,
                    opacity: hAfter,
                  }}
                >
                  {b.after}%
                </div>
              </div>
              <div style={{ fontSize: 26, color: P.dim, fontWeight: 700 }}>{b.label}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 26,
          marginTop: 16,
          fontSize: 19,
          color: P.faint,
          opacity: head.opacity,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(148,163,184,0.4)" }} />
          Thủ công
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i style={{ width: 16, height: 16, borderRadius: 4, background: P.green }} />
          Tự động hóa
        </span>
      </div>

      {caption ? (
        <div style={{ marginTop: 14, fontSize: 26, color: P.dim, lineHeight: 1.4 }}>{caption}</div>
      ) : null}
    </div>
  );
};

// ─── WORKFLOW: node nối nhau, đường vẽ dần, hạt sáng chạy ────────────────────
const NODES = [
  { label: "Khách gửi form", sub: "Website / Zalo", color: P.blue, icon: "✉" },
  { label: "Hệ thống xử lý", sub: "Đồng bộ CRM", color: P.violet, icon: "⚙" },
  { label: "Thông báo & báo cáo", sub: "Tự động gửi", color: P.green, icon: "✓" },
];

export const WorkflowFlow: React.FC<{ caption?: string }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodeGap = 150;
  const top = 20;
  const lineTop = top + 62;
  const lineBottom = top + nodeGap * (NODES.length - 1) + 62;

  const draw = interpolate(frame, [14, 62], [0, 1], clampBoth);
  const lineLen = lineBottom - lineTop;
  const pulseY = interpolate(frame % 90, [0, 90], [lineTop, lineBottom]);

  return (
    <div style={{ width: 900, textAlign: "left" }}>
      <div style={{ position: "relative", paddingTop: top }}>
        {/* Đường nối */}
        <svg
          width="100%"
          height={lineBottom + 40}
          viewBox={`0 0 900 ${lineBottom + 40}`}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
        >
          <line
            x1={76}
            y1={lineTop}
            x2={76}
            y2={lineBottom}
            stroke="rgba(148,163,184,0.22)"
            strokeWidth={4}
          />
          <line
            x1={76}
            y1={lineTop}
            x2={76}
            y2={lineBottom}
            stroke={P.sky}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={lineLen}
            strokeDashoffset={lineLen * (1 - draw)}
          />
          {draw > 0.98 ? (
            <circle cx={76} cy={pulseY} r={7} fill={P.sky} opacity={0.95}>
              <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite" />
            </circle>
          ) : null}
        </svg>

        {NODES.map((n, i) => {
          const s = enterStyle(frame, fps, 18 + i * 16, { x: 26, y: 0, scale: 0.94 });
          const done = draw >= (i + 1) / NODES.length;
          return (
            <div
              key={n.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                height: nodeGap,
                opacity: s.opacity,
                transform: s.transform,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 22,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 30,
                  color: n.color,
                  background: `radial-gradient(circle at 30% 25%, ${n.color}44, rgba(15,23,42,0.9))`,
                  border: `2px solid ${n.color}77`,
                  boxShadow: done ? `0 0 34px ${n.color}66` : "none",
                  flexShrink: 0,
                }}
              >
                {n.icon}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "20px 26px",
                  borderRadius: 20,
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${done ? `${n.color}66` : P.line}`,
                  boxShadow: done ? `0 12px 40px ${n.color}22` : "none",
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 800, color: P.text }}>{n.label}</div>
                <div style={{ fontSize: 20, color: P.faint, marginTop: 4 }}>{n.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {caption ? (
        <div style={{ marginTop: 10, fontSize: 26, color: P.dim, lineHeight: 1.4 }}>{caption}</div>
      ) : null}
    </div>
  );
};

// ─── BEFORE / AFTER: chia đôi, bên trái rối, bên phải gọn ───────────────────
export const SplitCompare: React.FC<{ caption?: string }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const divider = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 18, mass: 0.8 } });
  const left = enterStyle(frame, fps, 14, { x: -50, y: 0, scale: 0.95 });
  const right = enterStyle(frame, fps, 26, { x: 50, y: 0, scale: 0.95 });

  const chaos = [0, 1, 2].map((i) => ({
    x: Math.sin(frame * 0.55 + i * 1.7) * 5,
    y: Math.cos(frame * 0.42 + i * 2.1) * 4,
    r: Math.sin(frame * 0.3 + i) * 1.2,
  }));

  return (
    <div style={{ width: 900 }}>
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "stretch",
          borderRadius: 26,
          overflow: "hidden",
          border: `1px solid ${P.line}`,
          background: "rgba(15,23,42,0.6)",
          minHeight: 420,
        }}
      >
        {/* TRƯỚC */}
        <div
          style={{
            flex: 1,
            padding: "28px 24px",
            background: "linear-gradient(180deg, rgba(239,68,68,0.16), rgba(239,68,68,0.04))",
            opacity: left.opacity,
            transform: left.transform,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: P.red,
              letterSpacing: "2px",
              marginBottom: 16,
            }}
          >
            ✕ TRƯỚC ĐÂY
          </div>
          {["Bảng tính rời rạc", "Tin nhắn thất lạc", "Nhập liệu 2 lần"].map((t, i) => (
            <div
              key={t}
              style={{
                transform: `translate(${chaos[i].x}px, ${chaos[i].y}px) rotate(${chaos[i].r}deg)`,
                padding: "14px 16px",
                marginBottom: 12,
                borderRadius: 12,
                background: "rgba(239,68,68,0.14)",
                border: "1px dashed rgba(239,68,68,0.5)",
                fontSize: 22,
                color: "rgba(255,255,255,0.82)",
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 26 }}>⚠</span> Sót đơn, chậm phản hồi
          </div>
        </div>

        {/* Vách chia */}
        <div
          style={{
            width: 3,
            background: `linear-gradient(180deg, transparent, ${P.sky}, transparent)`,
            transform: `scaleY(${divider})`,
            transformOrigin: "center",
          }}
        />

        {/* SAU */}
        <div
          style={{
            flex: 1,
            padding: "28px 24px",
            background: "linear-gradient(180deg, rgba(16,185,129,0.16), rgba(16,185,129,0.04))",
            opacity: right.opacity,
            transform: right.transform,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: P.green,
              letterSpacing: "2px",
              marginBottom: 16,
            }}
          >
            ✓ VỚI PHẦN MỀM
          </div>
          {["Một nguồn dữ liệu duy nhất", "Đơn tự động vào hệ thống", "Báo cáo tự chạy"].map(
            (t, i) => {
              const s = enterStyle(frame, fps, 34 + i * 7, { x: 20, y: 0, scale: 1 });
              return (
                <div
                  key={t}
                  style={{
                    opacity: s.opacity,
                    transform: s.transform,
                    padding: "14px 16px",
                    marginBottom: 12,
                    borderRadius: 12,
                    background: "rgba(16,185,129,0.16)",
                    border: "1px solid rgba(16,185,129,0.5)",
                    fontSize: 22,
                    color: "rgba(255,255,255,0.94)",
                    fontWeight: 700,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: P.green, fontSize: 20 }}>✓</span> {t}
                </div>
              );
            }
          )}
        </div>
      </div>

      {caption ? (
        <div style={{ marginTop: 14, fontSize: 26, color: P.dim, lineHeight: 1.4 }}>{caption}</div>
      ) : null}
    </div>
  );
};

// ─── NEWS CARD: khung phát sóng — góc ngắm, vòng quét, ma trận điểm, ticker ──
export const NewsCard: React.FC<{ badge?: string; caption?: string }> = ({ badge, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = enterStyle(frame, fps, 12, { y: 44, scale: 0.94, damping: 16 });
  const scan = (frame * 1.5) % 100;
  const ringRotate = frame * 0.5;

  const cols = 15;
  const rows = 8;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const phase = (r * 0.7 + c * 0.45) * 1.1;
      const a = 0.10 + (Math.sin(frame * 0.09 - phase) * 0.5 + 0.5) * 0.32;
      dots.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: 5,
            height: 5,
            borderRadius: 99,
            background: `rgba(125,211,252,${a})`,
          }}
        />
      );
    }
  }

  const ticker = caption ? `${caption}   •   ` : "";
  const tickerShift = -((frame * 2.6) % 1600);

  const bracket = (pos: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 34,
        height: 34,
        borderColor: "rgba(125,211,252,0.75)",
        borderStyle: "solid",
        borderWidth: 0,
        ...pos,
      }}
    />
  );

  return (
    <div style={{ width: 900, textAlign: "left" }}>
      <div
        style={{
          position: "relative",
          height: 500,
          borderRadius: 28,
          overflow: "hidden",
          border: "1.5px solid rgba(56,189,248,0.32)",
          background:
            "radial-gradient(120% 90% at 18% 8%, rgba(59,130,246,0.40), transparent 58%), radial-gradient(90% 80% at 88% 92%, rgba(139,92,246,0.36), transparent 60%), #0A1120",
          boxShadow: "0 40px 90px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.06)",
          opacity: card.opacity,
          transform: card.transform,
        }}
      >
        {/* Ma trận điểm nhấp nháy */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            placeItems: "center",
            padding: "26px 30px",
            maskImage: "radial-gradient(circle at 50% 50%, #000 30%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 30%, transparent 78%)",
          }}
        >
          {dots}
        </div>

        {/* Vòng quét xoay */}
        <svg
          width="900"
          height="500"
          viewBox="0 0 900 500"
          style={{ position: "absolute", inset: 0 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={450}
              cy={250}
              r={104 + i * 56}
              fill="none"
              stroke={`rgba(148,197,255,${0.30 - i * 0.055})`}
              strokeWidth={2}
              strokeDasharray={`${10 + i * 6} ${18 + i * 8}`}
              transform={`rotate(${ringRotate + i * 14} 450 250)`}
            />
          ))}
          <circle
            cx={450}
            cy={250}
            r={104}
            fill="rgba(56,189,248,0.06)"
            stroke="rgba(125,211,252,0.5)"
            strokeWidth={2.5}
          />
        </svg>

        {/* Góc ngắm */}
        {bracket({ top: 20, left: 20, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 })}
        {bracket({ top: 20, right: 20, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 })}
        {bracket({ bottom: 76, left: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 })}
        {bracket({ bottom: 76, right: 20, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 })}

        {/* Sóng quét */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scan}%`,
            height: 3,
            background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.9), transparent)",
            boxShadow: "0 0 26px rgba(56,189,248,0.75)",
          }}
        />

        {/* Chip chuyên mục + LIVE */}
        {badge ? (
          <div
            style={{
              position: "absolute",
              top: 34,
              left: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 99,
              background: "rgba(7,10,18,0.7)",
              border: "1px solid rgba(56,189,248,0.5)",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "2px",
              color: "#7DD3FC",
            }}
          >
            {badge}
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            top: 34,
            right: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 99,
            background: "rgba(239,68,68,0.16)",
            border: "1px solid rgba(239,68,68,0.5)",
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: "1.5px",
            color: "#FCA5A5",
          }}
        >
          <span style={{ opacity: 0.45 + Math.sin(frame * 0.28) * 0.55 }}>●</span> LIVE
        </div>

        {/* Ticker chạy dưới đáy */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 58,
            borderTop: "1px solid rgba(56,189,248,0.28)",
            background: "rgba(7,10,18,0.72)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              transform: `translateX(${tickerShift}px)`,
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(226,232,240,0.82)",
              letterSpacing: "0.4px",
            }}
          >
            {`${ticker}${ticker}${ticker}`}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── OUTRO: logo vẽ nét + vòng xung + nút CTA ───────────────────────────────
export const OutroMark: React.FC<{ cta?: string; sub?: string }> = ({ cta, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = interpolate(frame, [0, 26], [0, 1], clampBoth);
  const ring = (frame % 70) / 70;
  const btn = enterStyle(frame, fps, 18, { y: 30, scale: 0.92 });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 26,
        width: 900,
      }}
    >
      <div style={{ position: "relative", width: 190, height: 190 }}>
        {[0, 1].map((i) => {
          const p = (ring + i * 0.5) % 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 44,
                border: `2px solid rgba(96,165,250,${0.5 * (1 - p)})`,
                transform: `scale(${1 + p * 0.55})`,
              }}
            />
          );
        })}
        <svg width={190} height={190} viewBox="0 0 190 190">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={P.sky} />
              <stop offset="100%" stopColor={P.violet} />
            </linearGradient>
          </defs>
          <rect
            x={5}
            y={5}
            width={180}
            height={180}
            rx={44}
            fill="rgba(59,130,246,0.12)"
            stroke="rgba(96,165,250,0.5)"
            strokeWidth={2}
          />
          {/* Chữ N vẽ nét */}
          <polyline
            points="62,132 62,58 128,132 128,58"
            fill="none"
            stroke="url(#logoGrad)"
            strokeWidth={13}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={260}
            strokeDashoffset={260 * (1 - draw)}
          />
        </svg>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "26px 54px",
          borderRadius: 60,
          background: `linear-gradient(135deg, ${P.amber} 0%, #D97706 100%)`,
          color: "#1A1205",
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: "-0.4px",
          boxShadow: "0 24px 60px rgba(245,158,11,0.45), inset 0 2px 0 rgba(255,255,255,0.35)",
          transform: `${btn.transform} scale(${1 + Math.sin(frame * 0.1) * 0.018})`,
          opacity: btn.opacity,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {cta || "Nhắn tin cho Nexo Studio"}
        {/* Vệt sáng chạy qua */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 90,
            left: `${((frame % 60) / 60) * 140 - 20}%`,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
            transform: "skewX(-18deg)",
          }}
        />
      </div>

      {sub ? (
        <div
          style={{
            fontSize: 24,
            color: P.dim,
            fontWeight: 700,
            letterSpacing: "0.4px",
            opacity: btn.opacity,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
