import React, { useEffect, useRef } from "react";

export type Tool = "none" | "laser" | "pen" | "highlighter" | "spotlight";
export type Screen = "none" | "black" | "white";

export const INK = [
  { c: "#ff4d4d", name: "червоний" },
  { c: "#ffd84d", name: "жовтий" },
  { c: "#86e0a8", name: "м'ятний" },
  { c: "#ffffff", name: "білий" },
];

type Pt = { x: number; y: number };
type Stroke = { pts: Pt[]; color: string; hl: boolean; endAt?: number };

const HL_HOLD = 1500;
const HL_FADE = 700;

/**
 * Presenter overlay: laser pointer, pen, fading highlighter, spotlight and black/white screens.
 * Points are stored normalised to the viewport so drawings survive a resize.
 */
export const PresenterLayer: React.FC<{ tool: Tool; ink: number; screen: Screen; clearKey: string }> = ({ tool, ink, screen, clearKey }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const mouse = useRef<Pt | null>(null);
  const trail = useRef<(Pt & { t: number })[]>([]);
  const spotR = useRef(200);
  const toolRef = useRef(tool);
  toolRef.current = tool;

  // Drawings belong to a slide (and are wiped with `c`).
  useEffect(() => {
    strokes.current = [];
    current.current = null;
  }, [clearKey]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const p = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      mouse.current = p;
      if (toolRef.current === "laser") trail.current.push({ ...p, t: performance.now() });
    };
    const onLeave = () => (mouse.current = null);
    const onWheel = (e: WheelEvent) => {
      if (toolRef.current !== "spotlight") return;
      spotR.current = Math.min(600, Math.max(80, spotR.current - e.deltaY * 0.3));
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const draw = (now: number) => {
      const cv = canvas.current;
      if (cv) {
        const dpr = window.devicePixelRatio || 1;
        const W = window.innerWidth;
        const H = window.innerHeight;
        if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
          cv.width = Math.round(W * dpr);
          cv.height = Math.round(H * dpr);
        }
        const ctx = cv.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const unit = H / 1080;

        const m = mouse.current;
        const t = toolRef.current;

        if (t === "spotlight" && m) {
          const r = spotR.current * unit;
          ctx.save();
          ctx.fillStyle = "rgba(5,6,10,0.8)";
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = "destination-out";
          const g = ctx.createRadialGradient(m.x * W, m.y * H, r * 0.82, m.x * W, m.y * H, r);
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(m.x * W, m.y * H, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        strokes.current = strokes.current.filter((s) => !(s.hl && s.endAt && now - s.endAt > HL_HOLD + HL_FADE));
        const all = current.current ? [...strokes.current, current.current] : strokes.current;
        for (const s of all) {
          const fade = s.hl && s.endAt ? Math.min(1, Math.max(0, 1 - (now - s.endAt - HL_HOLD) / HL_FADE)) : 1;
          ctx.globalAlpha = (s.hl ? 0.38 : 1) * fade;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = (s.hl ? 30 : 6) * unit;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          const pts = s.pts.map((p) => ({ x: p.x * W, y: p.y * H }));
          ctx.moveTo(pts[0].x, pts[0].y);
          if (pts.length === 1) ctx.lineTo(pts[0].x + 0.1, pts[0].y);
          for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
          }
          if (pts.length > 1) ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        if (t === "laser") {
          trail.current = trail.current.filter((p) => now - p.t < 240);
          const tr = trail.current;
          ctx.save();
          ctx.lineCap = "round";
          ctx.shadowColor = "#ff2a2a";
          ctx.shadowBlur = 14 * unit;
          for (let i = 1; i < tr.length; i++) {
            const age = (now - tr[i].t) / 240;
            ctx.globalAlpha = Math.max(0, 1 - age) * 0.8;
            ctx.strokeStyle = "#ff3b3b";
            ctx.lineWidth = 9 * unit * (1 - age * 0.6);
            ctx.beginPath();
            ctx.moveTo(tr[i - 1].x * W, tr[i - 1].y * H);
            ctx.lineTo(tr[i].x * W, tr[i].y * H);
            ctx.stroke();
          }
          if (m) {
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 26 * unit;
            ctx.fillStyle = "#ff2a2a";
            ctx.beginPath();
            ctx.arc(m.x * W, m.y * H, 10 * unit, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffd6d6";
            ctx.beginPath();
            ctx.arc(m.x * W, m.y * H, 4 * unit, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drawing = tool === "pen" || tool === "highlighter";
  const pt = (e: React.PointerEvent) => ({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });

  return (
    <>
      <canvas
        ref={canvas}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: drawing ? "auto" : "none",
          touchAction: "none",
          cursor: drawing ? "crosshair" : undefined,
        }}
        onClick={(e) => drawing && e.stopPropagation()}
        onPointerDown={(e) => {
          if (!drawing || e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          current.current = { pts: [pt(e)], color: INK[ink].c, hl: tool === "highlighter" };
        }}
        onPointerMove={(e) => {
          if (current.current) current.current.pts.push(pt(e));
        }}
        onPointerUp={() => {
          if (!current.current) return;
          current.current.endAt = performance.now();
          strokes.current.push(current.current);
          current.current = null;
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: screen === "white" ? "#ffffff" : "#000000",
          opacity: screen === "none" ? 0 : 1,
          transition: "opacity 250ms ease",
        }}
      />
    </>
  );
};
