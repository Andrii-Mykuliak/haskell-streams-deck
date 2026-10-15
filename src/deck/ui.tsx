import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, F } from "./theme";
import { mix, POP, SpringCfg, useSteps } from "./steps";

type Dir = "up" | "down" | "left" | "right" | "scale" | "none";

export const useAppear = (step = 0, delay = 0, dir: Dir = "up", dist = 36, cfg?: SpringCfg, exit?: number) => {
  const { s } = useSteps();
  const p = s(step, delay, cfg);
  const out = exit === undefined ? 0 : s(exit, 0);
  const off = (1 - p) * dist;
  const transform =
    dir === "up" ? `translateY(${off}px)`
    : dir === "down" ? `translateY(${-off}px)`
    : dir === "left" ? `translateX(${-off}px)`
    : dir === "right" ? `translateX(${off}px)`
    : dir === "scale" ? `scale(${mix(0.8, 1, p)})`
    : undefined;
  return { opacity: Math.min(1, p) * (1 - out), transform, p };
};

export const Appear: React.FC<{
  step?: number;
  delay?: number;
  dir?: Dir;
  dist?: number;
  pop?: boolean;
  exit?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ step = 0, delay = 0, dir = "up", dist, pop, exit, style, children }) => {
  const a = useAppear(step, delay, dir, dist, pop ? POP : undefined, exit);
  return <div style={{ ...style, opacity: a.opacity, transform: a.transform }}>{children}</div>;
};

/** Absolutely positioned, animated block. */
export const At: React.FC<{
  x: number;
  y: number;
  w?: number;
  step?: number;
  delay?: number;
  dir?: Dir;
  dist?: number;
  pop?: boolean;
  exit?: number;
  size?: number;
  weight?: number;
  color?: string;
  font?: string;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, w, step, delay, dir, dist, pop, exit, size = 40, weight = 700, color = C.text, font = F.body, align, style, children }) => (
  <Appear
    step={step}
    delay={delay}
    dir={dir}
    dist={dist}
    pop={pop}
    exit={exit}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      lineHeight: 1.3,
      textAlign: align,
      ...style,
    }}
  >
    {children}
  </Appear>
);

/** Accent-coloured span. */
export const A: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.accentHi }) => (
  <span style={{ color: c }}>{children}</span>
);

/** Inline monospace. */
export const M: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = C.mint }) => (
  <span style={{ fontFamily: F.mono, color: c, fontWeight: 600, fontVariantLigatures: "none" }}>{children}</span>
);

export const Lead: React.FC<{ children: React.ReactNode; step?: number; delay?: number; y?: number; size?: number; w?: number }> = ({
  children,
  step = 0,
  delay = 10,
  y = 200,
  size = 38,
  w = 1720,
}) => (
  <At x={96} y={y} w={w} step={step} delay={delay} size={size} weight={700}>
    {children}
  </At>
);

const Stripes: React.FC = () => {
  const { s } = useSteps();
  const p1 = s(0, 0);
  const p2 = s(0, 5);
  return (
    <svg width={200} height={60} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${(p1 - 1) * 80}, ${(p1 - 1) * 60})`}>
        <polygon points="16,0 48,0 90,52 58,52" fill={C.blue} transform="translate(-20,-18)" />
      </g>
      <g transform={`translate(${(p2 - 1) * 80}, ${(p2 - 1) * 60})`}>
        <polygon points="64,0 96,0 138,52 106,52" fill={C.mint} transform="translate(-4,-18)" />
      </g>
    </svg>
  );
};

export const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { s } = useSteps();
  const p = s(0, 2);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 52,
        fontFamily: F.head,
        fontSize: 56,
        fontWeight: 400,
        color: C.text,
        letterSpacing: 0.5,
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Slide: React.FC<{ title?: React.ReactNode; children?: React.ReactNode; bg?: string }> = ({ title, children, bg = C.bg }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: F.body, color: C.text, overflow: "hidden" }}>
    <Stripes />
    {title ? <Title>{title}</Title> : null}
    {children}
  </AbsoluteFill>
);

/** Rounded chip with monospace content. */
export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, color = C.mint, bg = C.panel, border = C.line, size = 40, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `${size * 0.22}px ${size * 0.45}px`,
      borderRadius: size * 0.3,
      background: bg,
      border: `3px solid ${border}`,
      fontFamily: F.mono,
      fontWeight: 600,
      fontSize: size,
      color,
      whiteSpace: "pre",
      lineHeight: 1.2,
      fontVariantLigatures: "none",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pop-in ✓ / ✗ badge. */
export const Mark: React.FC<{ ok: boolean; step: number; delay?: number; size?: number; x: number; y: number }> = ({
  ok,
  step,
  delay = 0,
  size = 52,
  x,
  y,
}) => {
  const { s, t } = useSteps();
  const p = s(step, delay, POP);
  const shake = ok ? 0 : Math.sin(Math.max(0, t(step, delay)) * 1.6) * 8 * Math.max(0, 1 - t(step, delay) / 18);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size,
        background: ok ? "rgba(134,224,168,0.18)" : "rgba(239,107,107,0.18)",
        border: `3px solid ${ok ? C.mint : C.red}`,
        color: ok ? C.mint : C.red,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.6,
        fontWeight: 800,
        fontFamily: F.body,
        opacity: Math.min(1, p),
        transform: `translateX(${shake}px) scale(${p})`,
      }}
    >
      {ok ? "✓" : "✗"}
    </div>
  );
};

/** SVG arrow that draws itself. */
export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  step: number;
  delay?: number;
  dur?: number;
  color?: string;
  width?: number;
  curve?: number;
}> = ({ x1, y1, x2, y2, step, delay = 0, dur = 18, color = C.dim, width = 4, curve = 0 }) => {
  const { lin } = useSteps();
  const p = lin(step, delay, dur);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * curve;
  const cy = my + (dx / len) * curve;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  const L = len * (1 + Math.abs(curve) / len);
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const head = 16;
  const pts = [
    [x2, y2],
    [x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45)],
    [x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45)],
  ]
    .map((q) => q.join(","))
    .join(" ");
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
      <polygon points={pts} fill={color} opacity={interpolate(p, [0.85, 1], [0, 1], { extrapolateLeft: "clamp" })} />
    </svg>
  );
};

export const HaskellLogo: React.FC<{ size: number; p1?: number; p2?: number; p3?: number }> = ({ size, p1 = 1, p2 = 1, p3 = 1 }) => (
  <svg width={size} height={(size * 12) / 17} viewBox="0 0 17 12" style={{ overflow: "visible" }}>
    <g transform={`translate(${(p1 - 1) * 6}, 0)`} opacity={p1}>
      <path fill="#453a62" d="M0,12 L4,6 L0,0 L3,0 L7,6 L3,12 Z" />
    </g>
    <g transform={`translate(0, ${(p2 - 1) * 6})`} opacity={p2}>
      <path fill="#5e5086" d="M4,12 L8,6 L4,0 L7,0 L15,12 L12,12 L9.5,8.25 L7,12 Z" />
    </g>
    <g transform={`translate(${(1 - p3) * 6}, 0)`} opacity={p3}>
      <path fill="#8f4e8b" d="M13.66,8.5 L12.33,6.5 L17,6.5 L17,8.5 Z M11.66,5.5 L10.33,3.5 L17,3.5 L17,5.5 Z" />
    </g>
  </svg>
);
