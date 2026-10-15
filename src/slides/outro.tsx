import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, F } from "../deck/theme";
import { POP, SlideDef, useSteps } from "../deck/steps";
import { clamp01, useClock } from "./common";

type NodeId = "S1" | "S2" | "S3" | "F1" | "M1" | "Z" | "FOLD";
type GNode = { x: number; y: number; w: number; label: string; color: string };

const NODES: Record<NodeId, GNode> = {
  S1: { x: 1000, y: 250, w: 170, label: "[1..]", color: C.lav },
  S2: { x: 1000, y: 520, w: 170, label: "readFile", color: C.lav },
  S3: { x: 1000, y: 790, w: 170, label: "getLine", color: C.lav },
  F1: { x: 1260, y: 330, w: 140, label: "filter", color: C.amber },
  M1: { x: 1260, y: 710, w: 140, label: "map", color: C.amber },
  Z: { x: 1480, y: 520, w: 150, label: "zipWith", color: C.pink },
  FOLD: { x: 1720, y: 520, w: 150, label: "foldr", color: C.mint },
};

const EDGES: [NodeId, NodeId][] = [
  ["S1", "F1"],
  ["S2", "M1"],
  ["S3", "M1"],
  ["F1", "Z"],
  ["M1", "Z"],
  ["Z", "FOLD"],
];

type Pt = { x: number; y: number };
type Bez = [Pt, Pt, Pt, Pt];

const bez = (a: NodeId, b: NodeId): Bez => {
  const p0 = { x: NODES[a].x + NODES[a].w / 2, y: NODES[a].y };
  const p3 = { x: NODES[b].x - NODES[b].w / 2, y: NODES[b].y };
  const dx = (p3.x - p0.x) / 2;
  return [p0, { x: p0.x + dx, y: p0.y }, { x: p3.x - dx, y: p3.y }, p3];
};

const at = ([p0, p1, p2, p3]: Bez, u: number): Pt => {
  const v = 1 - u;
  return {
    x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x,
    y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y,
  };
};

const lenOf = (b: Bez) => {
  let L = 0;
  let prev = at(b, 0);
  for (let i = 1; i <= 24; i++) {
    const q = at(b, i / 24);
    L += Math.hypot(q.x - prev.x, q.y - prev.y);
    prev = q;
  }
  return L;
};

const PATHS: { nodes: NodeId[]; offset: number; drops: boolean }[] = [
  { nodes: ["S1", "F1", "Z", "FOLD"], offset: 0, drops: true },
  { nodes: ["S2", "M1", "Z", "FOLD"], offset: 0.23, drops: false },
  { nodes: ["S3", "M1", "Z", "FOLD"], offset: 0.46, drops: false },
];

const SEGS = PATHS.map((p) => p.nodes.slice(1).map((n, i) => bez(p.nodes[i], n)));
const SEG_LEN = SEGS.map((ss) => ss.map(lenOf));
const TOTAL = SEG_LEN.map((ls) => ls.reduce((a, b) => a + b, 0));
const SPEED = 300;
const PERIOD = 0.7;
const START = 1.0;
const BURST = 0.8;
const TRAIL = 7;

const posAlong = (pi: number, d: number) => {
  let rest = d;
  for (let i = 0; i < SEGS[pi].length; i++) {
    if (rest <= SEG_LEN[pi][i]) {
      return { seg: i, p: at(SEGS[pi][i], rest / SEG_LEN[pi][i]) };
    }
    rest -= SEG_LEN[pi][i];
  }
  return null;
};

const isDropped = (pi: number, k: number) => PATHS[pi].drops && k % 3 === 2;

const rnd = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const DUST = Array.from({ length: 90 }, (_, i) => ({
  x: rnd(i) * 1920,
  y: rnd(i + 100) * 1080,
  r: 0.8 + rnd(i + 200) * 2.4,
  v: 8 + rnd(i + 300) * 26,
  ph: rnd(i + 400) * 6.28,
  c: [C.lav, C.accentHi, C.mint, C.amber, C.pink][i % 5],
}));

const SEG_COLOR = [C.lav, C.amber, C.pink];

const Outro: React.FC = () => {
  const { s, frame: f, fps } = useSteps();
  const clock = useClock();
  const t = Math.max(f / fps, clock);
  const credit = s(0, 90);
  const sweep = interpolate(f, [100, 150], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const graph = s(0, 30);

  const letters = (str: string, base: number) =>
    str.split("").map((ch, i) => {
      const p = s(0, base + i * 2, POP);
      return (
        <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 50}px)` }}>
          {ch}
        </span>
      );
    });

  const glow: Partial<Record<NodeId, number>> = {};
  const bump = (n: NodeId, v: number) => {
    glow[n] = Math.max(glow[n] ?? 0, v);
  };
  const particles: React.ReactNode[] = [];
  const sparks: React.ReactNode[] = [];
  let arrived = 0;
  let lastArrival = -10;

  PATHS.forEach((path, pi) => {
    const base = START + path.offset;
    const life = TOTAL[pi] / SPEED;
    const kLast = Math.floor((t - base) / PERIOD);
    if (kLast < 0) {
      return;
    }
    const kDone = Math.floor((t - base - life) / PERIOD);
    if (kDone >= 0) {
      arrived += kDone + 1 - (path.drops ? Math.floor((kDone + 1) / 3) : 0);
    }
    const kFirst = Math.max(0, kLast - Math.ceil((life + BURST) / PERIOD) - 1);
    for (let k = kFirst; k <= kLast; k++) {
      const age = t - (base + k * PERIOD);
      const d = age * SPEED;
      const drop = isDropped(pi, k);
      const dropAt = SEG_LEN[pi][0];
      let cum = 0;
      path.nodes.forEach((n, ni) => {
        if (ni > 0) {
          cum += SEG_LEN[pi][ni - 1];
        }
        if (drop && ni > 1) {
          return;
        }
        bump(n, Math.max(0, 1 - Math.abs(d - cum) / 60));
      });
      if (d >= TOTAL[pi]) {
        if (drop) {
          continue;
        }
        const since = age - life;
        lastArrival = Math.max(lastArrival, t - since);
        if (since < BURST) {
          const p = since / BURST;
          const cx = NODES.FOLD.x;
          const cy = NODES.FOLD.y;
          sparks.push(
            <circle key={`ring-${pi}-${k}`} cx={cx} cy={cy} r={60 + 120 * p} fill="none" stroke={C.mint} strokeWidth={3 * (1 - p)} opacity={0.7 * (1 - p)} />,
          );
          for (let j = 0; j < 12; j++) {
            const ang = (j / 12) * Math.PI * 2 + rnd(pi * 31 + k) * 6.28;
            const rr = 70 + 150 * (1 - (1 - p) * (1 - p)) * (0.7 + 0.5 * rnd(j + k * 13));
            sparks.push(
              <circle
                key={`sp-${pi}-${k}-${j}`}
                cx={cx + Math.cos(ang) * rr}
                cy={cy + Math.sin(ang) * rr * 0.75}
                r={3.2 * (1 - p) + 0.6}
                fill={j % 3 === 0 ? C.amber : C.mint}
                opacity={1 - p}
              />,
            );
          }
        }
        continue;
      }
      if (drop && d > dropAt) {
        const fade = (d - dropAt) / 120;
        if (fade < 1) {
          const q = at(SEGS[pi][0], 1);
          for (let j = 0; j < 7; j++) {
            const ang = Math.PI * (0.15 + 0.7 * (j / 6));
            const rr = 70 * fade;
            sparks.push(
              <circle
                key={`dr-${pi}-${k}-${j}`}
                cx={q.x + Math.cos(ang) * rr}
                cy={q.y + Math.sin(ang) * rr + 90 * fade * fade}
                r={3 * (1 - fade) + 0.5}
                fill={C.red}
                opacity={1 - fade}
              />,
            );
          }
        }
        continue;
      }
      const head = posAlong(pi, d);
      if (!head) {
        continue;
      }
      const c = SEG_COLOR[head.seg];
      for (let j = TRAIL; j >= 1; j--) {
        const tp = posAlong(pi, d - j * 9);
        if (tp) {
          particles.push(<circle key={`tr-${pi}-${k}-${j}`} cx={tp.p.x} cy={tp.p.y} r={8.5 * (1 - j / (TRAIL + 1))} fill={c} opacity={0.5 * (1 - j / (TRAIL + 1))} />);
        }
      }
      particles.push(
        <g key={`p-${pi}-${k}`}>
          <circle cx={head.p.x} cy={head.p.y} r={24} fill={c} opacity={0.2} />
          <circle cx={head.p.x} cy={head.p.y} r={9.5} fill={c} />
          <circle cx={head.p.x} cy={head.p.y} r={3.8} fill="#ffffff" opacity={0.9} />
        </g>,
      );
    }
  });
  const foldKick = Math.exp(-(t - lastArrival) * 5);
  bump("FOLD", foldKick);

  const blobs = [
    { x: 1350 + 160 * Math.sin(t * 0.21), y: 420 + 120 * Math.cos(t * 0.17), c: "141,118,220", a: 0.22 },
    { x: 1650 + 140 * Math.cos(t * 0.15 + 1), y: 650 + 140 * Math.sin(t * 0.19 + 2), c: "178,95,168", a: 0.18 },
    { x: 420 + 180 * Math.sin(t * 0.13 + 3), y: 760 + 100 * Math.cos(t * 0.23), c: "134,224,168", a: 0.1 },
    { x: 1180 + 120 * Math.cos(t * 0.11 + 4), y: 820 + 90 * Math.sin(t * 0.16 + 1), c: "242,193,125", a: 0.1 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x - 520,
            top: b.y - 520,
            width: 1040,
            height: 1040,
            borderRadius: 520,
            background: `radial-gradient(circle, rgba(${b.c},${b.a}) 0%, rgba(${b.c},0) 65%)`,
            opacity: graph,
          }}
        />
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {DUST.map((d, i) => (
          <circle
            key={i}
            cx={(d.x + t * d.v) % 1920}
            cy={d.y + Math.sin(t * 0.6 + d.ph) * 10}
            r={d.r}
            fill={d.c}
            opacity={(0.12 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.7 + d.ph))) * graph}
          />
        ))}
      </svg>

      <div style={{ position: "absolute", left: 90, top: 150, fontFamily: F.head, fontWeight: 800, fontSize: 104, lineHeight: 1.12, color: C.text }}>
        <div>{letters("Дякую", 6)}</div>
        <div>{letters("за увагу!", 18)}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 430,
          height: 6,
          width: 440 * s(0, 36),
          borderRadius: 3,
          background: `linear-gradient(90deg, ${C.accent}, ${C.pink})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 480,
          width: 720,
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.3,
          color: C.dim,
          opacity: clamp01(s(0, 50)),
          transform: `translateY(${(1 - s(0, 50)) * 20}px)`,
        }}
      >
        Хороша програма описує <span style={{ color: C.accentHi }}>залежності</span> між даними.
      </div>

      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: graph }}>
        <defs>
          {EDGES.map(([a, b], i) => {
            const [p0, , , p3] = bez(a, b);
            return (
              <linearGradient key={i} id={`eg${i}`} gradientUnits="userSpaceOnUse" x1={p0.x} y1={p0.y} x2={p3.x} y2={p3.y}>
                <stop offset="0%" stopColor={NODES[a].color} />
                <stop offset="100%" stopColor={NODES[b].color} />
              </linearGradient>
            );
          })}
        </defs>
        {EDGES.map(([a, b], i) => {
          const [p0, p1, p2, p3] = bez(a, b);
          const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={`url(#eg${i})`} strokeWidth={14} opacity={0.12} strokeLinecap="round" />
              <path d={d} fill="none" stroke={`url(#eg${i})`} strokeWidth={2.5} opacity={0.55} strokeLinecap="round" />
              <path d={d} fill="none" stroke={`url(#eg${i})`} strokeWidth={4} strokeDasharray="3 21" strokeDashoffset={-(t * 110) % 24} strokeLinecap="round" />
            </g>
          );
        })}
        <circle
          cx={NODES.FOLD.x}
          cy={NODES.FOLD.y}
          r={104}
          fill="none"
          stroke={C.mint}
          strokeWidth={2}
          strokeDasharray="10 16"
          opacity={0.45 + 0.4 * foldKick}
          transform={`rotate(${t * 36} ${NODES.FOLD.x} ${NODES.FOLD.y})`}
        />
        <circle
          cx={NODES.FOLD.x}
          cy={NODES.FOLD.y}
          r={124}
          fill="none"
          stroke={C.amber}
          strokeWidth={1.5}
          strokeDasharray="4 22"
          opacity={0.35}
          transform={`rotate(${-t * 24} ${NODES.FOLD.x} ${NODES.FOLD.y})`}
        />
        {particles}
        {sparks}
      </svg>

      {(Object.keys(NODES) as NodeId[]).map((id, i) => {
        const n = NODES[id];
        const p = s(0, 30 + i * 5, POP);
        const g = clamp01(glow[id] ?? 0);
        const h = id === "FOLD" ? 78 : 62;
        const breathe = 1 + 0.015 * Math.sin(t * 2.2 + i);
        return (
          <div
            key={id}
            style={{
              position: "absolute",
              left: n.x - n.w / 2,
              top: n.y - h / 2,
              width: n.w,
              height: h,
              borderRadius: id === "FOLD" ? 22 : 31,
              border: `3px solid ${n.color}`,
              background: `linear-gradient(180deg, ${n.color}${g > 0.05 ? "33" : "14"}, ${C.panel})`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: id === "FOLD" ? 28 : 24,
              color: g > 0.4 ? "#ffffff" : n.color,
              fontVariantLigatures: "none",
              boxShadow: `0 0 ${10 + 40 * g}px ${n.color}, inset 0 0 ${6 + 16 * g}px ${n.color}55`,
              opacity: clamp01(p),
              transform: `scale(${(0.6 + 0.4 * p) * breathe * (1 + 0.1 * g)})`,
            }}
          >
            {n.label}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: NODES.FOLD.x - 120,
          width: 240,
          top: NODES.FOLD.y + 140,
          textAlign: "center",
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 48,
          color: C.mint,
          textShadow: `0 0 ${10 + 26 * foldKick}px ${C.mint}`,
          opacity: clamp01(s(0, 70)),
          transform: `scale(${1 + 0.28 * foldKick})`,
        }}
      >
        {arrived}
      </div>
      <div
        style={{
          position: "absolute",
          left: NODES.FOLD.x - 120,
          width: 240,
          top: NODES.FOLD.y + 202,
          textAlign: "center",
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 22,
          color: C.dim,
          opacity: clamp01(s(0, 74)),
        }}
      >
        накопичено
      </div>

      <div style={{ position: "absolute", left: 96, top: 900, opacity: credit, transform: `translateY(${(1 - credit) * 16}px)` }}>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 2,
            backgroundImage: `linear-gradient(100deg, ${C.dim} 0%, ${C.dim} ${sweep - 12}%, #ffffff ${sweep}%, ${C.dim} ${sweep + 12}%, ${C.dim} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          made with Claude Opus 5.5
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const outroSlide: SlideDef = { id: "thanks", title: "Дякую за увагу", steps: [300], C: Outro };
