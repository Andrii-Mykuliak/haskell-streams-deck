import React, { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type SlideDef = {
  id: string;
  title: string;
  /** Duration (frames) of each step. Step 0 plays automatically when the slide opens. */
  steps: number[];
  C: React.FC;
};

export const startsOf = (steps: number[]) => {
  const out: number[] = [];
  let acc = 0;
  for (const d of steps) {
    out.push(acc);
    acc += d;
  }
  return out;
};

/** Frame the player pauses on after step i has finished. */
export const stopsOf = (steps: number[]) => {
  const s = startsOf(steps);
  return steps.map((d, i) => s[i] + d);
};

export const totalOf = (steps: number[]) => steps.reduce((a, b) => a + b, 0) + 1;

const StepCtx = createContext<number[]>([0]);
export const StepProvider = StepCtx.Provider;

export const SMOOTH = { damping: 200 };
export const POP = { damping: 13, stiffness: 170, mass: 0.9 };

export type SpringCfg = Partial<{ damping: number; stiffness: number; mass: number }>;

export function useSteps() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starts = useContext(StepCtx);

  /** Frames elapsed since step i (+delay) began; negative before it. */
  const t = (i: number, delay = 0) => frame - (starts[i] ?? 0) - delay;
  /** Spring 0→1 starting at step i + delay. */
  const s = (i: number, delay = 0, config: SpringCfg = SMOOTH, durationInFrames?: number) =>
    spring({ frame: Math.max(0, t(i, delay)), fps, config, durationInFrames });
  /** Linear 0→1 over `dur` frames starting at step i + delay. */
  const lin = (i: number, delay = 0, dur = 20) =>
    interpolate(t(i, delay), [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return { frame, fps, t, s, lin };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
