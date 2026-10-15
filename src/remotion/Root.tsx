import React from "react";
import { Composition } from "remotion";
import { SlideRoot } from "../deck/SlideRoot";
import { stopsOf, totalOf } from "../deck/steps";
import { FPS, H, W } from "../deck/theme";
import { SLIDES } from "../slides";

// Remotion Studio: every slide as its own composition, for scrubbing while designing.
export const Root: React.FC = () => (
  <>
    {SLIDES.map((s, i) => (
      <Composition
        key={s.id}
        id={`s${String(i + 1).padStart(2, "0")}-${s.id}`}
        component={SlideRoot}
        defaultProps={{ index: i, stops: stopsOf(s.steps) }}
        durationInFrames={totalOf(s.steps)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
  </>
);
