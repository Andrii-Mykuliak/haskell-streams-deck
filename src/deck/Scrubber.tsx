import { Thumbnail } from "@remotion/player";
import React, { useRef, useState } from "react";
import { SLIDES } from "../slides";
import { SlideRoot } from "./SlideRoot";
import { stopsOf, totalOf } from "./steps";
import { C, F, FPS, H, W } from "./theme";

const HIT = 14;
const PREVIEW_W = 360;
const PREVIEW_H = (PREVIEW_W * H) / W;

/** Progress bar along the bottom edge: drag it to pick a slide, a thumbnail previews where it will land. */
export const Scrubber: React.FC<{ progress: number; current: number; onSeek: (slide: number) => void }> = ({ progress, current, onSeek }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const n = SLIDES.length;
  const dragging = target !== null;
  const active = dragging || x !== null;

  const indexAt = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const u = Math.min(Math.max((clientX - r.left) / r.width, 0), 0.99999);
    return Math.floor(u * n);
  };

  const shown = dragging ? target! : x !== null ? indexAt(x) : current;
  const def = SLIDES[shown];
  const thick = active ? 8 : 3;
  const popupLeft = x === null ? 0 : Math.min(Math.max(x - PREVIEW_W / 2, 8), window.innerWidth - PREVIEW_W - 8);

  return (
    <>
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          setX(e.clientX);
          setTarget(indexAt(e.clientX));
        }}
        onPointerMove={(e) => {
          setX(e.clientX);
          if (dragging) setTarget(indexAt(e.clientX));
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (dragging && target !== current) onSeek(target!);
          setTarget(null);
        }}
        onPointerCancel={() => setTarget(null)}
        onPointerLeave={() => {
          if (!dragging) setX(null);
        }}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: HIT, cursor: "pointer", zIndex: 11 }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: thick, background: active ? "rgba(255,255,255,0.08)" : "transparent", transition: "height 150ms ease" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: thick,
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${C.blue}, ${C.mint})`,
            opacity: active ? 0.85 : 0.55,
            transition: dragging ? "height 150ms ease" : "width 300ms ease, height 150ms ease",
          }}
        />
        {active && (
          <div
            style={{
              position: "absolute",
              left: `${(shown / n) * 100}%`,
              width: `${100 / n}%`,
              bottom: 0,
              height: thick,
              background: "rgba(255,255,255,0.35)",
            }}
          />
        )}
        {active &&
          Array.from({ length: n - 1 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: `${((i + 1) / n) * 100}%`, bottom: 0, width: 1, height: thick, background: "rgba(10,12,20,0.7)" }} />
          ))}
      </div>
      {active && x !== null && (
        <div
          style={{
            position: "absolute",
            left: popupLeft,
            bottom: HIT + 10,
            width: PREVIEW_W,
            borderRadius: 12,
            overflow: "hidden",
            background: C.panel,
            border: `1px solid ${C.line}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            pointerEvents: "none",
            zIndex: 12,
          }}
        >
          {dragging && (
            <Thumbnail
              component={SlideRoot}
              inputProps={{ index: shown }}
              compositionWidth={W}
              compositionHeight={H}
              durationInFrames={totalOf(def.steps)}
              frameToDisplay={stopsOf(def.steps)[def.steps.length - 1]}
              fps={FPS}
              style={{ width: PREVIEW_W, height: PREVIEW_H, display: "block" }}
            />
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "7px 12px", fontFamily: F.body, fontSize: 14, color: C.text }}>
            <span style={{ fontFamily: F.mono, color: C.dim, whiteSpace: "nowrap" }}>{`${shown + 1} / ${n}`}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{def.title}</span>
          </div>
        </div>
      )}
    </>
  );
};
