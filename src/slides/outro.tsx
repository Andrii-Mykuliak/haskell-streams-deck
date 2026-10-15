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
  Z: { x: 1480, y: 520, w: 150, label: "zipWith", color: C.amber },
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
  { nodes: ["S2", "M1", "Z", "FOLD"], offset: 0.47, drops: false },
  { nodes: ["S3", "M1", "Z", "FOLD"], offset: 0.93, drops: false },
];

const SEGS = PATHS.map((p) => p.nodes.slice(1).map((n, i) => bez(p.nodes[i], n)));
const SEG_LEN = SEGS.map((ss) => ss.map(lenOf));
const TOTAL = SEG_LEN.map((ls) => ls.reduce((a, b) => a + b, 0));
const SPEED = 240;
const PERIOD = 1.4;
const START = 1.2;

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

const DUST = Array.from({ length: 46 }, (_, i) => ({
  x: rnd(i) * 1920,
  y: rnd(i + 100) * 1080,
  r: 1 + rnd(i + 200) * 2.2,
  v: 6 + rnd(i + 300) * 16,
  ph: rnd(i + 400) * 6.28,
  c: [C.lav, C.accentHi, C.mint, C.amber][i % 4],
}));

const SEG_COLOR = [C.lav, C.amber, C.amber];

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
  let arrived = 0;
  let foldPulse = 0;

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
    const kFirst = Math.max(0, kLast - Math.ceil(life / PERIOD) - 1);
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
        bump(n, Math.max(0, 1 - Math.abs(d - cum) / 50));
      });
      if (d >= TOTAL[pi]) {
        if (!drop) {
          foldPulse = Math.max(foldPulse, Math.exp(-(age - life) * 4));
        }
        continue;
      }
      if (drop && d > dropAt) {
        const fade = (d - dropAt) / 60;
        if (fade < 1) {
          const q = at(SEGS[pi][0], 1);
          particles.push(
            <g key={`${pi}-${k}`} opacity={1 - fade}>
              <circle cx={q.x + 8 * fade} cy={q.y + 40 * fade * fade} r={7} fill={C.red} />
            </g>,
          );
        }
        continue;
      }
      const pos = posAlong(pi, d);
      if (!pos) {
        continue;
      }
      const c = SEG_COLOR[pos.seg];
      particles.push(
        <g key={`${pi}-${k}`}>
          <circle cx={pos.p.x} cy={pos.p.y} r={15} fill={c} opacity={0.18} />
          <circle cx={pos.p.x} cy={pos.p.y} r={6.5} fill={c} />
        </g>,
      );
    }
  });
  bump("FOLD", foldPulse);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 50%, rgba(242,193,125,0.08) 0%, rgba(141,118,220,0.10) 32%, ${C.bg} 64%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {DUST.map((d, i) => (
          <circle
            key={i}
            cx={(d.x + t * d.v) % 1920}
            cy={d.y}
            r={d.r}
            fill={d.c}
            opacity={(0.1 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.ph))) * graph}
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
          width: 700,
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
        {EDGES.map(([a, b], i) => {
          const [p0, p1, p2, p3] = bez(a, b);
          return (
            <path
              key={i}
              d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`}
              fill="none"
              stroke={C.line}
              strokeWidth={3}
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
          );
        })}
        {particles}
      </svg>

      {(Object.keys(NODES) as NodeId[]).map((id, i) => {
        const n = NODES[id];
        const p = s(0, 30 + i * 5, POP);
        const g = clamp01(glow[id] ?? 0);
        const h = id === "FOLD" ? 74 : 62;
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
              background: g > 0.02 ? `rgba(33,39,56,${1 - 0.3 * g})` : C.panel,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 24,
              color: n.color,
              fontVariantLigatures: "none",
              boxShadow: g > 0.02 ? `0 0 ${34 * g}px ${n.color}` : undefined,
              opacity: clamp01(p),
              transform: `scale(${(0.6 + 0.4 * p) * (1 + 0.06 * g)})`,
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
          top: NODES.FOLD.y + 56,
          textAlign: "center",
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 40,
          color: C.mint,
          textShadow: `0 0 ${18 * foldPulse}px ${C.mint}`,
          opacity: clamp01(s(0, 70)),
        }}
      >
        {arrived}
      </div>
      <div
        style={{
          position: "absolute",
          left: NODES.FOLD.x - 120,
          width: 240,
          top: NODES.FOLD.y + 108,
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
