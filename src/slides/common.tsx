import React, { useEffect, useState } from "react";
import { C, F } from "../deck/theme";
import { mix } from "../deck/steps";

/** Seconds since the slide mounted; keeps running while the player is paused. */
export const useClock = () => {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      setSec((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return sec;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * A list cell. While `force` < 1 it is a dashed thunk with a "?"; at `force` = 1 it is a solid value.
 * `appear` scales it in, `dim` fades it out (a filtered-away element).
 */
export const Cell: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: React.ReactNode;
  appear?: number;
  force?: number;
  dim?: number;
  glow?: number;
  color?: string;
  size?: number;
  thunkLabel?: React.ReactNode;
}> = ({ x, y, w = 80, h = 64, label, appear = 1, force = 1, dim = 0, glow = 0, color = C.mint, size, thunkLabel = "?" }) => {
  const a = clamp01(appear);
  const f = clamp01(force);
  const fs = size ?? Math.round(h * 0.46);
  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: F.mono,
    fontWeight: 700,
    fontSize: fs,
    fontVariantLigatures: "none",
    boxSizing: "border-box",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: a * (1 - 0.78 * clamp01(dim)),
        transform: `scale(${mix(0.6, 1, a)})`,
      }}
    >
      <div style={{ ...face, border: `3px dashed ${C.faint}`, color: C.faint, opacity: 1 - f }}>{thunkLabel}</div>
      <div
        style={{
          ...face,
          border: `3px solid ${color}`,
          background: `${color}22`,
          color,
          opacity: f,
          transform: `scale(${mix(0.7, 1, f)})`,
          boxShadow: glow > 0 ? `0 0 ${26 * glow}px ${color}` : undefined,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Numbered square, the same marker the agenda uses. */
export const Num: React.FC<{ n: number; size?: number; style?: React.CSSProperties }> = ({ n, size = 56, style }) => (
  <div
    style={{
      width: size * 1.14,
      height: size,
      borderRadius: 8,
      background: n % 2 ? C.pink : "#5e5086",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: F.body,
      fontWeight: 800,
      fontSize: size * 0.6,
      color: C.text,
      flexShrink: 0,
      ...style,
    }}
  >
    {n}
  </div>
);

/** Rounded panel that rises in with `p`. */
export const Card: React.FC<{ x: number; y: number; w: number; h: number; p: number; children: React.ReactNode }> = ({ x, y, w, h, p, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 20,
      background: C.panel,
      border: `3px solid ${C.line}`,
      opacity: clamp01(p),
      transform: `translateY(${(1 - p) * 40}px)`,
      padding: "34px 40px",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

/** Monospace label for a row of cells. */
export const RowLabel: React.FC<{ x: number; y: number; h?: number; p: number; children: React.ReactNode; color?: string }> = ({
  x,
  y,
  h = 64,
  p,
  children,
  color = C.dim,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      height: h,
      display: "flex",
      alignItems: "center",
      fontFamily: F.mono,
      fontWeight: 600,
      fontSize: 30,
      color,
      whiteSpace: "pre",
      fontVariantLigatures: "none",
      opacity: clamp01(p),
      transform: `translateX(${(1 - p) * -20}px)`,
    }}
  >
    {children}
  </div>
);

/** Triangular glow that peaks `peak` frames after `tt` reaches 0; zero before that. */
export const pulse = (tt: number, peak: number, width: number) => (tt < 0 ? 0 : Math.max(0, 1 - Math.abs(tt - peak) / width));
